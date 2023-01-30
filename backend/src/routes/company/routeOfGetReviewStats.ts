import { CompanyErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        reviewStats: {
          type: "object",
          properties: {
            rateAvg: { type: "number" },
            count: { type: "number" },
            excellent: { type: "number" },
            good: { type: "number" },
            okay: { type: "number" },
            poor: { type: "number" },
            terrible: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const routeOfReviewStats: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:id/review-stats",
    schema,
    async handler(request, reply) {
      const companyId = request.params.id;
      // @ts-ignore
      const company = await fastify.resources.companyService.getCompanyById(
        companyId
      );

      if (!company) {
        return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
      }
      try {
        const reviewStats =
          await fastify.resources.reviewService.getReviewsStatsForDashboard(
            company.id
          );

        return {
          reviewStats,
        };
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
    },
  });
};
