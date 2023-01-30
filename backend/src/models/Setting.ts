import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  billing: Type.object().of({
    stripeProductId: Type.string({ required: true }),
    stripePriceId: Type.string({ required: true }),
  }),
});
schema.plugin(normalizeForReplyPlugin);

export const Setting = typedModel("Setting", schema, "settings");
export type SettingDoc = ExtractDoc<typeof schema>;
export type SettingProps = ExtractProps<typeof schema>;
