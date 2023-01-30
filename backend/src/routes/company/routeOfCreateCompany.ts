import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { requestProperties } from "@/schemas/company";
import { UserDoc } from "@/models/User";
import { CompanyErrors } from "@/types/errors";

const schema = {
  body: {
    type: "object",
    required: ["name"],
    properties: requestProperties,
  },
  response: {
    200: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
        },
      },
    },
  },
} as const;

export const routeOfCreateCompany: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const alreadyAddedCompany =
        await fastify.resources.companyService.getCompanyByUser(user.id);
      if (alreadyAddedCompany) {
        return reply
          .code(409)
          .send({ code: CompanyErrors.UserAlreadyHasCompany });
      }

      const body = request.body;
      if (body.logo) {
        try {
          body.logo = await fastify.resources.imageService.upload(body.logo);
        } catch (e) {
          fastify.log.error(e, CompanyErrors.LogoUploadError);
          return reply.code(500).send({ code: CompanyErrors.LogoUploadError });
        }
      }

      try {
        const company = await fastify.resources.companyService.createCompany(
          body,
          user
        );
        const createReviewTokenPromise =
          fastify.resources.invitationService.createReviewToken({
            companyId: company._id,
          });
        const startTrialPromise =
          fastify.resources.billingService.startTrial(company);
        await Promise.all([createReviewTokenPromise, startTrialPromise]);
        return { id: company._id };
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
    },
  });
};
