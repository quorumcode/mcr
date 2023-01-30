import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { schema as companySchema } from "@/models/Company";
import { schema as clientSchema } from "@/models/Client";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  value: Type.string({ required: true, index: true, unique: true }),
  company: Type.ref(Type.objectId({ required: true, index: true })).to(
    "Company",
    companySchema
  ),
  client: Type.ref(Type.objectId({ index: true })).to("Client", clientSchema),
  createdAt: Type.date({ required: true }),
});
schema.plugin(normalizeForReplyPlugin);

export const ReviewToken = typedModel("ReviewToken", schema, "reviewTokens");
export type ReviewTokenDoc = ExtractDoc<typeof schema>;
export type ReviewTokenProps = ExtractProps<typeof schema>;
