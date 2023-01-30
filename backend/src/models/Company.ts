import {
  createSchema,
  ExtractDoc,
  ExtractProps,
  Type,
  typedModel,
} from "ts-mongoose";
import { companyCategories } from "@/companyCategories";
import { schema as userSchema } from "./User";
import {
  EmailTemplateName,
  SubscriptionStatus,
  WidgetType,
} from "@/types/common";
import { normalizeForReplyPlugin } from "@/helpers/normalizeForReply";

export const schema = createSchema({
  user: Type.ref(Type.objectId({ required: true })).to("User", userSchema),
  createdAt: Type.date({ required: true }),
  name: Type.string({ required: true, index: true }),
  categories: Type.array().of(Type.string({ enum: companyCategories })),
  alert: Type.object().of({
    title: Type.string({ required: true }),
    body: Type.string({ required: true }),
  }),
  address: Type.object().of({
    route: Type.string({ required: true }),
    streetNumber: Type.string(),
    town: Type.string({ required: true }),
    administrativeDivision: Type.string({ required: true }),
    postalCode: Type.string({ required: true }),
    state: Type.string(),
  }),
  about: Type.string(),
  logo: Type.string(),
  webSite: Type.string(),
  contactPhone: Type.string(),
  emailForReviewNotifications: Type.string(),
  emailForNegativeReviewAlerts: Type.string(),
  isRemoved: Type.boolean(),
  bccDelay: Type.number(),
  reminderDelay: Type.number(),
  isTest: Type.boolean({ default: false }),
  isFingerprintDisable: Type.boolean({ default: false }),
  emailTemplates: Type.object().of({
    [EmailTemplateName.invitation]: Type.string(),
    [EmailTemplateName.reminder]: Type.string(),
  }),
  emailsForImportHook: Type.array({ index: true }).of(Type.string()),
  widgetConfig: Type.object().of({
    widgetType: Type.string({
      required: true,
      enum: Object.values(WidgetType),
    }),
    secondaryColor: Type.string(),
    backgroundColor: Type.string(),
    cardBackground: Type.string(),
    color: Type.string({ required: true }),
    width: Type.number({ required: true }),
    height: Type.number({ required: true }),
  }),
  subscription: Type.object().of({
    status: Type.string({
      required: true,
      enum: Object.values(SubscriptionStatus),
    }),
    periodStartAt: Type.date({ required: true }),
    periodEndAt: Type.date({ required: true }),
    willBeCanceledAt: Type.date(),
    stripeSubscriptionId: Type.string(),
    trialEndingEmailSent: Type.boolean(),
    inProgress: Type.boolean({ default: false }),
    trialingCardConfirmed: Type.boolean({ default: false }),
  }),
  subscriptionDeactivatedAt: Type.date(),
  ...({} as {
    generatedField: string;
    isActiveSubscription: () => boolean;
  }),
  ...({} as {
    generatedField: string;
    isRealSubscription: () => boolean;
  }),
});
schema
  .virtual("isActiveSubscription")
  .get(function isActiveSubscription(this: CompanyDoc): boolean {
    if (!this.subscription) {
      return false;
    }
    return [SubscriptionStatus.active, SubscriptionStatus.trialing].includes(
      this.subscription.status
    );
  });
schema
  .virtual("isRealSubscription")
  .get(function isRealSubscription(this: CompanyDoc): boolean {
    return !!this.subscription?.stripeSubscriptionId;
  });
schema.index({ name: "text" });
schema.plugin(normalizeForReplyPlugin);

export const Company = typedModel("Company", schema, "companies");
export type CompanyDoc = ExtractDoc<typeof schema>;
export type CompanyProps = ExtractProps<typeof schema>;
