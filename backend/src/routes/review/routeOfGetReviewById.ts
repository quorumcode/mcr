import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import { review } from "@/schemas/properties";
import { ReviewErrors } from "@/types/errors";

const schema = {
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
      properties: {
        data: review,
      },
    },
  },
} as const;

export const routeOfGetReviewById: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "GET",
    url: "/:id",
    schema,
    async handler(request, reply) {
      const { id } = request.params;

      const review = await fastify.resources.reviewService.getReviewById(id);

      if (!review) {
        return reply.code(404).send({ code: ReviewErrors.ReviewNotFound });
      }

      return {
        data: review.toJSON(),
      };
    },
  });
};
