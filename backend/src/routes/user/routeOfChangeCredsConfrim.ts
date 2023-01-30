import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";

export const schema = {
  body: {
    type: "object",
    required: ["jwtHeader", "jwtPayload", "jwtSignature"],
    properties: {
      jwtHeader: { type: "string" },
      jwtPayload: { type: "string" },
      jwtSignature: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfChangeCredsConfirm: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PUT",
    url: "/confirm-creds",
    schema,
    async handler(request, reply) {
      let { jwtHeader, jwtPayload, jwtSignature } = request.body;

      jwtHeader = decodeURIComponent(jwtHeader);
      jwtPayload = decodeURIComponent(jwtPayload);
      jwtSignature = decodeURIComponent(jwtSignature);

      const changeCredsToken =
        jwtHeader + "." + jwtPayload + "." + jwtSignature;

      let creds;
      try {
        creds = await fastify.resources.userService.verifyChangeCredsToken(
          changeCredsToken
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          return reply.code(400).send({ code: e.code });
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      try {
        await fastify.resources.userService.updateUserCreds(creds);

        if (creds.newEmail) {
          const company =
            await fastify.resources.companyService.getCompanyByUser(
              creds.userId
            );

          if (!company) {
            return reply.code(404).send({ code: UserErrors.CompanyNotFound });
          }

          await fastify.resources.companyService.putEmailWebhook(
            company,
            creds.newEmail
          );
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserNotFound) {
            return reply.code(404).send({ code: UserErrors.UserNotFound });
          } else if (e.code === UserErrors.UserBanned) {
            return reply.code(403).send({ code: UserErrors.UserBanned });
          }
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      return {};
    },
  });
};
