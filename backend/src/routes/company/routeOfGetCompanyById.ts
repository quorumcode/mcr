import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { companyResponseSchema } from "@/schemas/company";
import { CompanyDoc } from "@/models/Company";
import { normalizeCompanyForReply } from "@/helpers/normalizeCompanyForReply";
import { CompanyErrors } from "@/types/errors";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: companyResponseSchema,
  },
} as const;

export const routeOfGetCompanyById: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:id",
    schema,
    async handler(request, reply) {
      let company: CompanyDoc | null = null;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          request.params.id
        );
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
      if (!company) {
        return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
      }

      try {
        const isOwner = request.user?.id === company.user.toString();
        const isFullAccess =
          isOwner || ["manager", "support"].includes(request.user?.role || "");

        const normalizedCompany = normalizeCompanyForReply(
          company,
          isFullAccess
        );

        const reviewsStats =
          await fastify.resources.reviewService.getReviewsStats([company._id]);

        const response: typeof normalizedCompany & {
          reviewToken?: string;
          reviewsStats: {
            count: number;
            rateAvg: number;
          };
        } = {
          ...normalizedCompany,
          reviewsStats: reviewsStats[company._id],
        };

        return response;
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
    },
  });
};
