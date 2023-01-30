import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { UserErrors } from "@/types/errors";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfBan: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "POST",
    url: "/:id/ban",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      if (user.role !== "manager") {
        return reply.code(403).send({ code: UserErrors.Forbidden });
      }
      await fastify.resources.userService.setUserBan(request.params.id, true);
      return {};
    },
  });
};
