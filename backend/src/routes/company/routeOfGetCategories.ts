import { FastifyPluginAsync } from "fastify";
import { companyCategories } from "@/companyCategories";

const schema = {
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
} as const;

export const routeOfGetCategories: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/category",
    schema,
    async handler() {
      return { data: companyCategories.sort() };
    },
  });
};
