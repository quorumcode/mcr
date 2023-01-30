import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { schema as companySchema } from "@/models/Company";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";
import { VisitSource } from "@/types/common";

export const schema = createSchema({
  company: Type.ref(Type.objectId({ required: true, index: true })).to(
    "Company",
    companySchema
  ),
  visitDate: Type.date({ required: true }),
  fingerprint: Type.string({ required: true }),
  visitSource: Type.string({
    required: true,
    default: VisitSource.site,
    enum: Object.values(VisitSource),
  }),
});
schema.plugin(normalizeForReplyPlugin);

export const CompanyVisit = typedModel("CompanyVisit", schema, "companyVisits");
export type CompanyVisitDoc = ExtractDoc<typeof schema>;
export type CompanyVisitProps = ExtractProps<typeof schema>;
