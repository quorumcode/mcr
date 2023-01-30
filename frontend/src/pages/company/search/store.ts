import { defineStore } from "pinia";
import { useCommonStore } from "@/stores/common";
import { ServiceError } from "@/services/ServiceError";
import { showErrorNotification } from "@/helpers/errorHelper";

interface Company {
  id: string;
  name: string;
  reviewsStats?: {
    count: number;
    rateAvg: number;
  };
  logo?: string;
}

export const useCompanySearchPageStore = defineStore({
  id: "companySearchPage",
  state: () => ({
    isSearchLoading: false,
    foundByQuery: "",
    total: 0,
    foundCompanies: [] as Company[],
    recentlyAddedCompanies: [] as Company[],
  }),
  getters: {},
  actions: {
    async searchCompanies(query: string, isMore = false) {
      const commonStore = useCommonStore();
      const skip = isMore ? this.foundCompanies.length : 0;

      commonStore.startLoading();
      this.isSearchLoading = true;
      try {
        const {
          data,
          meta: { total },
        } = await this.companyService.getCompanies({
          search: query,
          fields: ["_id", "name", "logo", "reviewsStats"],
          skip,
          limit: 12,
        });

        const companies = data.map(({ _id, name, logo, reviewsStats }) => ({
          name,
          logo,
          reviewsStats,
          id: _id,
        }));

        if (isMore) {
          this.foundCompanies = this.foundCompanies.concat(companies);
        } else {
          this.foundCompanies = companies;
        }
        this.total = total;
        this.foundByQuery = query;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompanies");
        }
      } finally {
        commonStore.stopLoading();
        this.isSearchLoading = false;
      }
    },

    async fetchRecentlyAddedCompanies() {
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        const { data } = await this.companyService.getCompanies({
          fields: ["_id", "name", "logo", "reviewsStats"],
          sort: "-createdAt",
          limit: 4,
        });
        this.recentlyAddedCompanies = data.map(
          ({ _id, name, logo, reviewsStats }) => ({
            name,
            logo,
            reviewsStats,
            id: _id,
          })
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompanies");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    resetSearch() {
      this.foundByQuery = "";
      this.total = 0;
      this.foundCompanies = [];
    },
  },
});
