import { SubscriptionStatus } from "@/types/common";
import { BillingErrors } from "@/types/errors";
import { FastifyInstance, FastifyReply } from "fastify";
import { Stripe } from "stripe";

export async function customerSubscriptionDeletedHandler({
  fastify,
  reply,
  event,
}: {
  fastify: FastifyInstance;
  reply: FastifyReply;
  event: Stripe.Event;
}): Promise<{}> {
  const dataObject = event.data.object as {
    id: string;
    customer: string;
  };
  const { company } =
    await fastify.resources.billingService.getObjectsByCustomerId(
      dataObject.customer
    );
  if (!company) {
    return reply.status(404).send({ code: BillingErrors.CompanyNotFound });
  }
  if (
    !company.subscription ||
    company.subscription.stripeSubscriptionId !== dataObject.id
  ) {
    return reply
      .status(404)
      .send({ code: BillingErrors.CompanySubscriptionNotFound });
  }
  company.subscription.inProgress = false;
  company.subscription.trialingCardConfirmed = false;

  await fastify.resources.billingService.deactivateSubscription(company);
  return {};
}
