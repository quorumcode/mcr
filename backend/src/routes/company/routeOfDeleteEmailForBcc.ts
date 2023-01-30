import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { Company, CompanyDoc } from "@/models/Company";
import { UserRole } from "@/types/common";
import { CompanyErrors } from "@/types/errors";

const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["bccEmail"],
    properties: {
      bccEmail: { type: "string" },
    },
  },
  response: {
    200: {},
  },
} as const;

export const routeOfDeleteEmailForBcc: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "DELETE",
    url: "/:id/email-for-bcc",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const companyId = request.params.id;
      const { bccEmail } = request.body;
      let company;

      try {
        company = (await Company.findById(companyId).exec()) as CompanyDoc;

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        const isOwner = user.id === company.user.toString();
        if (!isOwner && user.role !== UserRole.manager) {
          return reply.code(403).send({ code: CompanyErrors.Forbidden });
        }

        await fastify.resources.companyService.deleteEmailWebhook(
          company,
          bccEmail
        );
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
