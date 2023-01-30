import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { CompanyErrors, UserErrors } from "@/types/errors";

const schema = {
  body: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
    },
  },
  response: {
    200: {},
  },
} as const;

export const routeOfConvertToTest: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/convert-to-test",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const permissions = getRolePermissions(user.role);
      const { companyId } = request.body;

      let company;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          companyId
        );

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        if (!permissions.canConvertCompanyToTest) {
          return reply.code(403).send({ code: CompanyErrors.Forbidden });
        }

        await fastify.resources.companyService.patchCompany(company, {
          isTest: true,
          isFingerprintDisable: false,
        });

        const user = await fastify.resources.userService.getUserById(
          company.user.toString()
        );

        if (!user) {
          return reply.code(404).send({ code: UserErrors.UserNotFound });
        }

        await fastify.resources.userService.convertToTest(user);
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
