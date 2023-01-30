import { getRolePermissions } from "@/helpers/getRolePermissions";
import { UserDoc } from "@/models/User";
import { PageErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";

export const schema = {
  body: {
    type: "object",
    required: ["image"],
    properties: {
      image: {
        type: "string",
        pattern: "[^-A-Za-z0-9+/=]|^$|=[^=]|={3,}$",
      }, // base64,
    },
  },
  response: {
    200: {
      type: "object",
      required: ["success", "file"],
      properties: {
        success: {
          type: "number",
        },
        file: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
        },
      },
    },
  },
} as const;

export const routeOfUploadImage: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "POST",
    url: "/upload-image",
    //schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      try {
        const permissions = getRolePermissions(user.role);
        if (!permissions.canEditPages) {
          return reply.code(403).send({ code: PageErrors.Forbidden });
        }

        const image = request.body.image;
        let imageUrl;
        if (image) {
          try {
            imageUrl = await fastify.resources.imageService.uploadImageForPage(
              image
            );
          } catch (e) {
            fastify.log.error(e);
            return {
              success: 0,
              file: {
                url: "",
              },
            };
          }
        }

        return {
          success: 1,
          file: {
            url: imageUrl,
          },
        };
      } catch (e) {
        fastify.log.error(e, PageErrors.PageUnhandledError);
        return reply.code(500).send({ code: PageErrors.PageUnhandledError });
      }
    },
  });
};
