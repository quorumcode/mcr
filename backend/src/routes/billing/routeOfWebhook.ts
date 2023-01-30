import { FastifyPluginAsync } from "fastify";
import fastifyRawBody from "fastify-raw-body";
import { customerSubscriptionCreatedHandler } from "./webhookHandlers/customerSubscriptionCreatedHandler";
import { customerSubscriptionDeletedHandler } from "./webhookHandlers/customerSubscriptionDeletedHandler";
import { customerSubscriptionUpdatedHandler } from "./webhookHandlers/customerSubscriptionUpdatedHandler";
import { paymentIntentHandler } from "@/routes/billing/webhookHandlers/paymentIntentHandler";

/**
 * Example for testing
 * docker run --rm -it --network="host" stripe/stripe-cli listen --api-key sk_test_... --forward-to localhost:3002/billing/webhook
 */
export const routeOfUWebhook: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyRawBody, {
    field: "rawBody",
  });
  fastify.route({
    method: "POST",
    url: "/webhook",
    async handler(request, reply) {
      fastify.log.info("WEBHOOK HEADERS", request.headers);
      const event = fastify.resources.billingService.getWebhookEvent(
        request.rawBody,
        request.headers["stripe-signature"] as string
      );
      const params = {
        fastify,
        reply,
        event,
      };

      fastify.log.info("### STRIPE EVENT RESULT ###", event);

      if (event.type === "customer.subscription.created") {
        return await customerSubscriptionCreatedHandler(params);
      } else if (event.type === "customer.subscription.deleted") {
        return await customerSubscriptionDeletedHandler(params);
      } else if (event.type === "customer.subscription.updated") {
        return await customerSubscriptionUpdatedHandler(params);
      } else if (
        ["payment_intent.succeeded", "payment_intent.payment_failed"].includes(
          event.type
        )
      ) {
        return await paymentIntentHandler(params);
      }

      return {};
    },
  });
};
