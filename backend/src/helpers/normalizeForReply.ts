import { Document, LeanDocument, Schema } from "mongoose";

type NormalizedDoc<T extends Document> = Omit<
  LeanDocument<T>,
  "_id" | "__v"
> & {
  id: T["_id"];
};

export function normalizeArrayForReply<T extends Document>(
  docs: T[]
): NormalizedDoc<T>[] {
  return docs.map((doc) => doc.toJSON() as NormalizedDoc<T>);
}

export function normalizeForReplyPlugin(schema: Schema): void {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(doc: Document, ret: Record<string, any>) {
      delete ret._id;
    },
  });
}
