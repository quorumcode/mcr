import { defineStore } from "pinia";
import { useCommonStore } from "@/stores/common";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { useUserStore } from "@/stores/user";
import { routesNames } from "@/routesNames";
import { Form } from "@/helpers/form";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FieldsMap {
  email: string;
  password: string;
}

export const useLoginPageStore = defineStore({
  id: "loginPage",
  state: () => ({
    form: {
      email: "",
      password: "",
    } as FieldsMap,
  }),
  getters: {},
  actions: {
    async submit(form: Form<FieldsMap>, redirectUrl?: string) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();
      const userStore = useUserStore();
      const router = this.router;
      const service = this.userService;

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        const token = await service.login({
          email: form.fields.email.ref,
          password: form.fields.password.ref,
        });

        // Reset form
        form.setValues({
          email: "",
          password: "",
        });
        form.setErrorsVisible(false);

        userStore.setToken(token);
        await userStore.fetchUserInfo();
        commonStore.showNotification("success", "Login Successful");
        if (userStore.info?.company) {
          if (!userStore.hasCompanyAdditionalInfo) {
            router.push({ name: routesNames.registrationAdditionalInfo });
          } else if (redirectUrl) {
            router.push({ path: redirectUrl });
          } else {
            router.push({ name: routesNames.dashboardStats });
          }
        } else {
          router.push({ name: routesNames.registrationBusinessInfo });
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.InvalidPassword) {
            const errText = getErrorText(e.code, "login");
            form.fields.password.setServerErrors([errText]);
          } else if (
            e.code === UserErrors.UserNotFound ||
            e.code === UserErrors.EmailNotVerified
          ) {
            const errText = getErrorText(e.code, "login");
            form.fields.email.setServerErrors([errText]);
          } else if (e.code === UserErrors.UserUnhandledError) {
            showErrorNotification(e.code, "login");
          } else if (e.code === UserErrors.UserBanned) {
            const errText = getErrorText(e.code, "resetPassword");
            commonStore.showBanError(errText);
          }
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
