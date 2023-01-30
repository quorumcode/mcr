import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { UserDoc } from "@/models/User";
import { review } from "@/schemas/properties";
import { CompanyErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { subYears } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

export const schema = {
  querystring: {
    type: "object",
    properties: {
      sourceDateFrom: { type: "string", format: "date" },
      sourceDateTo: { type: "string", format: "date" },
      visitDateFrom: { type: "string", format: "date" },
      visitDateTo: { type: "string", format: "date" },
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
        notResponsedCount: {
          type: "number",
        },
        recentReviews: {
          type: "array",
          items: review,
        },
        reviewSources: {
          type: "object",
          properties: {
            dateRangeFrom: { type: "string" },
            dateRangeTo: { type: "string" },
            byEmail: { type: "number" },
            byEmailPercent: { type: "number" },
            byBcc: { type: "number" },
            byBccPercent: { type: "number" },
            byQr: { type: "number" },
            byQrPercent: { type: "number" },
          },
        },
        visitStats: {
          type: "object",
          properties: {
            dateRangeFrom: { type: "string" },
            dateRangeTo: { type: "string" },
            total: { type: "number" },
            site: { type: "number" },
            widget: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const routeOfDashboardStats: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Querystring: FromSchema<typeof schema.querystring> }>({
    method: "GET",
    url: "/dashboard-stats",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      // Set default date range if not defined
      let sourceDateFrom = subYears(new Date(), 1);
      let sourceDateTo = new Date();
      let visitDateFrom = subYears(new Date(), 1);
      let visitDateTo = new Date();

      if (request.query.sourceDateFrom && request.query.sourceDateTo) {
        sourceDateFrom = new Date(request.query.sourceDateFrom);
        sourceDateTo = new Date(request.query.sourceDateTo);
      }

      if (request.query.visitDateFrom && request.query.visitDateTo) {
        visitDateFrom = new Date(request.query.visitDateFrom);
        visitDateTo = new Date(request.query.visitDateTo);
      }

      // @ts-ignore
      const company = await fastify.resources.companyService.getCompanyByUser(
        user.id
      );

      if (!company) {
        return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
      }

      const isOwner = user.id === company.user.toString();
      if (!isOwner) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

      try {
        const reviewStats =
          await fastify.resources.reviewService.getReviewsStatsForDashboard(
            company.id
          );

        const recentReviews =
          await fastify.resources.reviewService.getReviewsForDashboard(
            company.id,
            2
          );

        const notResponsedCount =
          await fastify.resources.reviewService.getNotRepliedCount(company.id);

        const reviewSources =
          await fastify.resources.reviewService.getReviewsSourcesByDateRange(
            company.id,
            sourceDateFrom,
            sourceDateTo
          );

        const visitStats =
          await fastify.resources.companyService.getCompanyVisitStat(
            company.id,
            visitDateFrom,
            visitDateTo
          );

        return {
          notResponsedCount: notResponsedCount,
          recentReviews: normalizeArrayForReply(recentReviews),
          reviewStats,
          reviewSources,
          visitStats,
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
