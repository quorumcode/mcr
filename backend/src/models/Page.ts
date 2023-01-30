import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";
import { PageCategory } from "@/types/common";

export const schema = createSchema({
  name: Type.string({ required: true, index: true, unique: true }),
  title: Type.string({ required: true }),
  subtitle: Type.string(),
  category: Type.string({ enum: Object.values(PageCategory) }),
  createdAt: Type.date({ required: true }),
  updatedAt: Type.date({ required: true }),
  body: Type.string(),
  withHeaderImage: Type.boolean(),
});
schema.plugin(normalizeForReplyPlugin);

export const Page = typedModel("Page", schema, "pages");
export type PageDoc = ExtractDoc<typeof schema>;
export type PageProps = ExtractProps<typeof schema>;
