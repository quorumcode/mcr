import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { checkBannedWords } from "@/helpers/checkBannedWords";
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
    required: ["message"],
    properties: {
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

export const routeOfCreateReply: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/:reviewId/reply",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, response) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { reviewId } = request.params;
      const message = removeExtraWhiteSpaces(request.body.message);

      const review = await fastify.resources.reviewService.getReviewById(
        reviewId
      );

      if (!review) {
        return response.code(404).send({ code: ReviewErrors.ReviewNotFound });
      }

      if (review.company.user.toString() !== user._id.toString()) {
        return response.code(403).send({ code: ReviewErrors.Forbidden });
      }

      const checkMessageResult = checkBannedWords(message);
      if (checkMessageResult.isProfane) {
        return response.status(400).send({
          code: ReviewErrors.MessageIsProfane,
          matches: checkMessageResult.matches,
        });
      }

      review.reply = {
        message,
        createdAt: new Date(),
      };
      await review.save();
      try {
        await fastify.resources.mailService.sgSendReplyNotification(
          review.client.email,
          {
            reviewUrl: fastify.resources.urlBuilder.getViewReviewUrl(
              review.company._id,
              review._id
            ),
            businessName: review.company.name,
            clientName: review.client.name || "",
            reviewRate: review.rate,
            reviewMessage: review.message || "",
            reviewDate: review.createdAt,
            replyMessage: review.reply.message,
            replyDate: review.reply.createdAt,
            logoUrl: review.company.logo || "",
          }
        );
      } catch {
        fastify.log.warn("Error with business response email notification");
      }

      return {};
    },
  });
};
