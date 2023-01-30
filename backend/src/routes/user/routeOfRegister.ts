import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { email, password, userName as name } from "@/schemas/properties";
import { getErrorSchema } from "@/schemas/error";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name,
      email,
      password,
    },
  },
  response: {
    200: {
      type: "object",
      required: ["id"],
      properties: {
        id: {
          type: "string",
        },
      },
    },
    409: getErrorSchema([UserErrors.UserAlreadyExists]),
  },
} as const;

export const routeOfRegister: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/register",
    schema,
    async handler(request, reply) {
      const { name, email, password } = request.body;
      const normalizedEmail = email.toLowerCase();

      let user;
      try {
        user = await fastify.resources.userService.createUser({
          name,
          email: normalizedEmail,
          password,
        });
      } catch (e) {
        if (
          e instanceof ServiceError &&
          e.code === UserErrors.UserAlreadyExists
        ) {
          return reply.code(409).send({ code: UserErrors.UserAlreadyExists });
        }
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }

      if (user.verifyEmailCode) {
        const url = `${fastify.env.VERIFY_EMAIL_BASE_URL}/${user.verifyEmailCode}?confirmationToken=${user.confirmationToken}`;
        try {
          await fastify.resources.mailService.sgSendEmailVerify(
            normalizedEmail,
            {
              url,
              name: user.name,
            }
          );
        } catch (e) {
          fastify.log.error(e, "Mail not sent");
        }
      }

      return { id: user.id };
    },
  });
};
