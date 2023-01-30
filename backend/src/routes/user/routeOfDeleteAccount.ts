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

export const routeOfDeleteAccount: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
  }>({
    method: "DELETE",
    url: "/:id/delete",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc;

      if (user.id !== request.params.id) {
        return reply.code(403).send({ code: UserErrors.Forbidden });
      }

      try {
        let company;
        try {
          company = await fastify.resources.companyService.getCompanyByUser(
            request.params.id
          );
        } catch (e) {
          fastify.log.error(e, UserErrors.UserUnhandledError);
          return reply.code(500).send({ code: UserErrors.UserUnhandledError });
        }

        if (!company) {
          return reply.code(404).send({ code: UserErrors.CompanyNotFound });
        }

        await fastify.resources.companyService.patchCompany(company, {
          isRemoved: true,
        });

        await fastify.resources.userService.setUserBan(request.params.id, true);

        return {};
      } catch (e) {
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
