import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { email, userName } from "@/schemas/properties";
import { ClientDoc } from "@/models/Client";
import { checkBannedWords } from "@/helpers/checkBannedWords";
import { ReviewSource } from "@/types/common";
import { subMinutes } from "date-fns";
import { ReviewErrors } from "@/types/errors";
import { removeExtraWhiteSpaces } from "@/helpers/helpFunctions";

const schema = {
  body: {
    type: "object",
    required: ["reviewToken", "rate", "message"],
    properties: {
      reviewToken: { type: "string" },
      name: userName,
      email: email,
      rate: {
        type: "integer",
        minimum: 1,
        maximum: 5,
      },
      message: {
        type: "string",
        maxLength: 3000,
      },
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

export const routeOfCreateReview: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/",
    schema,
    async handler(request, reply) {
      const { reviewToken, name, email, rate } = request.body;
      let { fingerprint } = request.body;

      const message = removeExtraWhiteSpaces(request.body.message);

      const reviewTokenDoc =
        await fastify.resources.invitationService.getReviewTokenInfoByValue(
          reviewToken
        );

      if (!reviewTokenDoc) {
        return reply.status(400).send({ code: ReviewErrors.InvalidToken });
      }

      const { company } = reviewTokenDoc;

      if (!company) {
        return reply.status(404).send({ code: ReviewErrors.CompanyNotFound });
      }

      if (company.isFingerprintDisable && company.isTest) {
        fingerprint = undefined;
      }

      let { client }: { client: ClientDoc | null } = reviewTokenDoc;

      // If the token does not contain a client, then you must specify the field name and email address
      if (!client && (!name || !email)) {
        return reply
          .status(400)
          .send({ code: ReviewErrors.ClientFieldsRequired });
      }

      // If the token contain a client, bun without name, then you must specify the name field
      if (client && !client.name && !name) {
        return reply
          .status(400)
          .send({ code: ReviewErrors.ClientFieldsRequired });
      }

      const checkMessageResult = checkBannedWords(message);
      if (checkMessageResult.isProfane) {
        return reply.status(400).send({
          code: ReviewErrors.MessageIsProfane,
          matches: checkMessageResult.matches,
        });
      }

      const limitInvitationInMinutes = company.isTest
        ? fastify.env.TEST_LIMIT_FROM_LAST_INVITATION_IN_MINUTES
        : fastify.env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES;

      // Check client by fingerprint
      if (fingerprint) {
        const existClientByFingerprint =
          await fastify.resources.clientService.getClientByFingerprint(
            company._id,
            fingerprint
          );
        if (
          existClientByFingerprint &&
          existClientByFingerprint.lastReviewAt &&
          existClientByFingerprint.lastReviewAt >
            subMinutes(new Date(), limitInvitationInMinutes)
        ) {
          return reply
            .status(409)
            .send({ code: ReviewErrors.ErrorLastReviewTimeLimit });
        }
      }

      if (!client) {
        const existsClientByEmail =
          await fastify.resources.clientService.getClientByEmail(
            company._id,
            // @ts-ignore above we have checked that the fields are required if there is no client
            email
          );

        if (
          //@ts-ignore
          existsClientByEmail?.lastReviewAt >
          subMinutes(new Date(), limitInvitationInMinutes)
        ) {
          return reply
            .status(409)
            .send({ code: ReviewErrors.ErrorLastReviewTimeLimit });
        }

        if (!existsClientByEmail) {
          client = await fastify.resources.clientService.createClient(
            {
              // @ts-ignore above we have checked that the fields are required if there is no client
              name,
              // @ts-ignore
              email,
              company,
              fingerprint,
            },
            true
          );
        } else {
          client = existsClientByEmail;
        }
      } else if (!client.name) {
        client.name = name;
      }

      client.lastReviewAt = new Date();
      client.fingerprint = fingerprint;
      await client.save();

      await fastify.resources.invitationService.turnOffReminds(client);

      // Detect review source
      //
      let reviewSource = ReviewSource.ByQr;
      if (client.batchId) {
        reviewSource = ReviewSource.byEmail;
        if (client.batchId === "byBcc") {
          reviewSource = ReviewSource.byBcc;
        }
      }
      const clientReviews =
        await fastify.resources.reviewService.getReviewByClient(
          client.id,
          company.id
        );

      if (clientReviews) {
        clientReviews.forEach((clientReview) => {
          if (clientReview.message === message) {
            return reply
              .status(400)
              .send({ code: ReviewErrors.DoublicateReviewMessage });
          }
        });
      }

      const review = await fastify.resources.reviewService.createReview({
        company: company._id,
        client: client._id,
        rate,
        message,
        source: reviewSource,
      });

      const notificationEmail =
        rate > 2
          ? company.emailForReviewNotifications
          : company.emailForNegativeReviewAlerts;

      if (notificationEmail) {
        try {
          const companyOwner = await fastify.resources.userService.getUserById(
            company.user.toString()
          );

          if (!companyOwner) {
            fastify.log.error(
              `Company's owner not found. ${company.user.toString()}`
            );
            return {};
          }

          await fastify.resources.mailService.sgSendReviewNotification(
            notificationEmail,
            {
              replyUrl: fastify.resources.urlBuilder.getViewReviewUrl(
                company._id,
                review._id,
                // // temp commented out to prevent unhandled review error
                // await fastify.resources.userService.generateAutoLoginToken(
                //   companyOwner
                // )
              ),
              // @ts-ignore Here the client is always has name
              clientName: client.name,
              rate,
              message,
              date: review.createdAt,
            }
          );
        } catch (e) {
          fastify.log.warn(
            e,
            "Error post review. Email notification not sent."
          );
        }
      }

      return {};
    },
  });
};
