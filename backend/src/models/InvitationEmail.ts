import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { schema as companySchema } from "@/models/Company";
import { schema as clientSchema } from "@/models/Client";
import { schema as reviewTokenSchema } from "@/models/ReviewToken";
import { EmailTemplateName } from "@/types/common";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  company: Type.ref(Type.objectId({ required: true })).to(
    "Company",
    companySchema
  ),
  client: Type.ref(Type.objectId({ required: true })).to(
    "Client",
    clientSchema
  ),
  reviewToken: Type.ref(Type.objectId({ required: true })).to(
    "ReviewToken",
    reviewTokenSchema
  ),
  template: Type.string({
    required: true,
    enum: Object.values(EmailTemplateName),
  }),
  createdAt: Type.date({ required: true }),
  sendAt: Type.date({ required: true }),
  needRemind: Type.boolean(),
  isReminded: Type.boolean(),
});
schema.plugin(normalizeForReplyPlugin);

export const InvitationEmail = typedModel(
  "InvitationEmail",
  schema,
  "invitationEmails"
);
export type InvitationEmailDoc = ExtractDoc<typeof schema>;
export type InvitationEmailProps = ExtractProps<typeof schema>;
