import { Document } from "mongoose";
import { CompanyProps } from "@/models/Company";

export enum UserRole {
  guest = "guest",
  user = "user",
  manager = "manager",
  support = "support",
}

export interface UserPermissions {
  hasAdminControls: boolean;
  canEditAllCompanies: boolean;
  canBanUsers: boolean;
  canGetUsersInfo: boolean;
  canRemoveCompanies: boolean;
  canWorkWitchReports: boolean;
  canEditPages: boolean;
  canCancelSubscriptions: boolean;
  canConvertCompanyToTest: boolean;
}

export interface UserInfo {
  role: UserRole;
  permissions: UserPermissions;
  id?: string;
  name?: string;
  email?: string;
  company?: Partial<CompanyProps>;
}

export enum EmailTemplateName {
  invitation = "invitation",
  reminder = "reminder",
}

export enum VisitSource {
  site = "site",
  widget = "widget",
}

export enum WidgetType {
  rating = "rating",
  compact = "compact",
  ratingWithCarousel = "ratingWithCarousel",
  carousel = "carousel",
  lastReview = "lastReview",
  scrolling = "scrolling",
  invite = "invite",
  addReview = "addReview",
}

export enum SubscriptionStatus {
  incomplete = "incomplete",
  incompleteExpired = "incompleteExpired",
  trialing = "trialing",
  active = "active",
  pastDue = "pastDue",
  canceled = "canceled",
  unpaid = "unpaid",
}

export enum PageCategory {
  none = "",
  forConsumer = "forConsumer",
  forBusiness = "forBusiness",
  ourCompany = "ourCompany",
}

export enum PaymentStatus {
  requiresCapture = "requires_capture",
  requiresPaymentMethod = "requires_payment_method",
  requiresConfirmation = "requires_confirmation",
  requiresAction = "requires_action",
  processing = "processing",
  succeeded = "succeeded",
  canceled = "canceled",
}

export enum ReviewSource {
  byEmail = "byEmail",
  byBcc = "byBcc",
  ByQr = "byQr",
}

export type FoundDocument<D extends Document> =
  | (D & {
      id: string;
    })
  | null;
