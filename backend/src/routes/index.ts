import { FastifyPluginAsync } from "fastify";
import { clientRoutes } from "./client";
import { reviewRoutes } from "./review";
import { widgetRoutes } from "./widget";
import { companyRoutes } from "./company";
import { userRoutes } from "./user";
import { commonRoutes } from "@/routes/common";
import { billingRoutes } from "@/routes/billing";
import { pageRoutes } from "@/routes/page";

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(clientRoutes, { prefix: "/client" });
  fastify.register(reviewRoutes, { prefix: "/review" });
  fastify.register(widgetRoutes, { prefix: "/widget" });
  fastify.register(companyRoutes, { prefix: "/company" });
  fastify.register(userRoutes, { prefix: "/user" });
  fastify.register(commonRoutes, { prefix: "/common" });
  fastify.register(billingRoutes, { prefix: "/billing" });
  fastify.register(pageRoutes, { prefix: "/page" });
};
