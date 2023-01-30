import { createPinia } from "pinia";
import devalue from "@nuxt/devalue";
//import Editor from "vue-editor-js";
import App from "./App.vue";
import { routes } from "./routes";
import { UserService } from "./services/UserService";
import { Client } from "./services/Client";
import {
  getAppConfig,
  injectionKey as appConfigInjectionKey,
} from "@/appConfig";
import viteSSR from "vite-ssr";
import { CompanyService } from "@/services/CompanyService";
import Cookies from "universal-cookie";
import { useUserStore } from "@/stores/user";
import { routesNames } from "@/routesNames";
import { useCommonStore } from "@/stores/common";
import { ClientService } from "@/services/ClientService";
import { ReviewService } from "@/services/ReviewService";
import { WidgetService } from "@/services/WidgetService";
import { CommonService } from "@/services/CommonService";
import { BillingService } from "@/services/BillingService";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { PageService } from "@/services/PageService";
import { usePagesStore } from "@/stores/pages";

const env = import.meta.env;

export default viteSSR(
  App,
  {
    routes,
    transformState(state) {
      return import.meta.env.SSR ? devalue(state) : state;
    },
  },
  async ({ app, router, request, initialState }) => {
    // Use spelling words "import.meta.env.SSR" together
    const appConfig = getAppConfig(env, import.meta.env.SSR);
    const cookies = new Cookies(request?.headers.cookie);
    const client = new Client(appConfig.api.baseUrl);
    const userService = new UserService(client);
    const companyService = new CompanyService(client);
    const clientService = new ClientService(client);
    const reviewService = new ReviewService(client);
    const widgetService = new WidgetService(client);
    const commonService = new CommonService(client);
    const billingService = new BillingService(client);
    const pageService = new PageService(client);
    let stripe: Stripe | null = null;
    if (!import.meta.env.SSR) {
      stripe = await loadStripe(appConfig.stripePublicKey);
    }

    app.provide(appConfigInjectionKey, appConfig);

    const pinia = createPinia();
    pinia.use(() => ({
      appConfig,
      client,
      cookies,
      userService,
      companyService,
      clientService,
      reviewService,
      widgetService,
      commonService,
      billingService,
      pageService,
      stripe,
      router,
    }));
    app.use(pinia);
    //app.use(Editor);

    if (import.meta.env.SSR) {
      // this will be stringified and set to window.__INITIAL_STATE__
      initialState.pinia = pinia.state.value;
      // console.log("Server Inital state", JSON.stringify(initialState));
    } else {
      // on the client side, we restore the state
      pinia.state.value = initialState.pinia;
      // console.log("Client Inital State", JSON.stringify(initialState));
    }

    const userStore = useUserStore(pinia);
    const commonStore = useCommonStore(pinia);
    const pagesStore = usePagesStore(pinia);

    router.beforeEach((to: any, from: any) => {
      if (to.path === '/' || to.path?.startsWith('/page')) {
        commonStore.startFirstLoading();
      }
      if (to.meta.requiresAuth && !userStore.info?.id && !to.query.confirmationToken) {
        return {
          name: routesNames.login,
          query: { redirect: to.fullPath },
        };
      }
      if (
        to.meta.requiresGuest &&
        userStore.info?.id &&
        from.name !== routesNames.login
      ) {
        commonStore.showNotification("warning", "Already authorized");
        return {
          name: routesNames.home,
        };
      }

      if (to.meta?.requiresSubscription && !userStore.hasActiveSubscription) {
        commonStore.showNotification(
          "warning",
          "Please purchase subscription to regain access to the platform"
        );
        return {
          name: routesNames.companyEditSubscription,
          params: { id: userStore.info?.company?._id },
        };
      }

      const iAmCompanyOwner = userStore?.info?.company?._id === to.params?.id;
      if (to.meta?.iAmCompanyOwner && !(iAmCompanyOwner || userStore?.info?.permissions?.canEditAllCompanies)) {
        return {
          name: routesNames.companyProfile,
          params: { id: to.params?.id },
        };
      }

      pagesStore.setIsHaveHistory(from.name);
    });

    await Promise.all([userStore.init(router?.currentRoute), pagesStore.init()]);
  }
);
