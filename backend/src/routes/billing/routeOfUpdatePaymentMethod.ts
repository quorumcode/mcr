import { FastifyPluginAsync } from "fastify";
import { email, userName } from "@/schemas/properties";
import { FromSchema } from "json-schema-to-ts";
import { UserDoc } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { BillingErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    properties: {
      name: userName,
      email,
      card: {
        type: "object",
        required: ["number", "month", "year", "cvv"],
        properties: {
          number: { type: "string" },
          month: { type: "string" },
          year: { type: "string" },
          cvv: { type: "string" },
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
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfUpdatePaymentMethod: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{
    Body: FromSchema<typeof schema.body>;
  }>({
    method: "PATCH",
    url: "/payment-method",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      if (!user.stripeCustomerId) {
        try {
          await fastify.resources.billingService.createStripeCustomer(user);
        } catch (e) {
          fastify.log.error(e, "createStripeCustomer error");
          if (e instanceof ServiceError) {
            if (e.code == BillingErrors.ErrorCreateStripeCustomer) {
              return reply
                .code(502)
                .send({ code: BillingErrors.ErrorCreateStripeCustomer });
            }
          }
          fastify.log.error(e, BillingErrors.BillingUnhandledError);
          return reply
            .code(500)
            .send({ code: BillingErrors.BillingUnhandledError });
        }
      }

      await fastify.resources.billingService.updatePaymentMethod(
        user.stripeCustomerId as string,
        request.body,
        user.isTest as boolean
      );

      return {};
    },
  });
};
