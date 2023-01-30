import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { email, password } from "@/schemas/properties";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email,
      password,
    },
  },
  response: {
    200: {
      type: "object",
    },
    401: getErrorSchema([UserErrors.InvalidPassword, UserErrors.UserNotFound]),
    409: getErrorSchema([UserErrors.EmailAlreadyVerified]),
  },
} as const;

export const routeOfResendVerifyEmail: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/resend-verify-email",
    schema,
    async handler(request, reply) {
      const { email, password } = request.body;

      let user;
      let confirmationToken;
      try {
        user = await fastify.resources.userService.recreateUserVerifyEmailCode(
          email,
          password
        );

        confirmationToken =
          await fastify.resources.userService.generateAutoLoginToken(user);
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.InvalidPassword) {
            return reply.code(401).send({ code: UserErrors.InvalidPassword });
          } else if (e.code === UserErrors.UserNotFound) {
            return reply.code(401).send({ code: UserErrors.UserNotFound });
          } else if (e.code === UserErrors.EmailAlreadyVerified) {
            return reply
              .code(409)
              .send({ code: UserErrors.EmailAlreadyVerified });
          } else if (e.code === UserErrors.UserBanned) {
            return reply.code(403).send({ code: UserErrors.UserBanned });
          }
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      if (user.verifyEmailCode) {
        const url = `${fastify.env.VERIFY_EMAIL_BASE_URL}/${user.verifyEmailCode}?confirmationToken=${confirmationToken}`;
        try {
          await fastify.resources.mailService.sgSendEmailVerify(email, {
            url,
            name: user.name,
          });
        } catch (e) {
          fastify.log.error(e, UserErrors.EmailNotSent);
          return reply.code(502).send({ code: UserErrors.EmailNotSent });
        }
      }
      return {};
    },
  });
};
