import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { review } from "@/schemas/properties";
import { ReviewErrors } from "@/types/errors";

const schema = {
  querystring: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
      skip: { type: "number", minimum: 0 },
      limit: { type: "number", minimum: 0 },
      sort: {
        type: "string",
        enum: ["createdAt", "-createdAt", "rate", "-rate", "reply", "-reply"],
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: review,
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetReviews: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/",
    schema,
    async handler(request, reply) {
      const user = request.user;
      const { companyId, skip, limit, sort } = request.query;
      const company = await fastify.resources.companyService.getCompanyById(
        companyId
      );
      if (!company) {
        return reply
          .code(400)
          .send({ code: ReviewErrors.CompanyNotFound })
      }
      try {
        const withoutReported =
          company?.user.toString() === user?.id.toString();

        let createdBefore = undefined;
        if (!company?.isActiveSubscription) {
          createdBefore = company?.subscriptionDeactivatedAt || new Date();
        }

        const { data, total } =
          await fastify.resources.reviewService.getReviews({
            companyId,
            skip,
            limit,
            sort,
            withoutReported,
            createdBefore,
          });

        return {
          data: normalizeArrayForReply(data),
          meta: {
            total,
          },
        };
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return reply
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
