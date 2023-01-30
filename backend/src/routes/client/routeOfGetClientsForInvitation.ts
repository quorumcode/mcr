import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { ClientErrors } from "@/types/errors";

const schema = {
  querystring: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
      skip: { type: "number", minimum: 0 },
      limit: { type: "number", minimum: 0 },
      batchId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
            alredyInvited: { type: "number" },
            uploadSuccess: {
              type: "string",
              enum: ["full", "partial", "none"],
            },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetClientsForInvitation: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{ Querystring: FromSchema<typeof schema.querystring> }>({
    method: "GET",
    url: "/for-invitation",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const companyId = request.query.companyId;
      const batchId = request.query.batchId;

      let company;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          companyId
        );
      } catch (e) {
        fastify.log.error(e, ClientErrors.ClientUnhandledError);
        return reply
          .code(500)
          .send({ code: ClientErrors.ClientUnhandledError });
      }
      if (!company) {
        return reply.code(400).send({ code: ClientErrors.CompanyNotFound });
      }

      if (company.isRemoved) {
        return reply.code(400).send({ code: ClientErrors.CompanyRemoved });
      }

      if (!company.isActiveSubscription) {
        return reply.code(400).send({ code: ClientErrors.SubscriptionExpired });
      }

      if (user.id !== company.user.toString()) {
        return reply.code(403).send({ code: ClientErrors.Forbidden });
      }

      const { data, total } =
        await fastify.resources.invitationService.getClientsForInvitation({
          companyId,
          skip: request.query.skip,
          limit: request.query.limit,
          batchId,
        });

      const alredyInvitedCount =
        await fastify.resources.invitationService.getAlredyInvitedCount({
          companyId,
          batchId,
        });

      let uploadSuccess = "full";

      if (alredyInvitedCount > 0) {
        uploadSuccess = "partial";
      }

      if (total <= 0) {
        uploadSuccess = "none";
      }

      return {
        data: normalizeArrayForReply(data),
        meta: {
          total,
          alredyInvited: alredyInvitedCount,
          uploadSuccess,
        },
      };
    },
  });
};
