import { FastifyInstance, FastifyReply } from "fastify";
import fromUnixTime from "date-fns/fromUnixTime";
import { Stripe } from "stripe";
import { SubscriptionStatusDto, subscriptionStatusMap } from "./common";
import { SubscriptionStatus } from "@/types/common";
import { BillingErrors } from "@/types/errors";

export async function customerSubscriptionCreatedHandler({
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
    status: SubscriptionStatusDto;
    current_period_start: number;
    current_period_end: number;
  };
  const { company } =
    await fastify.resources.billingService.getObjectsByCustomerId(
      dataObject.customer
    );
  if (!company) {
    return reply.status(404).send({ code: BillingErrors.CompanyNotFound });
  }
  if (company.subscription?.stripeSubscriptionId) {
    return reply.status(409).send({ code: BillingErrors.AlreadySubscribed });
  }
  company.subscription = {
    stripeSubscriptionId: dataObject.id,
    status: subscriptionStatusMap[dataObject.status],
    periodStartAt: fromUnixTime(dataObject.current_period_start),
    periodEndAt: fromUnixTime(dataObject.current_period_end),
    inProgress: false,
  };
  company.subscriptionDeactivatedAt = undefined;

  company.subscription.trialingCardConfirmed =
    company.subscription.status == SubscriptionStatus.trialing;

  company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
  await company.save();
  return {};
}
