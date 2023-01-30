import { FastifyInstance, FastifyReply } from "fastify";
import { Stripe } from "stripe";
import { PaymentStatus } from "@/types/common";

export async function paymentIntentHandler({
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
    amount: number; // 9900 = 99$
    created: number; // unix timestamp
    currency: string;
    customer: string; // ID
    invoice: string; // ID
    status: PaymentStatus;
  };

  await fastify.resources.billingService.savePayment(dataObject);

  return {};
}
