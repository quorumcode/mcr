import { FastifyPluginAsync } from "fastify";
// @ts-ignore
import countryCodes from "country-codes-list";

export const schema = {
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "code"],
            properties: {
              name: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetCountries: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/country",
    schema,
    async handler() {
      const data = countryCodes.customArray(
        {
          name: "{countryNameEn}",
          code: "{countryCode}",
        },
        { sortDataBy: "countryNameEn" }
      );
      return { data };
    },
  });
};
