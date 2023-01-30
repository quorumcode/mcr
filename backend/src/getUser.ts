import fp from "fastify-plugin";
import { UserDoc } from "@/models/User";

export const getUser = fp(async (fastify) => {
  fastify.decorateRequest("user", undefined);
  fastify.addHook("onRequest", async (request) => {
    const { authorization } = request.headers;
    if (!authorization) {
      return;
    }
    const token = authorization.split(" ")[1];
    try {
      const { id } = await fastify.resources.userService.verifyUserAccessToken(
        token
      );
      request.user = (await fastify.resources.userService.getUserById(
        id
      )) as UserDoc;
    } catch (e) {
      // Ok
    }
  });
});
