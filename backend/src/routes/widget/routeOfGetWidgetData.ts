import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { review } from "@/schemas/properties";

const schema = {
  params: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    properties: {
      withReviewsStats: { type: "boolean" },
      reviewsLimit: { type: "number", minimum: 0 },
      withReplys: { type: "boolean" },
      skip: { type: "number", minimum: 0 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "object",
          required: ["companyId"],
          properties: {
            companyId: { type: "string" },
            reviewsStats: {
              type: "object",
              required: ["count", "rateAvg"],
              properties: {
                count: { type: "number" },
                rateAvg: { type: "number" },
                filteredCount: { type: "number" },
              },
            },
            reviews: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "client", "createdAt", "rate"],
                properties: {
                  id: { type: "string" },
                  client: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                  createdAt: { type: "string" },
                  rate: { type: "number" },
                  message: { type: "string" },
                  reply: {
                    type: "object",
                    properties: {
                      createdAt: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetWidgetData: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/:companyId/data",
    schema,
    async handler(request) {
      const { companyId } = request.params;
      const {
        reviewsLimit = 0,
        withReviewsStats = false,
        withReplys = false,
        skip = 0,
      } = request.query;

      let reviews;
      let filtredReviewsCount;
      if (reviewsLimit) {
        const result = await fastify.resources.reviewService.getReviews({
          companyId,
          sort: "-createdAt",
          limit: reviewsLimit,
          onlyPositive: true,
          withReplys,
          skip,
        });
        reviews = result.data;
        filtredReviewsCount = result.total;
      }

      let reviewsStats;
      if (withReviewsStats) {
        reviewsStats = await fastify.resources.reviewService.getReviewsStats([
          companyId,
        ]);
        reviewsStats = {
          ...reviewsStats[companyId],
          filteredCount: filtredReviewsCount as number,
        };
      }

      return {
        data: {
          companyId,
          reviews: reviews ? normalizeArrayForReply(reviews) : undefined,
          reviewsStats: reviewsStats ? reviewsStats : undefined,
        },
      };
    },
  });
};
