import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { CompanyErrors } from "@/types/errors";
import { ServiceError } from "@/services/ServiceError";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { UserDoc } from "@/models/User";

export const schema = {
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

export const routeOfSwitchFingerprint: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/switch-fingerprint",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { companyId } = request.body;
      const permissions = getRolePermissions(user.role);

      if (!permissions.canConvertCompanyToTest) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

      try {
        const company = await fastify.resources.companyService.getCompanyById(
          companyId
        );

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        if (!company.isTest) {
          return reply.code(400).send({ code: CompanyErrors.CompanyIsNotTest });
        }

        await fastify.resources.companyService.switchFingerprint(company);
      } catch (e) {
        if (e instanceof ServiceError) {
          fastify.log.error(e, e.code);
          return reply.code(500).send({ code: e.code });
        }
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
      return {};
    },
  });
};
