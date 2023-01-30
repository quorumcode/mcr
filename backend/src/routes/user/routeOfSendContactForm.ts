import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { UserErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["email", "body"],
    properties: {
      email: { type: "string" },
      body: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfSendContactForm: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/send-contact-form",
    schema,
    async handler(request, reply) {
      const { email, body } = request.body;
      try {
        await fastify.resources.mailService.sgSendContactForm(email, { body });
        return reply.code(200).send();
      } catch (e) {
        return reply.code(502).send({ code: UserErrors.ContactFormSendError });
      }
    },
  });
};
