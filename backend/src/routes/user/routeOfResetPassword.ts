import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { email } from "@/schemas/properties";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email,
    },
  },
  response: {
    200: {
      type: "object",
    },
    401: getErrorSchema([UserErrors.UserNotFound]),
  },
} as const;

export const routeOfResetPassword: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/reset-password",
    schema,
    async handler(request, reply) {
      const { email } = request.body;
      const normalizedEmail = email.toLowerCase();

      let user;
      try {
        user =
          await fastify.resources.userService.recreateUserChangePasswordCode(
            normalizedEmail
          );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserNotFound) {
            return reply.code(401).send({ code: UserErrors.UserNotFound });
          } else if (e.code === UserErrors.UserBanned) {
            return reply.code(403).send({ code: UserErrors.UserBanned });
          }
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      if (user.changePasswordCode) {
        const url = `${fastify.env.RESET_PASSWORD_BASE_URL}/${user.changePasswordCode}`;
        try {
          await fastify.resources.mailService.sgSendChangePasswordCode(
            normalizedEmail,
            {
              url,
            }
          );
        } catch (e) {
          fastify.log.error(e, "Mail not sent");
        }
      }
      return {};
    },
  });
};
