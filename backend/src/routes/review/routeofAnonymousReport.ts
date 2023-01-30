import { ServiceError } from "@/services/ServiceError";
import { ReviewErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
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
      fingerprint: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {},
    },
  },
} as const;

export const routeOfAnonymousReport: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/:reviewId/anonymous-report",
    schema,
    async handler(request, response) {
      const { reviewId } = request.params;
      const { fingerprint } = request.body;

      const reportReason = removeExtraWhiteSpaces(request.body.reportReason);

      const review = await fastify.resources.reviewService.getReviewById(
        reviewId
      );

      if (!review) {
        return response.code(404).send({ code: ReviewErrors.ReviewNotFound });
      }

      try {
        await fastify.resources.reviewService.patchAnonymousReport(
          review,
          reportReason,
          fingerprint
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === ReviewErrors.ReportSubmissionLimit) {
            return response
              .code(409)
              .send({ code: ReviewErrors.ReportSubmissionLimit });
          }
        }
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return response
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }

      return {};
    },
  });
};
