import { UserDoc } from "@/models/User";
import { CompanyErrors } from "@/types/errors";
import { subYears } from "date-fns";
import { FastifyPluginAsync } from "fastify";
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

export const routeOfGetVisitStats: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/visit-stats",
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
      try {
        const visitStats =
          await fastify.resources.companyService.getCompanyVisitStat(
            company.id,
            dateRangeFrom,
            dateRangeTo
          );

        return {
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
