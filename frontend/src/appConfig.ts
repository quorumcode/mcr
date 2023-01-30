import { inject, InjectionKey } from "vue";

export interface AppConfig {
  api: {
    baseUrl: string;
  };
  googleApiKey: string;
  frontendExternalBaseUrl: string;
  bccEmail: string;
  stripePublicKey: string;
  liveChatLicense: string;
  billing: {
    priceUnitAmountDecimal: number;
    recurringInterval: "day" | "month" | "week" | "year";
    recurringIntervalCount: number;
    daysAfterCancelingSubscription: number;
  };
}

export function getAppConfig(env: ImportMetaEnv, isServer: boolean): AppConfig {
  return {
    api: {
      baseUrl: isServer
        ? env.VITE_API_BACKEND_BASE_URL
        : env.VITE_API_FRONTEND_BASE_URL,
    },
    googleApiKey: env.VITE_GOOGLE_API_KEY,
    frontendExternalBaseUrl: env.VITE_FRONTEND_EXTERNAL_BASE_URL,
    bccEmail: env.VITE_BCC_EMAIL,
    stripePublicKey: env.VITE_STRIPE_PUBLIC_KEY,
    liveChatLicense: env.VITE_LIVECHAT_LICENSE,
    billing: {
      priceUnitAmountDecimal: parseInt(
        env.VITE_BILLING_PRICE_UNIT_AMOUNT_DECIMAL
      ),
      recurringInterval: env.VITE_BILLING_RECURRING_INTERVAL,
      recurringIntervalCount: parseInt(
        env.VITE_BILLING_RECURRING_INTERVAL_COUNT
      ),
      daysAfterCancelingSubscription: parseInt(
        env.VITE_BILLING_DAYS_AFTER_CANCELING_SUBSCRIPTION
      ),
    },
  };
}

export const injectionKey: InjectionKey<AppConfig> = Symbol();

export function useAppConfig(): AppConfig {
  return inject(injectionKey) as AppConfig;
}
