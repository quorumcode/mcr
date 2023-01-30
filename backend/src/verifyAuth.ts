import { FastifyAuthFunction } from "fastify-auth";
import { UserErrors } from "./types/errors";

export const verifyAuth: FastifyAuthFunction = async function verifyAuth(
  request,
  reply
) {
  const { authorization } = request.headers;
  if (!authorization) {
    return reply.code(401).send({ code: UserErrors.MissingAuthorizationToken });
  }
  if (!request.user) {
    return reply.code(401).send({ code: UserErrors.InvalidAuthorizationToken });
  }
  if (request.user.isBanned) {
    return reply.code(403).send({ code: UserErrors.UserBanned });
  }
};
