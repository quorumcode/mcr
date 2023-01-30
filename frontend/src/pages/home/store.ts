import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { Form } from "@/helpers/form";
import { showErrorNotification } from "@/helpers/errorHelper";

interface Company {
  id: string;
  name: string;
  logo?: string;
}

interface FormFields {
  email: string;
  body: string;
}

export const useHomePageStore = defineStore({
  id: "homePage",
  state: () => ({
    recentlyAddedCompanies: [] as Company[],
    form: {
      email: "" as string,
      body: "" as string,
    } as FormFields,
  }),
  getters: {},
  actions: {
    async fetchRecentlyAddedCompanies() {
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        const { data } = await this.companyService.getCompanies({
          fields: ["_id", "name", "logo"],
          sort: "-createdAt",
          limit: 10,
        });
        this.recentlyAddedCompanies = data.map(({ _id, name, logo }) => ({
          name,
          logo,
          id: _id,
        }));
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompanies");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
    async submitContactForm(form: Form<FormFields>) {
      const commonStore = useCommonStore();
      const service = this.userService;

      commonStore.startLoading();
      try {
        await service.sendContactForm({
          email: form.fields.email.ref,
          body: form.fields.body.ref,
        });
        commonStore.showNotification(
          "success",
          "Your message has been successfully sent"
        );
        form.setErrorsVisible(false);
        form.fields.email.ref = "";
        form.fields.body.ref = "";
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "sendContactForm");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
