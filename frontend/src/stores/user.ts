import { Ref } from 'vue';
import { RouteLocationNormalizedLoaded } from "vue-router";
import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { UserInfo, SubscriptionStatus } from "@/types/commonTypes";
import FingerprintJS from "@fingerprintjs/fingerprintjs-pro";

const COOKIE_TOKEN = "token";
const COOKIE_IS_ACTIVE_ADMIN_CONTROLS = "isActiveAdminControls";

export const useUserStore = defineStore({
  id: "user",
  state() {
    return {
      token: "" as string | undefined,
      info: undefined as UserInfo | undefined,
      isActiveAdminControls: true,
      userLocation: "" as string | undefined,
      userVisitorId: "" as string,
    };
  },
  getters: {
    isLogged(state) {
      return !!state.info?.id;
    },
    hasRealSubscription(state) {
      return !!state.info?.company?.isRealSubscription;
    },
    hasActiveSubscription(state) {
      return state.info?.company?.isActiveSubscription;
    },
    hasCompanyAdditionalInfo(state) {
      return !!state.info?.company?.contactPhone;
    },
    subscriptionStatus(state) {
      const subscription = state.info?.company?.subscription;

      if (typeof subscription === "undefined") {
        return "expired";
      }

      if (
        subscription?.status === SubscriptionStatus.trialing &&
        subscription?.trialingCardConfirmed
      ) {
        return "trialingCardConfirmed";
      } else if (subscription?.status === SubscriptionStatus.trialing) {
        return "trialing";
      } else if (subscription?.willBeCanceledAt) {
        return "activeWillBeCanceled";
      } else if (subscription?.status === SubscriptionStatus.active) {
        return "active";
      } else {
        return "expired";
      }
    },
    isSubscriptionProcessing(state) {
      return state.info?.company?.subscription?.inProgress;
    },
  },
  actions: {
    async init(route?: Ref<RouteLocationNormalizedLoaded>) {
      let token = "";
      const confirmationToken = route?.value?.query?.confirmationToken as string | undefined;
      if (confirmationToken) {
        try {
          const service = this.userService;
          token = await service.tokenLogin(confirmationToken);
        } catch {
          token = this.cookies.get(COOKIE_TOKEN);
        }
      } else {
        token = this.cookies.get(COOKIE_TOKEN);
      }
      this.setToken(token);

      // const isActiveAdminControls = this.cookies.get(
      //   COOKIE_IS_ACTIVE_ADMIN_CONTROLS
      // );
      // if (isActiveAdminControls === undefined) {
      //   this.setIsActiveAdminControls(true);
      // } else {
      //   this.setIsActiveAdminControls(!!isActiveAdminControls);
      // }

      if (!this.info) {
        await this.fetchUserInfo();
      }
    },

    setToken(token: string | undefined) {
      const client = this.client;

      client.setToken(token);
      this.token = token;
      if (token) {
        this.cookies.set(COOKIE_TOKEN, token, {
          path: "/",
        });
      } else {
        this.cookies.remove(COOKIE_TOKEN, {
          path: "/",
        });
      }
    },

    setIsActiveAdminControls(value: boolean) {
      this.isActiveAdminControls = value;
      if (value) {
        this.cookies.set(COOKIE_IS_ACTIVE_ADMIN_CONTROLS, value, {
          path: "/",
        });
      } else {
        this.cookies.remove(COOKIE_IS_ACTIVE_ADMIN_CONTROLS, {
          path: "/",
        });
      }
    },

    async fetchUserInfo() {
      const service = this.userService;
      try {
        this.info = await service.getMyInfo();
      } catch (e) {
        if (e instanceof ServiceError && e.status === 401) {
          return;
        }
        console.error(e);
      }
    },

    async checkSubscriptionProgress() {
      let loopCount = 20;
      const interval = setInterval(() => {
        this.loopFetchUserInfo().then((res) => {
          if (
            res.company?.subscription?.inProgress === false ||
            loopCount === 0
          ) {
            this.info.company.subscription = res.company.subscription;
            clearInterval(interval);
          }
          loopCount--;
        });
      }, 500);
    },

    async loopFetchUserInfo(): Promise<unknown> {
      const service = this.userService;
      try {
        return await service.getMyInfo();
      } catch (e) {
        if (e instanceof ServiceError && e.status === 401) {
          return;
        }
        console.error(e);
      }
    },

    logout() {
      this.setToken(undefined);
      this.info = undefined;
    },

    async getFingerprintData() {
      if (this.userVisitorId) {
        return;
      }

      const VITE_FINGERPRINT_PUBLIC_TOKEN = import.meta.env
        .VITE_FINGERPRINT_PUBLIC_TOKEN as string;
      const VITE_FINGERPRINT_SUBDOMAIN_URL = import.meta.env
        .VITE_FINGERPRINT_SUBDOMAIN_URL as string;

      if (
        VITE_FINGERPRINT_PUBLIC_TOKEN &&
        VITE_FINGERPRINT_PUBLIC_TOKEN !== "NULL"
      ) {
        let countryCode: string | undefined = "";
        const fpPromise = FingerprintJS.load({
          token: VITE_FINGERPRINT_PUBLIC_TOKEN,
          endpoint:
            VITE_FINGERPRINT_SUBDOMAIN_URL === "NULL"
              ? undefined
              : VITE_FINGERPRINT_SUBDOMAIN_URL,
        });
        await fpPromise.then(async (fp) => {
          const res = await fp.get({
            extendedResult: true,
          });
          countryCode = res?.ipLocation?.country?.code;
          this.userLocation = countryCode;
          this.userVisitorId = res?.visitorId;
        });
      } else {
        this.userLocation = undefined;
      }
    },
  },
});
