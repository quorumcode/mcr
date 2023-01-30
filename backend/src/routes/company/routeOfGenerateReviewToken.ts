import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { Company, CompanyDoc } from "@/models/Company";
import { CompanyErrors } from "@/types/errors";

const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
} as const;

export const routeOfGenerateReviewToken: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "POST",
    url: "/:id/generate-review-token",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      // @ts-ignore
      const companyId = request.params.id;
      let company;

      try {
        company = (await Company.findById(companyId).exec()) as CompanyDoc;
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
        const isOwner = user.id === company.user.toString();
        const permissions = getRolePermissions(user.role);
        if (!isOwner && !permissions.canEditAllCompanies) {
          return reply.code(403).send({ code: CompanyErrors.Forbidden });
        }

        await fastify.resources.invitationService.createReviewToken({
          companyId: company._id,
        });

        return {};
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
    },
  });
};
