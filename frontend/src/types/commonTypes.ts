import { RouteLocationRaw } from "vue-router";

export enum UserRole {
  user = "user",
  manager = "manager",
  support = "support",
}

export interface UserPermissions {
  hasAdminControls: boolean;
  canEditAllCompanies: boolean;
  canGetUsersInfo: boolean;
  canBanUsers: boolean;
  canRemoveCompanies: boolean;
  canWorkWitchReports: boolean;
  canEditPages: boolean;
  canCancelSubscriptions: boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  company?: Company;
  inProgress: boolean;
}

export interface Company {
  _id: string;
  name: string;
  categories?: string[];
  address?: {
    route: string;
    streetNumber: string;
    town: string;
    administrativeDivision: string;
    postalCode: string;
    state?: string;
  };
  about?: string;
  logo?: string;
  webSite?: string;
  contactPhone?: string;
  user?: string;
  isRemoved?: boolean;
  emailForReviewNotifications?: string;
  emailForNegativeReviewAlerts?: string;
  emailTemplates?: {
    [EmailTemplateName.invitation]?: string;
    [EmailTemplateName.reminder]?: string;
  };
  reviewTabs?: {
    [ReviewTemplateTabName.uploadCsvFile]?: string;
    [ReviewTemplateTabName.byQrCode]?: string;
    [ReviewTemplateTabName.byBcc]?: string;
    [ReviewTemplateTabName.byUrl]?: string;
  };
  reviewToken?: string;
  emailsForImportHook?: string[];
  reviewsStats?: {
    count: number;
    rateAvg: number;
  };
  widgetConfig?: WidgetConfig;
  subscription?: {
    status: SubscriptionStatus;
    periodStartAt: Date;
    periodEndAt: Date;
    stripeSubscriptionId?: string;
    willBeCanceledAt?: Date;
    inProgress?: boolean;
    trialingCardConfirmed?: boolean;
  };
  isActiveSubscription?: boolean;
  isRealSubscription?: boolean;
  bccDelay?: number;
  reminderDelay?: number;
  alert?: {
    title?: string;
    body?: string;
  }
  isTest?: boolean;
}

export interface VisitCompanyData {
  companyId: string;
  fromWidget: boolean;
  fingerprint: string;
}

export interface NavigationLink {
  title: string;
  route: RouteLocationRaw;
  icon?: InstanceType<any>;
  replace?: boolean;
}

export enum EmailTemplateName {
  invitation = "invitation",
  reminder = "reminder",
}

export enum ReviewTemplateTabName {
  uploadCsvFile = "uploadCsvFile",
  byQrCode = "byQrCode",
  byBcc = "byBcc",
  byUrl = "byUrl",
}

export interface Review {
  id: string;
  company: {
    id: string;
    user?: {
      email: string;
    };
  };
  client: {
    name: string;
  };
  createdAt: Date;
  rate: number;
  message: string;
  reply?: {
    createdAt: Date;
    message: string;
  };
  reportedAt?: Date;
}

export interface FullReviewStats {
  rateAvg: number;
  count: number;
  excellent: number;
  good: number;
  okay: number;
  poor: number;
  terrible: number;
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

export enum WidgetCardBackgroud {
  white = "white",
  black = "black",
  transparent = "transparent",
}

export enum CheckoutWidgetType {
  white = "invite",
  black = "addReview",
}

export interface WidgetData {
  companyId: string;
  reviewsStats?: {
    count: number;
    rateAvg: number;
  };
  reviews?: Array<{
    id: string;
    client: {
      name: string;
    };
    createdAt: Date;
    rate: number;
    message: string;
    reply?: {
      createdAt: Date;
      message: string;
    };
  }>;
}

export interface WidgetConfig {
  widgetType: WidgetType;
  color: string;
  secondaryColor?: string;
  backgroudColor: string;
  cardBackgroud?: WidgetCardBackgroud;
  width: number;
  height: number;
}

export interface ReviewTokenInfo {
  company: {
    id: string;
    name: string;
  };
  client?: {
    name: string;
  };
  review?: {
    id: string;
    message: string;
    rate: number;
  };
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

export interface Country {
  name: string;
  code: string;
}

export type CardType = "visa" | "amex" | "mastercard";

export interface Payment {
  id: string;
  createdAt: Date;
  amount: number;
  currency: string;
  status:
  | "requires_capture"
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "canceled";
  url: string;
}

export enum PageCategory {
  forConsumer = "forConsumer",
  forBusiness = "forBusiness",
  ourCompany = "ourCompany",
}

export interface PageBody {
  blocks: Array<{
    id: string;
    type: string;
    data: Record<string, any>;
  }>;
}

export interface Page {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  category?: PageCategory;
  body?: PageBody;
  withHeaderImage?: boolean;
}

export interface FullReviewStats {
  rateAvg: number;
  count: number;
  excelent: number;
  good: number;
  okay: number;
  poor: number;
  terrible: number;
}

export interface ReviewSourceStats {
  year: number;
  byBcc: number;
  byEmail: number;
  byQr: number;
}

export enum PeriodValue {
  week = "week",
  twoWeeks = "twoWeeks",
  month = "month",
  year = "year",
}

export enum PeriodText {
  week = "Last week",
  twoWeeks = "Last 2 weeks",
  month = "Last month",
  year = "Last year",
  custom = "Range...",
}

export interface PeriodSettings {
  startDate: Date;
  endDate: Date;
  period: PeriodValue;
}
