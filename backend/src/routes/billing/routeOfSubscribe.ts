import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { BillingErrors } from "@/types/errors";

export const schema = {
  response: {
    200: {
      type: "object",
      required: ["subscriptionId", "requiresAction", "clientSecret"],
      properties: {
        subscriptionId: { type: "string" },
        requiresAction: { type: "boolean" },
        clientSecret: { type: "string" },
      },
    },
  },
} as const;

export const routeOfSubscribe: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "POST",
    url: "/subscribe",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler

      const company = await fastify.resources.companyService.getCompanyByUser(
        user.id
      );
      if (!company) {
        return reply.code(404).send({ code: BillingErrors.CompanyNotFound });
      }

      if (company.subscription?.inProgress) {
        return reply
          .code(403)
          .send({ code: BillingErrors.SubscriptionInProgress });
      }

      try {
        return await fastify.resources.billingService.subscribe(user, company);
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code == BillingErrors.AlreadySubscribed) {
            return reply
              .code(409)
              .send({ code: BillingErrors.AlreadySubscribed });
          }
        }
        fastify.log.error(e, BillingErrors.BillingUnhandledError);
        return reply
          .code(500)
          .send({ code: BillingErrors.BillingUnhandledError });
      }
    },
  });
};
