import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    requiresGuest?: boolean;
    requiresAuth?: boolean;
    requiresSubscription?: boolean;
    iAmCompanyOwner?: boolean;
  }
}
