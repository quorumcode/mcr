import { FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { BillingErrors } from "@/types/errors";

export const schema = {
  response: {
    200: {
      type: "object",
      required: ["email", "name", "card", "address"],
      properties: {
        email: { type: "string" },
        name: { type: "string" },
        card: {
          type: "object",
          required: ["type", "month", "year", "lastDigits"],
          properties: {
            type: { type: "string" },
            month: { type: "number" },
            year: { type: "number" },
            lastDigits: { type: "string" },
          },
        },
        address: {
          type: "object",
          required: ["town", "countryCode", "line1", "postalCode"],
          properties: {
            town: { type: "string" },
            countryCode: { type: "string" },
            line1: { type: "string" },
            postalCode: { type: "string" },
          },
        },
      },
    },
  },
} as const;

export const routeOfGetPaymentMethod: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/payment-method",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      if (!user.stripeCustomerId) {
        await fastify.resources.billingService.createStripeCustomer(user);
        if (!user.stripeCustomerId) {
          return reply
            .code(404)
            .send({ code: BillingErrors.CustomerNotExists });
        }
      }

      try {
        const paymentMethod =
          await fastify.resources.billingService.getPaymentMethod(
            user.stripeCustomerId
          );

        if (!paymentMethod) {
          return reply
            .code(404)
            .send({ code: BillingErrors.PaymentMethodNotExists });
        }

        const result: FromSchema<typeof schema.response[200]> = paymentMethod;

        return result;
      } catch (e) {
        fastify.log.error(e, BillingErrors.BillingUnhandledError);
        return reply
          .code(500)
          .send({ code: BillingErrors.BillingUnhandledError });
      }
    },
  });
};
