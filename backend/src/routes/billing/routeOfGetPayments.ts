import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { PaymentStatus } from "@/types/common";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { BillingErrors } from "@/types/errors";

export const schema = {
  querystring: {
    type: "object",
    properties: {
      skip: { type: "number", minimum: 0 },
      limit: { type: "number", minimum: 0 },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["data", "meta"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: [
              "id",
              "createdAt",
              "amount",
              "currency",
              "status",
              "url",
            ],
            properties: {
              id: { type: "string" },
              createdAt: { type: "string" },
              amount: { type: "number" },
              currency: { type: "string" },
              status: {
                type: "string",
                enum: Object.values(PaymentStatus) as PaymentStatus[],
              },
              url: { type: "string" },
            },
          },
        },
        meta: {
          type: "object",
          required: ["total"],
          properties: {
            total: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetPayments: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Querystring: FromSchema<typeof schema.querystring> }>({
    method: "GET",
    url: "/payments",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      const company = await fastify.resources.companyService.getCompanyByUser(
        user.id
      );

      if (!company) {
        return reply.code(400).send({ code: BillingErrors.CompanyNotFound });
      }

      try {
        const { data, total } =
          await fastify.resources.billingService.getPayments({
            companyId: company.id,
            limit: request.query.limit || 20,
            skip: request.query.skip || 0,
          });

        return {
          data: normalizeArrayForReply(data),
          meta: {
            total,
          },
        };
      } catch (e) {
        fastify.log.error(e, BillingErrors.BillingUnhandledError);
        return reply
          .code(500)
          .send({ code: BillingErrors.BillingUnhandledError });
      }
    },
  });
};
