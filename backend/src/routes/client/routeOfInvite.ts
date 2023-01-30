import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { EmailTemplateName } from "@/types/common";
import { subMinutes } from "date-fns";
import { ClientErrors } from "@/types/errors";
import { ServiceError } from "@/services/ServiceError";

const schema = {
  body: {
    type: "object",
    required: ["companyId", "clientsIds", "emailTemplate"],
    properties: {
      companyId: {
        type: "string",
      },
      clientsIds: {
        type: "array",
        items: { type: "string" },
      },
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
        clientsCount: {
          type: "number",
        },
        inviteSuccess: {
          type: "string",
          enum: ["full", "partial", "none"],
        },
        inviteErrorsCount: {
          type: "number",
        },
        inviteErrors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              clientEmail: { type: "string" },
              errorType: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;

export const routeOfInvite: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/invite",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const {
        companyId,
        clientsIds,
        emailTemplate: emailTemplateName,
      } = request.body;

      const company = await fastify.resources.companyService.getCompanyById(
        companyId
      );
      if (!company) {
        return reply.code(404).send({ code: ClientErrors.CompanyNotFound });
      }

      if (user.id !== company.user.toString()) {
        return reply.code(403).send({ code: ClientErrors.Forbidden });
      }

      const clients = await fastify.resources.clientService.getClients(
        companyId,
        clientsIds
      );

      let inviteErrors = new Array<{
        clientEmail: string;
        errorType?: string;
      }>();

      const jobs = clients.map((client) => {
        if (
          !client.lastInvitedAt ||
          (client.lastInvitedAt as Date) <
            subMinutes(
              new Date(),
              fastify.env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES
            )
        ) {
          return fastify.resources.invitationService.sendReviewInvite({
            company,
            client,
            emailTemplateName,
          });
        }
      });

      const results = await Promise.allSettled(jobs);

      // TODO Find more elegant solution for resolve all errors
      results.forEach((result) => {
        if ((result.status = "rejected")) {
          let rejectReason = (result as PromiseRejectedResult).reason;
          if (rejectReason instanceof ServiceError) {
            inviteErrors.push({
              clientEmail: rejectReason.message,
              errorType: rejectReason.code,
            });
          }
        }
      });

      const isEpicFail = inviteErrors.length == clients.length;

      if (isEpicFail) {
        return reply
          .status(502)
          .send({ code: ClientErrors.InvitationsNotSent, inviteErrors });
      }

      return {
        clientsCount: clients.length,
        inviteSuccess: inviteErrors.length > 0 ? "partial" : "full",
        inviteErrors,
        inviteErrorsCount: inviteErrors.length,
      };
    },
  });
};
