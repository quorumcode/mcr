import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { checkBannedWords } from "@/helpers/checkBannedWords";
import { ReviewErrors } from "@/types/errors";

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
    required: ["reviewToken", "rate", "message"],
    properties: {
      reviewToken: { type: "string" },
      rate: {
        type: "integer",
        minimum: 1,
        maximum: 5,
      },
      message: {
        type: "string",
        maxLength: 3000,
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {},
    },
  },
} as const;

export const routeOfUpdateReview: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/:reviewId",
    schema,
    async handler(request, reply) {
      const { reviewId } = request.params;
      const { reviewToken, rate, message } = request.body;

      try {
        const reviewTokenDoc =
          await fastify.resources.invitationService.getReviewTokenInfoByValue(
            reviewToken
          );

        if (!reviewTokenDoc) {
          return reply.status(400).send({ code: ReviewErrors.InvalidToken });
        }

        const review = await fastify.resources.reviewService.getReviewById(
          reviewId
        );
        if (!review) {
          return reply.code(404).send({ code: ReviewErrors.ReviewNotFound });
        }
        if (review.client.id !== reviewTokenDoc.client.id) {
          return reply.status(400).send({ code: ReviewErrors.InvalidToken });
        }
        if (review.company.id !== reviewTokenDoc.company.id) {
          return reply.status(400).send({ code: ReviewErrors.InvalidToken });
        }

        const checkMessageResult = checkBannedWords(message);
        if (checkMessageResult.isProfane) {
          return reply.status(400).send({
            code: ReviewErrors.MessageIsProfane,
            matches: checkMessageResult.matches,
          });
        }

        review.rate = rate;
        review.message = message;
        await review.save();

        const notificationEmail =
          rate > 2
            ? review.company.emailForReviewNotifications
            : review.company.emailForNegativeReviewAlerts;

        if (notificationEmail) {
          await fastify.resources.mailService.sgSendReviewNotification(
            notificationEmail,
            {
              replyUrl: fastify.resources.urlBuilder.getViewReviewUrl(
                review.company.id,
                review.id
              ),
              clientName: review.client.name || "",
              rate,
              message,
              date: review.createdAt,
            }
          );
        }

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
