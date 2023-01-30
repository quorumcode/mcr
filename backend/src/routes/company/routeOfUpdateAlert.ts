import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { CompanyDoc } from "@/models/Company";
import { UserRole } from "@/types/common";
import { CompanyErrors, ReviewErrors } from "@/types/errors";
import { checkBannedWords } from "@/helpers/checkBannedWords";

const schema = {
  params: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["title", "body"],
    properties: {
      title: { type: "string", maxLength: 255 },
      body: { type: "string", maxLength: 300 },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfUpdateAlert: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PUT",
    url: "/:companyId/alert",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      if (user.role !== UserRole.support && user.role !== UserRole.manager) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
      }

      const companyId = request.params.companyId;
      const { title, body } = request.body;

      const checkTitleResult = checkBannedWords(title);
      if (checkTitleResult.isProfane) {
        return reply.status(400).send({
          code: CompanyErrors.TitleIsProfane,
          matches: checkTitleResult.matches,
        });
      }

      const checkBodyResult = checkBannedWords(body);
      if (checkBodyResult.isProfane) {
        return reply.status(400).send({
          code: CompanyErrors.BodyIsProfane,
          matches: checkBodyResult.matches,
        });
      }

      try {
        const company = (await fastify.resources.companyService.getCompanyById(
          companyId
        )) as CompanyDoc;

        if (!company) {
          return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
        }

        await fastify.resources.companyService.putAlert(company, title, body);
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
