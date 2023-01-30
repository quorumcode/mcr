import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["code"],
    properties: {
      code: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
    },
    400: getErrorSchema([UserErrors.InvalidEmailVerifyCode]),
  },
} as const;

export const routeOfVerifyEmail: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/verify-email",
    schema,
    async handler(request, reply) {
      const { code } = request.body;
      try {
        await fastify.resources.userService.verifyUserEmail(code);
        return {};
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.InvalidEmailVerifyCode) {
            return reply
              .code(400)
              .send({ code: UserErrors.InvalidEmailVerifyCode });
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
