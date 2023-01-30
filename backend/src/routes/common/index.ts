import { FastifyPluginAsync } from "fastify";
import { routeOfGetCountries } from "./routeOfGetCountries";

export const commonRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfGetCountries);

  /*fastify.route({
    method: "GET",
    url: "/test/:id",
    async handler(req) {
      // @ts-ignore
      return fastify.resources.billingService.getStripeCustomer(req.params.id);
    },
  });*/
};
