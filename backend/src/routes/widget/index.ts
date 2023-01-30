import { FastifyPluginAsync } from "fastify";
import { routeOfGetWidgetData } from "@/routes/widget/routeOfGetWidgetData";
import { routeOfSendInvite } from "@/routes/widget/routeOfSendInvite";

export const widgetRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfGetWidgetData);
  fastify.register(routeOfSendInvite);
};
