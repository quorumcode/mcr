import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { email, password } from "@/schemas/properties";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
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
      required: ["token"],
      properties: {
        token: {
          type: "string",
        },
      },
    },
    401: getErrorSchema([
      UserErrors.InvalidPassword,
      UserErrors.UserNotFound,
      UserErrors.EmailNotVerified,
    ]),
  },
} as const;

export const routeOfLogin: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/login",
    schema,
    async handler(request, reply) {
      const { email, password } = request.body;
      const normalizedEmail = email.toLowerCase();

      try {
        const token = await fastify.resources.userService.login(
          normalizedEmail,
          password
        );
        return { token };
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.InvalidPassword) {
            return reply.code(401).send({ code: UserErrors.InvalidPassword });
          } else if (e.code === UserErrors.UserNotFound) {
            return reply.code(401).send({ code: UserErrors.UserNotFound });
          } else if (e.code === UserErrors.EmailNotVerified) {
            try {
              const user = await fastify.resources.userService.getUserByEmail(
                email
              );
              if (user?.verifyEmailCode) {
                const url = `${fastify.env.VERIFY_EMAIL_BASE_URL}/${user.verifyEmailCode}`;
                await fastify.resources.mailService.sgSendEmailVerify(
                  normalizedEmail,
                  {
                    url,
                    name: user.name,
                  }
                );
              }
            } catch (e) {
              fastify.log.error(e, "Verify email not sent");
            }
            return reply.code(401).send({ code: UserErrors.EmailNotVerified });
          } else if (e.code === UserErrors.UserBanned) {
            return reply.code(403).send({ code: UserErrors.UserBanned });
          }
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
