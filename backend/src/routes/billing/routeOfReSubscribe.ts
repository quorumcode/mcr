import { UserDoc } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { BillingErrors } from "@/types/errors";
import { FastifyPluginAsync } from "fastify";

export const schema = {
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfReSubscribe: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "POST",
    url: "/resubscribe",
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

      if (!company.subscription?.stripeSubscriptionId) {
        return reply
          .code(404)
          .send({ code: BillingErrors.CompanySubscriptionNotFound });
      }

      if (!user.stripeCustomerId) {
        return reply.code(404).send({ code: BillingErrors.CustomerNotExists });
      }

      if (company.subscription?.inProgress) {
        return reply
          .code(403)
          .send({ code: BillingErrors.SubscriptionInProgress });
      }

      try {
        await fastify.resources.billingService.reSubscribe(company);
      } catch (e) {
        fastify.log.error(e, "Resubscribe error");
        if (e instanceof ServiceError) {
          if (e.code == BillingErrors.AlreadySubscribed) {
            return reply
              .code(409)
              .send({ code: BillingErrors.AlreadySubscribed });
          } else if (e.code == BillingErrors.ErrorSubscriptionNotCanceled) {
            return reply
              .code(400)
              .send({ code: BillingErrors.ErrorSubscriptionNotCanceled });
          } else if (e.code == BillingErrors.ErrorRetrieveStripeSubscription) {
            return reply
              .code(502)
              .send({ code: BillingErrors.ErrorRetrieveStripeSubscription });
          } else if (e.code == BillingErrors.ErrorUpdateStripeSubscription) {
            return reply
              .code(502)
              .send({ code: BillingErrors.ErrorUpdateStripeSubscription });
          } else if (e.code == BillingErrors.ErrorUserNotSubscribed) {
            return reply
              .code(400)
              .send({ code: BillingErrors.ErrorUserNotSubscribed });
          }
        }
        fastify.log.error(e, BillingErrors.BillingUnhandledError);
        return reply
          .code(500)
          .send({ code: BillingErrors.BillingUnhandledError });
      }

      return {};
    },
  });
};
