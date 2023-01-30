import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { pageResponseSchema } from "@/schemas/page";
import { PageErrors } from "@/types/errors";

export const schema = {
  querystring: {
    type: "object",
    properties: {
      by: { type: "string", enum: ["id", "name"] },
    },
  },
  params: {
    type: "object",
    required: ["selector"],
    properties: {
      selector: { type: "string" },
    },
  },
  response: {
    200: pageResponseSchema,
  },
} as const;

export const routeOfGetPage: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Querystring: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:selector",
    schema,
    async handler(request, reply) {
      let page;

      try {
        if (request.query.by === "name") {
          page = await fastify.resources.pageService.getPageByName(
            request.params.selector
          );
        } else {
          page = await fastify.resources.pageService.getPageById(
            request.params.selector
          );
        }

        if (!page) {
          return reply.status(404).send({ code: PageErrors.PageNotFound });
        }

        const result: FromSchema<typeof schema.response[200]> = page.toJSON();

        return result;
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
