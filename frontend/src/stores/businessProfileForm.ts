import { defineStore } from "pinia";
import { Company } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { Form } from "@/helpers/form";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface Address {
  route: string;
  streetNumber?: string;
  town: string;
  administrativeDivision: string;
  postalCode: string;
  state?: string;
  countryCode?: string;
}

interface FieldsMap {
  businessName: string;
  categories: string[];
  route: string;
  streetNumber: string;
  town: string;
  administrativeDivision: string;
  postalCode: string;
  state?: string;
  about: string;
  image: string | undefined;
  website: string;
  phone: string;
  notificationEmail: string;
  alertEmail: string;
}

export const useBusinessProfileStore = defineStore({
  id: "profileForm",
  state: () => ({
    form: {
      businessName: "",
      categories: [],
      route: "",
      streetNumber: "",
      town: "",
      administrativeDivision: "",
      postalCode: "",
      state: "",
      about: "",
      image: undefined,
      website: "",
      phone: "",
      notificationEmail: "",
      alertEmail: "",
    } as FieldsMap,
    categories: [] as string[],
    imagePrevUrl: "",
    companyId: undefined as string | undefined,
    company: undefined as Company | undefined,
  }),
  actions: {
    async init(companyId: string | undefined) {
      this.companyId = companyId;
      return Promise.all([this.fetchCategories(), this.fetchFormData()]);
    },

    async fetchCategories() {
      const commonStore = useCommonStore();
      const service = this.companyService;
      commonStore.startLoading();
      try {
        this.categories = await service.getCategories();
      } catch (e) {
        if (e instanceof ServiceError) {
          const errText = getErrorText("GetCategories", "getCategories");
          commonStore.showNotification("error", errText);
          console.error(e);
        }
      } finally {
        commonStore.stopLoading();
      }
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

      this.form.businessName = company.name || "";
      this.form.categories = company.categories || [];
      this.form.route = company.address?.route || "";
      this.form.streetNumber = company.address?.streetNumber || "";
      this.form.town = company.address?.town || "";
      this.form.administrativeDivision =
        company.address?.administrativeDivision || "";
      this.form.postalCode = company.address?.postalCode || "";
      this.form.state = company.address?.state || "";
      this.form.about = company.about || "";
      this.imagePrevUrl = company.logo || "";
      this.form.website = company.webSite || "";
      this.form.phone = company.contactPhone || "";
      this.form.notificationEmail = company.emailForReviewNotifications || "";
      this.form.alertEmail = company.emailForNegativeReviewAlerts || "";
    },

    updateAddress(place: Address) {
      Object.keys(place).forEach((key) => {
        // @ts-ignore
        if (place[key]) {
          // @ts-ignore
          this.form[key] = place[key];
        }
      });
      if (place.countryCode === "NZ") {
        this.form.state = undefined;
      }
    },

    async fetchData(companyId: string) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      await this.fetchCompany(companyId);
      commonStore.stopLoading();
    },

    async fetchCompany(companyId: string) {
      const service = this.companyService;

      try {
        this.company = await service.getCompany(companyId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompany");
        }
      }
    },

    async submit(form: Form<FieldsMap>) {
      const commonStore = useCommonStore();
      if (!this.companyId) {
        throw new Error("Not company ID");
      }

      const service = this.companyService;

      const logo = this.form.image;
      const params = {
        name: this.form.businessName,
        categories: this.form.categories,
        address: {
          route: this.form.route,
          streetNumber: this.form.streetNumber,
          town: this.form.town,
          administrativeDivision: this.form.administrativeDivision,
          postalCode: this.form.postalCode,
          state: this.form.state,
        },
        about: this.form.about,
        webSite: this.form.website,
        contactPhone: this.form.phone.replace(/\s/g, ''),
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
