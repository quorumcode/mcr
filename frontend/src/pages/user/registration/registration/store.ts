import { defineStore } from "pinia";
import { useCommonStore } from "@/stores/common";
import { routesNames } from "@/routesNames";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";
import { Form } from "@/helpers/form";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FieldsMap {
  userName: string;
  email: string;
  password: string;
  passwordRepeat: string;
  isAgreementsConfirmed: boolean;
}

export const useRegistrationPageStore = defineStore({
  id: "registrationPage",
  state: () => ({
    form: {
      userName: "",
      email: "",
      password: "",
      passwordRepeat: "",
      isAgreementsConfirmed: false,
    } as FieldsMap,
  }),
  getters: {},
  actions: {
    async submit(form: Form<FieldsMap>) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const commonStore = useCommonStore();
      const service = this.userService;
      const router = this.router;

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        await service.register({
          userName: form.fields.userName.ref,
          email: form.fields.email.ref,
          password: form.fields.password.ref,
        });
        commonStore.showNotification(
          "success",
          "Confirmation email sent. Click on the link to finalise creating your account"
        );
        router.push({ name: routesNames.login });
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === UserErrors.UserAlreadyExists) {
            const errText = getErrorText(e.code, "register");
            form.fields.email.setServerErrors([errText]);
          } else {
            showErrorNotification(e.code, "register");
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
