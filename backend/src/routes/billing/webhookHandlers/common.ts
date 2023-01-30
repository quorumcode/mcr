import { SubscriptionStatus } from "@/types/common";

export type SubscriptionStatusDto =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export const subscriptionStatusMap: Record<
  SubscriptionStatusDto,
  SubscriptionStatus
> = {
  incomplete: SubscriptionStatus.incomplete,
  incomplete_expired: SubscriptionStatus.incompleteExpired,
  trialing: SubscriptionStatus.trialing,
  active: SubscriptionStatus.active,
  past_due: SubscriptionStatus.pastDue,
  canceled: SubscriptionStatus.canceled,
  unpaid: SubscriptionStatus.unpaid,
} as const;
