import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { ReviewErrors } from "@/types/errors";

const schema = {
  params: {
    type: "object",
    required: ["reviewId"],
    properties: {
      reviewId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {},
    },
  },
} as const;

export const routeOfDenyReport: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "POST",
    url: "/:reviewId/deny-report",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { reviewId } = request.params;

      try {
        const review = await fastify.resources.reviewService.getReviewById(
          reviewId
        );

        if (!review) {
          return reply.code(404).send({ code: ReviewErrors.ReviewNotFound });
        }

        const permissions = getRolePermissions(user.role);
        if (!permissions.canWorkWitchReports) {
          return reply.code(403).send({ code: ReviewErrors.Forbidden });
        }

        review.reportedAt = undefined;
        review.anonymousReports = [];
        await review.save();

        return {};
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return reply
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
