import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { CompanyDoc } from "@/models/Company";
import { UserRole } from "@/types/common";
import { CompanyErrors, ReviewErrors } from "@/types/errors";

const schema = {
  params: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfDeleteAlert: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "DELETE",
    url: "/:companyId/alert",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      if (user.role !== UserRole.support && user.role !== UserRole.manager) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

      const companyId = request.params.companyId;

      try {
        const company = (await fastify.resources.companyService.getCompanyById(
          companyId
        )) as CompanyDoc;

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        await fastify.resources.companyService.deleteAlert(company);
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
