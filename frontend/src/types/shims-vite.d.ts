interface ImportMetaEnv {
  SSR: boolean;
  VITE_API_FRONTEND_BASE_URL: string;
  VITE_API_BACKEND_BASE_URL: string;
  VITE_GOOGLE_API_KEY: string;
  VITE_FRONTEND_EXTERNAL_BASE_URL: string;
  VITE_BCC_EMAIL: string;
  VITE_STRIPE_PUBLIC_KEY: string;
  VITE_LIVECHAT_LICENSE: string;
  VITE_BILLING_DAYS_AFTER_CANCELING_SUBSCRIPTION: string;
  VITE_BILLING_PRICE_UNIT_AMOUNT_DECIMAL: string;
  VITE_BILLING_RECURRING_INTERVAL: "day" | "month" | "week" | "year";
  VITE_BILLING_RECURRING_INTERVAL_COUNT: string;
}