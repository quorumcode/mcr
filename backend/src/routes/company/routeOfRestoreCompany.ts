import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
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

export const routeOfRestoreCompany: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "POST",
    url: "/:id/restore",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const permissions = getRolePermissions(user.role);
      if (!permissions.canRemoveCompanies) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

      let company;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          request.params.id
        );

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        await fastify.resources.companyService.patchCompany(company, {
          isRemoved: false,
        });
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }

      return {};
    },
  });
};
