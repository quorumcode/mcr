import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { Form } from "@/helpers/form";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
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
}

export const useBusinessInfoFormStore = defineStore({
  id: "businessInfoForm",
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
    } as FieldsMap,
    categories: [] as string[],
    companyId: undefined as string | undefined,
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
        return;
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

      this.form.businessName = company.name;
      this.form.categories = company.categories || [];
      this.form.route = company.address?.route || "";
      this.form.streetNumber = company.address?.streetNumber || "";
      this.form.town = company.address?.town || "";
      this.form.administrativeDivision =
        company.address?.administrativeDivision || "";
      this.form.postalCode = company.address?.postalCode || "";
      this.form.state = company.address?.state || "";
      this.form.about = company.about || "";
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

    async submit(form: Form<FieldsMap>) {
      const commonStore = useCommonStore();
      const userStore = useUserStore();
      const service = this.companyService;

      commonStore.startLoading();
      form.setDisabled(true);

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
      };

      try {
        if (this.companyId) {
          await service.patchCompany(this.companyId, params);
        } else {
          await service.createCompany(params);
          await userStore.fetchUserInfo(); // Fetch info about new company
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          if (this.companyId) {
            showErrorNotification(e.code, "patchCompany");
          } else {
            showErrorNotification(e.code, "createCompany");
          }
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
