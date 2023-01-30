import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { schema as companySchema } from "@/models/Company";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  name: Type.string(),
  email: Type.string({ required: true }),
  company: Type.ref(Type.objectId({ required: true, index: true })).to(
    "Company",
    companySchema
  ),
  createdAt: Type.date({ required: true }),
  lastInvitedAt: Type.date(),
  lastReviewAt: Type.date(),
  batchId: Type.string(),
  fingerprint: Type.string(),
  sendInviteAt: Type.date(),
});
schema.index({ email: 1, company: 1 }, { unique: true });
schema.plugin(normalizeForReplyPlugin);

export const Client = typedModel("Client", schema, "clients");
export type ClientDoc = ExtractDoc<typeof schema>;
export type ClientProps = ExtractProps<typeof schema>;
