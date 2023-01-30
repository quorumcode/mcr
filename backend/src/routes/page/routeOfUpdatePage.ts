import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { pageRequestSchema } from "@/schemas/page";
import { PageErrors } from "@/types/errors";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  body: pageRequestSchema,
} as const;

export const routeOfUpdatePage: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/:id",
    schema,
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

        const existingPage = await fastify.resources.pageService.getPageByName(
          request.body.name
        );
        if (existingPage && existingPage.id !== page.id) {
          return reply
            .code(409)
            .send({ code: PageErrors.PageWitchNameAlreadyExists });
        }

        await fastify.resources.pageService.patchPage(page, request.body);
        return {};
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
