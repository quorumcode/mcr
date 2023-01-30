import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { FromSchema } from "json-schema-to-ts";
import { PageErrors } from "@/types/errors";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
} as const;

export const routeOfRemovePage: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Params: FromSchema<typeof schema.params> }>({
    method: "DELETE",
    url: "/:id",
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      try {
        const permissions = getRolePermissions(user.role);
        if (!permissions.canEditPages) {
          return reply.code(403).send({ code: PageErrors.Forbidden });
        }

        const page = await fastify.resources.pageService.getPageById(
          request.params.id
        );
        if (!page) {
          return reply.code(404).send({ code: PageErrors.PageNotFound });
        }

        await fastify.resources.pageService.removePage(page);
        return true;
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
