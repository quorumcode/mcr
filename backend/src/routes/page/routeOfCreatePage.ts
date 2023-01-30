import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { pageRequestSchema, pageResponseSchema } from "@/schemas/page";
import { PageErrors } from "@/types/errors";

export const schema = {
  body: pageRequestSchema,
  response: {
    200: pageResponseSchema,
  },
} as const;

export const routeOfCreatePage: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      const permissions = getRolePermissions(user.role);
      if (!permissions.canEditPages) {
        return reply.code(403).send({ code: PageErrors.Forbidden });
      }

      try {
        const existingPage = await fastify.resources.pageService.getPageByName(
          request.body.name
        );
        if (existingPage) {
          return reply
            .code(409)
            .send({ code: PageErrors.PageWitchNameAlreadyExists });
        }

        const result = await fastify.resources.pageService.createPage(
          request.body
        );
        return result.toJSON();
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
