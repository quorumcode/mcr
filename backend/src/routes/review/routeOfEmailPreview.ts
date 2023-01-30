import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { get } from "lodash";
import { getDefaultEmailTemplates } from "@/helpers/getDefaultEmailTemplates";
import { EmailTemplateName } from "@/types/common";
import { ReviewErrors } from "@/types/errors";

const schema = {
  querystring: {
    type: "object",
    required: ["companyId", "emailTemplate"],
    properties: {
      companyId: { type: "string" },
      emailTemplate: {
        type: "string",
        enum: [EmailTemplateName.invitation, EmailTemplateName.reminder],
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        html: { type: "string" },
      },
    },
  },
} as const;

export const routeOfEmailPreview: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Querystring: FromSchema<typeof schema.querystring> }>({
    method: "GET",
    url: "/email-preview",
    schema,
    async handler(request, reply) {
      const { companyId, emailTemplate } = request.query;

      try {
        const company = await fastify.resources.companyService.getCompanyById(
          companyId
        );

        if (!company) {
          return reply.code(404).send({ code: ReviewErrors.CompanyNotFound });
        }

        const emailText = get(
          company,
          ["emailTemplates", emailTemplate],
          getDefaultEmailTemplates(company.name)[emailTemplate]
        ) as string;

        const locals = {
          url: "#",
          text: emailText,
          businessName: company.name,
          logoUrl: company.logo as string,
        };

        const fileEmplateName =
          emailTemplate == EmailTemplateName.invitation
            ? "reviewInvitation"
            : "reviewInvitationRemind";

        const renderedEmail = await fastify.resources.mailService.renderEmail(
          fileEmplateName,
          locals
        );

        return {
          html: renderedEmail,
        };
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return reply
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
