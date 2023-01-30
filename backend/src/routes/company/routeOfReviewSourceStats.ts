import { UserDoc } from "@/models/User";
import { CompanyErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { subYears } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

export const schema = {
  querystring: {
    type: "object",
    properties: {
      dateRangeFrom: { type: "string", format: "date" },
      dateRangeTo: { type: "string", format: "date" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
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
      },
    },
  },
} as const;

export const routeOfReviewSourceStats: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Querystring: FromSchema<typeof schema.querystring> }>({
    method: "GET",
    url: "/review-source-stats",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      // Set default date range if not defined
      let dateRangeFrom = subYears(new Date(), 1);
      let dateRangeTo = new Date();

      if (request.query.dateRangeFrom && request.query.dateRangeTo) {
        dateRangeFrom = new Date(request.query.dateRangeFrom);
        dateRangeTo = new Date(request.query.dateRangeTo);
      }

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
        const reviewSources =
          await fastify.resources.reviewService.getReviewsSourcesByDateRange(
            company.id,
            dateRangeFrom,
            dateRangeTo
          );

        return {
          reviewSources,
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
