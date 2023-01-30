import { UserDoc } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import randToken from "rand-token";

export const schema = {
  body: {
    type: "object",
    properties: {
      newEmail: {
        type: "string",
      },
      newName: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfChangeCredsRequest: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/change-creds",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc;
      const { newEmail, newName } = request.body;

      if (!newEmail && !newName) {
        return reply.code(400).send({ code: UserErrors.BlankRequest });
      }

      if (!newEmail && newName) {
        await fastify.resources.userService.updateUserName(newName, user);
        return {};
      }

      let normalizedEmail;
      if (newEmail) {
        normalizedEmail = newEmail.toLowerCase();
      } else {
        normalizedEmail = user.email;
      }

      let changeEmailToken: string;
      let confirmationToken: string;

      try {
        confirmationToken =
          await fastify.resources.userService.generateAutoLoginToken(user);
        changeEmailToken =
          await fastify.resources.userService.CreateTokenForCredsChange(
            user.id,
            normalizedEmail === user.email ? undefined : normalizedEmail,
            newName
          );
      } catch (e) {
        if (e instanceof ServiceError) {
          return reply.code(400).send({ code: e.code });
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      const splitedToken = changeEmailToken.split(".");

      const jwtHeader = encodeURIComponent(splitedToken[0]);
      const jwtPayload = encodeURIComponent(splitedToken[1]);
      const jwtSignature = encodeURIComponent(splitedToken[2]);

      const company = await fastify.resources.companyService.getCompanyByUser(
        user.id
      );

      if (!company) {
        return reply.code(404).send({ code: UserErrors.CompanyNotFound });
      }

      const jwtParams = `jwtHeader=${jwtHeader}&jwtPayload=${jwtPayload}&jwtSignature=${jwtSignature}`;
      const url = `${fastify.env.FRONTEND_EXTERNAL_BASE_URL}/company/${company.id}/edit/user-account?${jwtParams}&confirmationToken=${confirmationToken}`;
      fastify.log.info(`Change email url: ${url}`);
      try {
        await fastify.resources.mailService.sgSendCredentialsChange(
          normalizedEmail,
          {
            url,
          }
        );
      } catch (e) {
        fastify.log.error(e, "Change email not sent");
        return reply.code(500).send({ code: UserErrors.EmailNotSent });
      }

      return {};
    },
  });
};
