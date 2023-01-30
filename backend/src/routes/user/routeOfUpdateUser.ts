import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { User, UserDoc } from "@/models/User";
import { UserInfo, UserRole } from "@/types/common";
import { UserErrors } from "@/types/errors";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import bcrypt from "bcrypt";

export const schema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: { type: "string" },
            permissions: {
              type: "object",
              properties: {
                hasAdminControls: { type: "boolean" },
                canEditAllCompanies: { type: "boolean" },
                canGetUsersInfo: { type: "boolean" },
                canBanUsers: { type: "boolean" },
                canRemoveCompanies: { type: "boolean" },
                canWorkWitchReports: { type: "boolean" },
                canEditPages: { type: "boolean" },
                canCancelSubscriptions: { type: "boolean" },
                canConvertCompanyToTest: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export interface UserPatch {
  name?: string;
  email?: string;
  password?: string;
}

export const routeOfUpdateUser: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Params: FromSchema<typeof schema.params>;
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/:id",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const authUser = request.user as UserDoc; // Because we called verifyAuth prehandler
      const userId = request.params.id;
      let user;

      try {
        user = (await User.findById(userId).exec()) as UserDoc;
      } catch (e) {
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
      if (!user) {
        return reply.code(404).send({ code: UserErrors.UserNotFound });
      }

      if (authUser.role !== UserRole.manager) {
        return reply.code(403).send({ code: UserErrors.Forbidden });
      }

      const body: UserPatch = {
        name: request.body.name,
      };

      if (request.body.email) {
        body.email = request.body.email.toLowerCase();

        const existUser = await fastify.resources.userService.getUserByEmail(
          body.email
        );
        if (existUser && existUser.id != user.id) {
          return reply.code(409).send({ code: UserErrors.UserAlreadyExists });
        }
      }

      if (request.body.password) {
        body.password = await bcrypt.hash(request.body.password, 10);
      }

      const newUser = await fastify.resources.userService.patchUser(user, body);

      const { id, role = UserRole.user } = newUser;
      const result: UserInfo = {
        id,
        name: body.name,
        email: body.email,
        role,
        permissions: getRolePermissions(role),
      };

      return { data: result };
    },
  });
};
