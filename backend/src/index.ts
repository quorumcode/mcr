import Fastify from "fastify";
import fp from "fastify-plugin";
import fastifyEnv from "fastify-env";
import fastifyCors from "fastify-cors";
import fastifyAuth from "fastify-auth";
import fastifyStatic from "fastify-static";
import fastifyCron from "fastify-cron";
import { envSchema } from "@/schemas/env";
import mongoose from "mongoose";
import { verifyAuth } from "@/verifyAuth";
import { getUser } from "@/getUser";
import path from "path";
import { routes } from "@/routes";
import { cronJobsConfig } from "@/cronJobsConfig";
import { getResources } from "@/getResources";
import process from "node:process";

const server = Fastify({
  logger: true,
});

process.on("unhandledRejection", (err, origin) => {
  server.log.error(err);
});

process.on("uncaughtException", (err, origin) => {
  server.log.error(err);
  process.exit(1);
});

server.register(fastifyStatic, {
  root: path.resolve("public-static"),
  prefix: "/public-static/",
});
server.register(fastifyEnv, {
  confKey: "env",
  schema: envSchema,
});
server.register(fastifyCors, { exposedHeaders: "Content-Disposition" });
server.register(getUser);
server.register(fastifyAuth);
server.register(fastifyCron, cronJobsConfig);

server.register(
  fp(async (fastify) => {
    fastify.decorate("resources", getResources(fastify.env, fastify.log), [
      "env",
    ]);
    fastify.decorate("verifyAuth", verifyAuth);
  })
);

server.register(async (fastify) => {
  const connectionString = fastify.env.DB_CONNECTION_STRING;
  mongoose.set("debug", true);
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    server.log.error(e);
  }
});

server.get("/health-check", async (request, reply) => {
  return reply.send({ iAmAlive: true });
});

server.register(routes, { prefix: process.env.BACKEND_ROUTE_PREFIX as string });

const start = async () => {
  try {
    await server.listen(process.env.BACKEND_INTERNAL_PORT as string, "0.0.0.0");
    server.resources.billingService.setup();
    server.cron.startAllJobs();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
