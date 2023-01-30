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

export const routeOfRemoveCompany: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "POST", // TODO change to DELETE
    url: "/:id/remove",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const permissions = getRolePermissions(user.role);

      let company;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          request.params.id
        );

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        const isOwner = request.user?.id === company?.user.toString();

        if (!permissions.canRemoveCompanies && !isOwner) {
          return reply.code(403).send({ code: CompanyErrors.Forbidden });
        }

        await fastify.resources.companyService.patchCompany(company, {
          isRemoved: true,
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
