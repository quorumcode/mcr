import { defineStore } from "pinia";
import { Form } from "@/helpers/form";
import { useCommonStore } from "@/stores/common";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FieldsMap {
  email: string;
}

export const useForgotPasswordPageStore = defineStore({
  id: "forgotPasswordPage",
  state: () => ({
    form: {
      email: "",
    } as FieldsMap,
  }),
  getters: {},
  actions: {
    async submit(form: Form<FieldsMap>) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();
      const service = this.userService;

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        await service.resetPassword(form.fields.email.ref);
        commonStore.showNotification(
          "success",
          "Instructions have been sent to your email"
        );
        form.fields.email.ref = "";
        form.setErrorsVisible(false);
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserNotFound) {
            const errText = getErrorText(e.code, "resetPassword");
            form.fields.email.setServerErrors([errText]);
          } else if (e.code === UserErrors.UserUnhandledError) {
            showErrorNotification(e.code, "resetPassword");
          } else if (e.code === UserErrors.UserBanned) {
            const errText = getErrorText(e.code, "resetPassword");
            commonStore.showBanError(errText);
            return;
          }
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
