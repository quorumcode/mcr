import { FastifyPluginAsync } from "fastify";
import { routeOfUpdatePaymentMethod } from "./routeOfUpdatePaymentMethod";
import { routeOfUWebhook } from "./routeOfWebhook";
import { routeOfGetPaymentMethod } from "./routeOfGetPaymentMethod";
import { routeOfSubscribe } from "./routeOfSubscribe";
import { routeOfGetPayments } from "@/routes/billing/routeOfGetPayments";
import { routeOfCancelSubscription } from "@/routes/billing/routeOfCancelSubscription";
import { routeOfReSubscribe } from "./routeOfReSubscribe";

export const billingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfUWebhook);
  fastify.register(routeOfUpdatePaymentMethod);
  fastify.register(routeOfGetPaymentMethod);
  fastify.register(routeOfSubscribe);
  fastify.register(routeOfGetPayments);
  fastify.register(routeOfCancelSubscription);
  fastify.register(routeOfReSubscribe);
};
