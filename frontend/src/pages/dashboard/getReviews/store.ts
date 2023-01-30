import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useUserStore } from "@/stores/user";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useDashboardGetReviewsPageStore = defineStore({
  id: "dashboardGetReviewsPage",
  state: () => ({}),
  getters: {},
  actions: {
    async generateReviewToken() {
      const userStore = useUserStore();
      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        return;
      }
      const service = this.companyService;

      try {
        await service.generateReviewToken(companyId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "generateReviewToken");
        }
        return;
      }

      await this.fetchCompany();
    },
  },
});
