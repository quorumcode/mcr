import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { PaymentStatus } from "@/types/common";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";
import { schema as companySchema } from "@/models/Company";

export const schema = createSchema({
  company: Type.ref(Type.objectId({ required: true })).to(
    "Company",
    companySchema
  ),
  stripePaymentIntentId: Type.string({ required: true, index: true }),
  createdAt: Type.date({ required: true }),
  amount: Type.number({ required: true }),
  currency: Type.string({ required: true }),
  status: Type.string({
    required: true,
    enum: Object.values(PaymentStatus),
  }),
  url: Type.string({ required: true }),
});
schema.plugin(normalizeForReplyPlugin);

export const Payment = typedModel("Payment", schema, "payments");
export type PaymentDoc = ExtractDoc<typeof schema>;
export type PaymentProps = ExtractProps<typeof schema>;
