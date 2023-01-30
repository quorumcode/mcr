import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useAdminDashboardLayoutStore = defineStore({
  id: "adminDashboardLayout",
  state: () => ({
    reportedReviewsCount: 0,
  }),
  actions: {
    async init() {
      await this.fetchReportedReviewsCount();
    },

    async fetchReportedReviewsCount() {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        const result = await this.reviewService.getReportedReviews({
          limit: 1,
        });
        this.reportedReviewsCount = result.meta.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReportedReviews");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
