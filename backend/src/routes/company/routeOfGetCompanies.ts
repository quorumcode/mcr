import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { companyResponseSchema } from "@/schemas/company";
import { normalizeCompanyForReply } from "@/helpers/normalizeCompanyForReply";
import { CompanyErrors } from "@/types/errors";

export const schema = {
  querystring: {
    type: "object",
    properties: {
      search: { type: "string" },
      skip: { type: "number", minimum: 0 },
      limit: { type: "number", minimum: 0 },
      sort: { type: "string", enum: ["createdAt", "-createdAt"] },
      fields: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "_id",
            "name",
            "categories",
            "address",
            "about",
            "logo",
            "webSite",
            "contactPhone",
            "createdAt",
            "reviewsStats",
          ],
        },
      },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["data", "meta"],
      properties: {
        data: {
          type: "array",
          items: companyResponseSchema,
        },
        meta: {
          type: "object",
          required: ["total"],
          properties: {
            total: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetCompanies: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/",
    schema,
    async preValidation(request) {
      if (typeof request.query.fields === "undefined")
        request.query.fields = [];
      if (!Array.isArray(request.query.fields))
        request.query.fields = [request.query.fields];
    },
    async handler(request, reply) {
      const isAdmin = ["manager", "support"].includes(request.user?.role || "");
      const needReviewsStats =
        request.query.fields?.includes("reviewsStats") || false;

      try {
        const { data, total } =
          await fastify.resources.companyService.getCompanies({
            search: request.query.search,
            skip: request.query.skip,
            limit: request.query.limit,
            fields: [...(request.query.fields as string[]), "user"], // User for check access for private fields
            sort: request.query.sort,
            includeRemoved: isAdmin,
            includeUnsubscribed: true,
            includeTest: isAdmin,
          });

        const reviewsStats = needReviewsStats
          ? await fastify.resources.reviewService.getReviewsStats(
              data.map(({ _id }) => _id)
            )
          : {};

        const normalizedData = data.map((company) => {
          const isOwner = request.user?.id === company.user.toString();
          const normalizedCompany = normalizeCompanyForReply(
            company,
            isOwner || isAdmin
          );
          if (needReviewsStats) {
            return {
              ...normalizedCompany,
              reviewsStats: reviewsStats[company._id],
            };
          }
          return normalizedCompany;
        });

        return {
          data: normalizedData,
          meta: {
            total,
          },
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
