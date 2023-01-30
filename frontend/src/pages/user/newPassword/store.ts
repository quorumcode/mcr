import { defineStore } from "pinia";
import { Form } from "@/helpers/form";
import { useCommonStore } from "@/stores/common";
import { routesNames } from "@/routesNames";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FieldsMap {
  password: string;
  passwordRepeat: string;
}

export const useNewPasswordPageStore = defineStore({
  id: "newPasswordPage",
  state: () => ({
    form: {
      password: "",
      passwordRepeat: "",
    } as FieldsMap,
  }),
  getters: {},
  actions: {
    async submit(form: Form<FieldsMap>, code: string) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();
      const service = this.userService;
      const router = this.router;

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        await service.changePassword({
          code,
          password: form.fields.password.ref,
        });
        commonStore.showNotification(
          "success",
          "Your password has been changed!"
        );
        router.push({ name: routesNames.login });
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserBanned) {
            const errText = getErrorText(e.code, "changePassword");
            commonStore.showBanError(errText);
          } else {
            showErrorNotification(e.code, "changePassword");
          }
          return;
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
