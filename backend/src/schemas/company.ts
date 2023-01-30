import { companyName as name } from "@/schemas/properties";
import { companyCategories } from "@/companyCategories";
import {
  EmailTemplateName,
  SubscriptionStatus,
  WidgetType,
} from "@/types/common";

export const requestProperties = {
  name,
  categories: {
    type: "array",
    items: {
      type: "string",
      enum: companyCategories,
    },
  },
  address: {
    type: "object",
    required: ["route", "town", "administrativeDivision", "postalCode"],
    properties: {
      route: { type: "string", maxLength: 128 },
      streetNumber: { type: "string", maxLength: 128 },
      town: { type: "string", maxLength: 128 },
      administrativeDivision: { type: "string", maxLength: 128 },
      postalCode: { type: "string", maxLength: 128 },
      state: { type: "string", maxLength: 128 },
    },
  },
  about: {
    type: "string",
    maxLength: 1000,
  },
  logo: {
    type: "string",
    pattern: "[^-A-Za-z0-9+/=]|^$|=[^=]|={3,}$",
  }, // base64
  webSite: { type: "string", maxLength: 128 },
  contactPhone: { type: "string", maxLength: 128 },
  emailForReviewNotifications: { type: "string", maxLength: 128 },
  emailForNegativeReviewAlerts: { type: "string", maxLength: 128 },
  emailTemplates: {
    type: "object",
    properties: {
      [EmailTemplateName.invitation]: { type: "string", maxLength: 1000 },
      [EmailTemplateName.reminder]: { type: "string", maxLength: 1000 },
    },
  },
  bccDelay: { type: "number" },
  reminderDelay: { type: "number" },
  emailsForImportHook: {
    type: "array",
    items: {
      type: "string",
      maxLength: 128,
    },
  },
  widgetConfig: {
    type: "object",
    required: ["widgetType", "color", "width", "height"],
    properties: {
      widgetType: {
        type: "string",
        enum: Object.values(WidgetType) as WidgetType[],
      },
      color: { type: "string" },
      width: { type: "number" },
      height: { type: "number" },
      secondaryColor: { type: "string" },
      backgroundColor: { type: "string" },
      cardBackground: { type: "string" },
    },
  },
} as const;

export const responseProperties = {
  ...requestProperties,
  logo: { type: "string" },
  _id: { type: "string" },
  createdAt: { type: "string" },
  reviewToken: { type: "string" },
  reviewsStats: {
    type: "object",
    required: ["count", "rateAvg"],
    properties: {
      count: { type: "number" },
      rateAvg: { type: "number" },
    },
  },
  alert: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
    },
  },
  subscription: {
    type: "object",
    required: ["status", "periodStartAt", "periodEndAt"],
    properties: {
      status: {
        type: "string",
        enum: Object.values(SubscriptionStatus) as SubscriptionStatus[],
      },
      periodStartAt: { type: "string" },
      periodEndAt: { type: "string" },
      willBeCanceledAt: { type: "string" },
      stripeSubscriptionId: { type: "string" },
      inProgress: { type: "boolean" },
      trialingCardConfirmed: { type: "boolean" },
    },
  },
  isActiveSubscription: { type: "boolean" },
  isRealSubscription: { type: "boolean" },
  isTest: { type: "boolean" },
  isFingerprintDisable: { type: "boolean" },
} as const;

export const companyResponseSchema = {
  type: "object",
  required: ["_id", "name"],
  properties: responseProperties,
} as const;
