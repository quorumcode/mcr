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
import { ReviewSource } from "@/types/common";

export const schema = createSchema({
  company: Type.ref(Type.objectId({ required: true, index: true })).to(
    "Company",
    companySchema
  ),
  client: Type.ref(Type.objectId({ required: true })).to(
    "Client",
    clientSchema
  ),
  createdAt: Type.date({ required: true }),
  rate: Type.number({ required: true }),
  message: Type.string(),
  reply: Type.object().of({
    createdAt: Type.date({ required: true }),
    message: Type.string({ required: true }),
  }),
  reportedAt: Type.date(),
  reportReason: Type.string(),
  anonymousReports: Type.array().of({
    reportedAt: Type.date(),
    reportReason: Type.string(),
    fingerprint: Type.string(),
  }),
  isRemoved: Type.boolean(),
  source: Type.string({
    enum: Object.values(ReviewSource),
  }),
  ...({} as {
    generatedField: string;
    isAnonymousOnlyReported: () => boolean;
  }),
});
schema
  .virtual("isAnonymousOnlyReported")
  .get(function isAnonymousOnlyReported(this: ReviewDoc): boolean {
    if (!this.anonymousReports) {
      return false;
    } else {
      if (
        (this.anonymousReports.length > 0 && !this.reportedAt) ||
        this.anonymousReports.some(
          (anon) => anon.reportedAt === this.reportedAt
        )
      ) {
        return true;
      }
    }
    return false;
  });
schema.plugin(normalizeForReplyPlugin);

export const Review = typedModel("Review", schema, "reviews");
export type ReviewDoc = ExtractDoc<typeof schema>;
export type ReviewProps = ExtractProps<typeof schema>;
