import { ServiceError } from "@/services/ServiceError";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { password } from "@/schemas/properties";
import { UserDoc } from "@/models/User";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: {
        ...password,
      },
      newPassword: {
        ...password,
      },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfChangeAccountPassword: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/change-account-password",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc;
      const { oldPassword, newPassword } = request.body;
      try {
        await fastify.resources.userService.changeUserPassword(
          user,
          oldPassword,
          newPassword
        );
        return reply.code(200).send();
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserBanned) {
            return reply.code(403).send({ code: UserErrors.UserBanned });
          }
          return reply.code(400).send({ code: e.code });
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
