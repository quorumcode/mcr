import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { review } from "@/schemas/properties";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { ReviewErrors } from "@/types/errors";

const schema = {
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

export const routeOfGetReportedReviews: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/reported",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { skip, limit } = request.query;

      try {
        const permissions = getRolePermissions(user.role);
        if (!permissions.canWorkWitchReports) {
          return reply.code(403).send({ code: ReviewErrors.Forbidden });
        }

        const { data, total } =
          await fastify.resources.reviewService.getReportedReviews({
            skip,
            limit,
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
