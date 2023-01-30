import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { showErrorNotification } from "@/helpers/errorHelper";

interface Option {
  id: string;
  title: string;
  image: string;
}

export const useSearchCompaniesFormStore = defineStore({
  id: "searchCompaniesForm",
  state: () => ({
    isLoading: false,
    options: [] as Option[],
    foundByQuery: "",
  }),
  actions: {
    async fetchOptions(query: string) {
      this.isLoading = true;

      try {
        const { data } = await this.companyService.getCompanies({
          search: query,
          fields: ["_id", "name", "logo"],
          limit: 10,
        });
        this.options = data.map(({ _id, name, logo }) => ({
          id: _id,
          title: name,
          image: logo || "",
        }));
        this.foundByQuery = query;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompanies");
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
