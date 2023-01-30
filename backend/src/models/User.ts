import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { UserRole } from "@/types/common";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  name: Type.string({ required: true }),
  email: Type.string({ required: true, unique: true }),
  password: Type.string({ required: true }),
  role: Type.string({ default: "user", enum: Object.values(UserRole) }),
  isEmailVerified: Type.boolean({ default: false }),
  isTest: Type.boolean({ default: false }),
  verifyEmailCode: Type.string(),
  confirmationToken: Type.string(),
  changePasswordCode: Type.string(),
  isBanned: Type.boolean(),
  stripeCustomerId: Type.string({ index: true }),
});
schema.plugin(normalizeForReplyPlugin);

export const User = typedModel("User", schema, "users");
export type UserDoc = ExtractDoc<typeof schema>;
export type UserProps = ExtractProps<typeof schema>;
