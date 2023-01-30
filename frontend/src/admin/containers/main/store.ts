import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export enum Tab {
  main = "main",
  reportedReviews = "reportedReviews",
}

export const useAdminDashboardStore = defineStore({
  id: "adminDashboard",
  state: () => ({
    activeTab: Tab.main as Tab,
    reportedReviewsCount: 0,
  }),
  getters: {
    tabs(state) {
      return [
        {
          value: Tab.main,
          title: "Main",
        },
        {
          value: Tab.reportedReviews,
          title: "Reported reviews",
          counter: {
            value: state.reportedReviewsCount,
            type: state.reportedReviewsCount > 0 ? "danger" : "normal",
          },
        },
      ];
    },
  },
  actions: {
    changeTab(tab: Tab) {
      this.activeTab = tab;
    },

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
