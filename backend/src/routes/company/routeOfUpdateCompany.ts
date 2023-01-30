import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { requestProperties, responseProperties } from "@/schemas/company";
import { UserDoc } from "@/models/User";
import { Company, CompanyDoc } from "@/models/Company";
import { UserRole } from "@/types/common";
import { CompanyErrors } from "@/types/errors";
import { checkBannedWords, checkUrlExists } from "@/helpers/checkBannedWords";

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
    properties: requestProperties,
  },
  response: {
    200: {
      type: "object",
      required: ["data"],
      properties: {
        data: responseProperties,
      },
    },
  },
} as const;

export const routeOfUpdateCompany: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/:id",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      // @ts-ignore
      const companyId = request.params.id;
      let company;

      try {
        company = (await Company.findById(companyId).exec()) as CompanyDoc;
      } catch (e) {
        fastify.log.error(e, CompanyErrors.CompanyUnhandledError);
        return reply
          .code(500)
          .send({ code: CompanyErrors.CompanyUnhandledError });
      }
      if (!company) {
        return reply.code(404).send({ code: CompanyErrors.CompanyNotFound });
      }

      const isOwner = user.id === company.user.toString();
      if (!isOwner && user.role !== UserRole.manager) {
        return reply.code(403).send({ code: CompanyErrors.Forbidden });
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

      // Check invitation text
      if (body.emailTemplates?.invitation) {
        const checkMessageResult = checkBannedWords(
          body.emailTemplates.invitation
        );
        if (checkMessageResult.isProfane) {
          return reply.status(400).send({
            code: CompanyErrors.BadInvitationText,
            matches: checkMessageResult.matches,
          });
        }
        if (checkUrlExists(body.emailTemplates.invitation)) {
          return reply.status(400).send({
            code: CompanyErrors.UrlInInvitationText,
          });
        }
      }

      // Check reminder text
      if (body.emailTemplates?.reminder) {
        const checkMessageResult = checkBannedWords(
          body.emailTemplates.reminder
        );
        if (checkMessageResult.isProfane) {
          return reply.status(400).send({
            code: CompanyErrors.BadReminderText,
            matches: checkMessageResult.matches,
          });
        }
        if (checkUrlExists(body.emailTemplates.reminder)) {
          return reply.status(400).send({
            code: CompanyErrors.UrlInReminderText,
          });
        }
      }

      // Check bccDelay
      if (
        body.bccDelay &&
        body.bccDelay > fastify.env.BCC_INVITATION_DELAY_MAX
      ) {
        return reply
          .code(400)
          .send({ code: CompanyErrors.BccDelayLimitExceeded });
      }

      // Check invitation reminder delay
      if (
        body.reminderDelay &&
        body.reminderDelay > fastify.env.INVITATION_REMINDER_DELAY_MAX
      ) {
        return reply
          .code(400)
          .send({ code: CompanyErrors.ReminderDelayLimitExceeded });
      }
      if (
        body.reminderDelay &&
        body.reminderDelay < fastify.env.INVITATION_REMINDER_DELAY_MIN
      ) {
        return reply
          .code(400)
          .send({ code: CompanyErrors.ReminderDelayLessThenMinimum });
      }

      const newCompany = await fastify.resources.companyService.patchCompany(
        company,
        body
      );

      return { data: newCompany };
    },
  });
};
