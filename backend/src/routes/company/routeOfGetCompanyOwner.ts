import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { CompanyDoc } from "@/models/Company";
import { CompanyErrors, UserErrors } from "@/types/errors";
import { UserInfo, UserRole } from "@/types/common";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
} as const;

export const routeOfGetCompanyOwner: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:id/owner",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      let company: CompanyDoc | null = null;

      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      if (user.role !== UserRole.manager) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

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

      const owner = await fastify.resources.userService.getUserById(
        company.user.toString()
      );

      if (!owner) {
        return reply.code(404).send({ code: UserErrors.UserNotFound });
      }

      const { id, name, email, role = UserRole.user } = owner;
      const result: UserInfo = {
        id,
        name,
        email,
        role,
        permissions: getRolePermissions(role),
      };

      try {
        return result;
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
    },
  });
};
