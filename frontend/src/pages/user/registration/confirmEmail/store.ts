import { defineStore } from "pinia";
import { routesNames } from "@/routesNames";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";
import { RouteLocationNormalizedLoaded } from "vue-router";

export const useRegistrationConfirmEmailPageStore = defineStore({
  id: "registrationConfirmEmailPage",
  state: () => ({}),
  getters: {},
  actions: {
    async confirmEmail(route: RouteLocationNormalizedLoaded) {
      const commonStore = useCommonStore();
      const userStore = useUserStore();
      const service = this.userService;
      const router = this.router;
      const code = route.params.code;
      const confirmationToken = route.query.confirmationToken as string;
      try {
        await service.confirmEmail(code as string);
        commonStore.showNotification(
          "success",
          "Your email has been confirmed!"
        );
        const token = await service.tokenLogin(confirmationToken);
        userStore.setToken(token);
        await userStore.fetchUserInfo();
        router.push({ name: routesNames.registrationBusinessInfo });
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserBanned) {
            const errText = getErrorText(e.code, "confirmEmail");
            commonStore.showBanError(errText);
          } else {
            showErrorNotification(e.code, "confirmEmail");
          }
          return;
        }
      }
    },
  },
});
