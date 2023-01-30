import { FastifyPluginAsync } from "fastify";
import { UserDoc } from "@/models/User";
import { FromSchema } from "json-schema-to-ts";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { ServiceError } from "@/services/ServiceError";
import { BillingErrors } from "@/types/errors";

export const schema = {
  body: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
      immediately: { type: "boolean" },
    },
  },
  response: {
    200: {
      type: "object",
    },
  },
} as const;

export const routeOfCancelSubscription: FastifyPluginAsync = async (
  fastify
) => {
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/cancel-subscription",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { companyId, immediately = false } = request.body;

      const company = await fastify.resources.companyService.getCompanyById(
        companyId
      );
      if (!company) {
        return reply.code(404).send({ code: BillingErrors.CompanyNotFound });
      }

      const permissions = getRolePermissions(user.role);
      const isOwner = user.id === company.user.toString();
      if (!isOwner && !permissions.canCancelSubscriptions) {
        return reply.code(403).send({ code: BillingErrors.Forbidden });
      }
      // Allow immediately only for admins
      if (immediately && !permissions.canCancelSubscriptions) {
        return reply.code(403).send({ code: BillingErrors.Forbidden });
      }

      try {
        if (immediately) {
          await fastify.resources.billingService.cancelSubscriptionImmediately(
            company
          );
        } else {
          await fastify.resources.billingService.cancelSubscription(company);
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code == BillingErrors.ErrorDeleteStripeSubscription) {
            return reply
              .code(502)
              .send({ code: BillingErrors.ErrorDeleteStripeSubscription });
          } else if (e.code == BillingErrors.ErrorUpdateStripeSubscription) {
            return reply
              .code(502)
              .send({ code: BillingErrors.ErrorUpdateStripeSubscription });
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
