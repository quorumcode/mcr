import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { ClientErrors } from "@/types/errors";
import { subMinutes } from "date-fns";
import { EmailTemplateName } from "@/types/common";
import { getErrorSchema } from "@/schemas/error";

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
    required: ["email"],
    properties: {
      email: { type: "string" },
    },
  },
  response: {
    200: {},
    404: getErrorSchema([ClientErrors.CompanyNotFound]),
    400: getErrorSchema([
      ClientErrors.CompanyRemoved,
      ClientErrors.SubscriptionExpired,
    ]),
  },
} as const;

export const routeOfSendInvite: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/:companyId/invite",
    schema,
    async handler(request, reply) {
      const { companyId } = request.params;
      const { email } = request.body;

      const company = await fastify.resources.companyService.getCompanyById(
        companyId
      );
      if (!company) {
        return reply.code(404).send({ code: ClientErrors.CompanyNotFound });
      }

      if (company.isRemoved) {
        return reply.code(400).send({ code: ClientErrors.CompanyRemoved });
      }

      if (!company.isActiveSubscription) {
        return reply.code(400).send({ code: ClientErrors.SubscriptionExpired });
      }

      let client = await fastify.resources.clientService.getClientByEmail(
        companyId,
        email
      );

      if (!client) {
        client = await fastify.resources.clientService.createClient({
          email,
          company,
        });
      }

      if (
        !client.lastInvitedAt ||
        (client.lastInvitedAt as Date) <
          subMinutes(
            new Date(),
            fastify.env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES
          )
      ) {
        await fastify.resources.invitationService.sendReviewInvite({
          company,
          client,
          emailTemplateName: EmailTemplateName.invitation,
        });
      }

      return {};
    },
  });
};
