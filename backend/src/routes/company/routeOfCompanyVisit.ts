import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { CompanyErrors } from "@/types/errors";
import { ServiceError } from "@/services/ServiceError";

export const schema = {
  body: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
      fromWidget: { type: "boolean" },
      fingerprint: { type: "string" },
    },
  },
  response: {
    200: {},
  },
} as const;

export const routeOfCompanyVisit: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/visit",
    schema,
    async handler(request, reply) {
      const { companyId, fromWidget, fingerprint } = request.body;

      if (!fingerprint) {
        return reply
          .code(400)
          .send({ code: CompanyErrors.FingerprintRequired });
      }

      try {
        await fastify.resources.companyService.addCompanyVisit(
          companyId,
          fingerprint,
          fromWidget
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code == CompanyErrors.CompanyVisitRestricted) {
            return reply
              .code(409)
              .send({ code: CompanyErrors.CompanyVisitRestricted });
          }
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
