import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["confirmationToken"],
    properties: {
      confirmationToken: {
        type: "string",
      },
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

export const routeOfLoginByToken: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/token-login",
    schema,
    async handler(request, reply) {
      const { confirmationToken } = request.body;
      try {
        const jwtToken =
          await fastify.resources.userService.loginByConfirmationToken(
            confirmationToken
          );
        return { token: jwtToken };
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserNotFound) {
            return reply.code(401).send({ code: UserErrors.UserNotFound });
          } else if (e.code === UserErrors.EmailNotVerified) {
            return reply.code(401).send({ code: UserErrors.EmailNotVerified });
          } else if (e.code === UserErrors.UserBanned) {
            return reply.code(401).send({ code: UserErrors.UserBanned });
          }
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
