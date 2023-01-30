// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyInstance } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { envSchema } from "@/schemas/env";
import { FastifyAuthFunction } from "fastify-auth";
import { UserDoc } from "@/models/User";
import { Resources } from "@/getResources";

declare module "fastify" {
  interface FastifyInstance {
    env: FromSchema<typeof envSchema>;
    resources: Resources;
    verifyAuth: FastifyAuthFunction;
  }

  interface FastifyRequest {
    user: UserDoc | undefined;
  }
}
