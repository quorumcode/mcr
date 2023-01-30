import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { normalizeCompanyForReply } from "@/helpers/normalizeCompanyForReply";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { UserInfo, UserRole } from "@/types/common";
import { UserErrors } from "@/types/errors";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
} as const;

export const routeOfGetUserById: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:id",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const authUser = request.user as UserDoc; // Because we called verifyAuth prehandler
      const permissions = getRolePermissions(authUser.role);
      if (!permissions.canGetUsersInfo) {
        return reply.code(403).send({ code: UserErrors.Forbidden });
      }

      try {
        const user = await fastify.resources.userService.getUserById(
          request.params.id
        );
        if (!user) {
          return reply.code(404).send({ code: UserErrors.UserNotFound });
        }

        const { id, name, email, role = UserRole.user } = user;
        const result: UserInfo = {
          id,
          name,
          email,
          role,
          permissions: getRolePermissions(role),
        };
        const userCompany =
          await fastify.resources.companyService.getCompanyByUser(id);
        if (userCompany) {
          result.company = normalizeCompanyForReply(userCompany, true);
        }
        return result;
      } catch (e) {
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
