import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { password } from "@/schemas/properties";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["code", "password"],
    properties: {
      code: {
        type: "string",
      },
      password,
    },
  },
  response: {
    200: {
      type: "object",
    },
    400: getErrorSchema([UserErrors.InvalidChangePasswordCode]),
  },
} as const;

export const routeOfChangePassword: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/change-password",
    schema,
    async handler(request, reply) {
      const { code, password } = request.body;
      try {
        await fastify.resources.userService.changeUserPasswordByCode(
          code,
          password
        );
        return {};
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.InvalidChangePasswordCode) {
            return reply
              .code(400)
              .send({ code: UserErrors.InvalidChangePasswordCode });
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
