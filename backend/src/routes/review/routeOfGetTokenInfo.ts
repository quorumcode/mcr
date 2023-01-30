import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { CompanyDoc } from "@/models/Company";
import { ReviewErrors } from "@/types/errors";
import { subMinutes } from "date-fns";

const schema = {
  querystring: {
    type: "object",
    properties: {
      fingerprint: { type: "string" },
    },
  },
  params: {
    type: "object",
    required: ["reviewToken"],
    properties: {
      reviewToken: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "object",
          required: ["company"],
          properties: {
            client: {
              type: "object",
              properties: {
                name: { type: "string" },
              },
            },
            company: {
              type: "object",
              required: ["id", "name"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                logoUrl: { type: "string" },
              },
            },
            review: {
              type: "object",
              required: ["id", "message"],
              properties: {
                id: { type: "string" },
                message: { type: "string" },
                rate: { type: "integer" },
              },
            },
          },
        },
        code: { type: "string" },
      },
    },
  },
} as const;

type Response = FromSchema<typeof schema.response["200"]>;

export const routeOfGetTokenInfo: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/token-info/:reviewToken",
    schema,
    async handler(request, reply) {
      const { reviewToken } = request.params;
      let { fingerprint } = request.query;

      try {
        const info =
          await fastify.resources.invitationService.getReviewTokenInfoByValue(
            reviewToken
          );

        if (!info) {
          return reply.status(400).send({ code: ReviewErrors.InvalidToken });
        }

        let company: CompanyDoc | null = null;
        try {
          company = await fastify.resources.companyService.getCompanyById(
            info.company.id
          );
        } catch (e) {
          fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
          return reply
            .code(500)
            .send({ code: ReviewErrors.ReviewUnhandledError });
        }

        if (!company) {
          return reply.code(404).send({ code: ReviewErrors.CompanyNotFound });
        }
        if (company.isFingerprintDisable && company.isTest) {
          fingerprint = undefined;
        }

        if (company.isRemoved) {
          return reply.code(400).send({ code: ReviewErrors.CompanyRemoved });
        }

        if (!company.isActiveSubscription) {
          return reply
            .code(400)
            .send({ code: ReviewErrors.CompanySubscriptionExpired });
        }

        const response: Response = {
          data: {
            company: {
              id: info.company.id,
              name: info.company.name,
              logoUrl: info.company.logo,
            },
          },
        };

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
              subMinutes(
                new Date(),
                fastify.env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES
              )
          ) {
            response.code = ReviewErrors.ErrorLastReviewTimeLimit;
          }
        }

        if (info.client) {
          const recentReview =
            await fastify.resources.reviewService.getRecentReview(
              info.company.id,
              info.client.id
            );

          if (!recentReview && info.client.lastReviewAt) {
            response.code = ReviewErrors.ReviewEditTimeExpired;
          }

          if (recentReview) {
            response.data.review = {
              id: recentReview.id,
              message: recentReview.message || "",
              rate: recentReview.rate,
            };
          }

          response.data.client = {
            name: info.client?.name || "",
          };
        }

        return response;
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return reply
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
