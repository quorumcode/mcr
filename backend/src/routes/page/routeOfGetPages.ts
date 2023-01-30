import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { normalizeArrayForReply } from "@/helpers/normalizeForReply";
import { pageProperties } from "@/schemas/page";
import { PageErrors } from "@/types/errors";

export const schema = {
  response: {
    200: {
      type: "object",
      required: ["data"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name", "title"],
            properties: {
              id: pageProperties.id,
              name: pageProperties.name,
              title: pageProperties.title,
              category: pageProperties.category,
            },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetPages: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/",
    schema,
    async handler(request, reply) {
      try {
        const pages = await fastify.resources.pageService.getPages();

        const result: FromSchema<typeof schema.response[200]> = {
          data: normalizeArrayForReply(pages),
        };

        return result;
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
