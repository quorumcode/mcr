import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { Form } from "@/helpers/form";
import { showErrorNotification } from "@/helpers/errorHelper";

interface FieldsMap {
  image: string | undefined;
  website: string;
  phone: string;
  notificationEmail: string;
  alertEmail: string;
}

export const useAdditionalInfoFormStore = defineStore({
  id: "additionalInfoForm",
  state: () => ({
    form: {
      image: undefined,
      website: "",
      phone: "",
      notificationEmail: "",
      alertEmail: "",
    } as FieldsMap,
    imagePrevUrl: "",
    companyId: undefined as string | undefined,
  }),
  actions: {
    async init(companyId: string) {
      this.companyId = companyId;
      return this.fetchFormData();
    },

    async fetchFormData() {
      const commonStore = useCommonStore();

      if (!this.companyId) {
        throw new Error("Not company ID");
      }

      const service = this.companyService;

      commonStore.startLoading();
      let company;
      try {
        company = await service.getCompany(this.companyId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompany");
        }
        return;
      } finally {
        commonStore.stopLoading();
      }

      this.form.website = company.webSite || "";
      this.form.phone = company.contactPhone || "";
      this.form.notificationEmail = company.emailForReviewNotifications || "";
      this.form.alertEmail = company.emailForNegativeReviewAlerts || "";
      this.imagePrevUrl = company.logo || "";
    },

    async submit(form: Form<FieldsMap>) {
      const commonStore = useCommonStore();

      if (!this.companyId) {
        throw new Error("Not company ID");
      }

      const service = this.companyService;

      const logo = this.form.image;
      const params = {
        webSite: this.form.website,
        contactPhone: this.form.phone,
        emailForReviewNotifications: this.form.notificationEmail,
        emailForNegativeReviewAlerts: this.form.alertEmail,
        logo,
      };

      // If the logo has not changed - do not send to the server
      if (logo === undefined) {
        delete params.logo;
      }

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        await service.patchCompany(this.companyId, params);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "patchCompany");
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
