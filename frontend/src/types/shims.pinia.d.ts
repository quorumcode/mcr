import "pinia";
import { UserService } from "@/services/UserService";
import { Client } from "@/services/Client";
import { CompanyService } from "@/services/CompanyService";
import Cookies from "universal-cookie";
import { Router } from "vue-router";
import { ClientService } from "@/services/ClientService";
import { ReviewService } from "@/services/ReviewService";
import { WidgetService } from "@/services/WidgetService";
import { AppConfig } from "@/appConfig";
import { CommonService } from "@/services/CommonService";
import { BillingService } from "@/services/BillingService";
import { Stripe } from "@stripe/stripe-js";
import { PageService } from "@/services/PageService";

declare module "pinia" {
  export interface PiniaCustomProperties {
    appConfig: AppConfig;
    client: Client;
    cookies: Cookies;
    userService: UserService;
    companyService: CompanyService;
    clientService: ClientService;
    reviewService: ReviewService;
    widgetService: WidgetService;
    commonService: CommonService;
    billingService: BillingService;
    pageService: PageService;
    stripe: Stripe | null;
    router: Router;
  }
}
