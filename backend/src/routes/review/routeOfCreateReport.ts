import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { ReviewErrors } from "@/types/errors";
import { removeExtraWhiteSpaces } from "@/helpers/helpFunctions";

const schema = {
  params: {
    type: "object",
    required: ["reviewId"],
    properties: {
      reviewId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["reportReason"],
    properties: {
      reportReason: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {},
    },
  },
} as const;

export const routeOfCreateReport: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/:reviewId/report",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, response) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { reviewId } = request.params;
      const reportReason = removeExtraWhiteSpaces(request.body.reportReason);

      try {
        const review = await fastify.resources.reviewService.getReviewById(
          reviewId
        );

        if (!review) {
          return response.code(404).send({ code: ReviewErrors.ReviewNotFound });
        }

        if (review.company.user.toString() !== user._id.toString()) {
          return response.code(403).send({ code: ReviewErrors.Forbidden });
        }

        review.reportReason = reportReason;
        review.reportedAt = new Date();
        await review.save();

        return {};
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return response
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
