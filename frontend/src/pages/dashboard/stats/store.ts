import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { normalizeReview } from "@/services/ReviewService";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { showErrorNotification } from "@/helpers/errorHelper";
import { getDashboardParams, getRangeParams } from "@/helpers/params";
import {
  SubscriptionStatus,
  PeriodValue,
  PeriodSettings,
} from "@/types/commonTypes";

export const useDashboardStats = defineStore({
  id: "dashboardStats",
  state: () => ({
    isLoading: false,
    companyId: undefined as string | undefined,
    companyName: undefined as string | undefined,
    periodVisits: {
      period: PeriodValue.year,
    } as PeriodSettings,
    periodReviews: {
      period: PeriodValue.year,
    } as PeriodSettings,
    dashboardData: () => ({}),
  }),
  getters: {
    subscriptionStatus() {
      const userStore = useUserStore();
      const company = userStore.info?.company;
      if (!company) {
        return;
      }

      if (!company?.subscription) {
        return "expired";
      } else if (
        company.subscription.status === SubscriptionStatus.trialing &&
        company.subscription.trialingCardConfirmed
      ) {
        return "trialingCardConfirmed";
      } else if (company.subscription.status === SubscriptionStatus.trialing) {
        return "trialing";
      } else if (company.subscription.willBeCanceledAt) {
        return "activeWillBeCanceled";
      } else if (company.subscription.status === SubscriptionStatus.active) {
        return "active";
      } else {
        return "expired";
      }
    },
    subscription() {
      const userStore = useUserStore();
      const subscription = userStore.info?.company?.subscription;
      if (subscription) {
        return subscription;
      }
    },
  },
  actions: {
    async fetch() {
      await Promise.all([this.fetchStats()]);
    },

    async fetchStats() {
      const userStore = useUserStore();
      const commonStore = useCommonStore();
      this.companyId = userStore.info?.company?._id;
      this.companyName = userStore.info?.company?.name;
      if (!this.companyId) {
        return;
      }

      const service = this.companyService;

      // commonStore.startLoading();
      this.isLoading = true;
      try {
        const result = await service.getDashboardStats(getDashboardParams(this.periodVisits, this.periodReviews));
        this.dashboardData = result.data;
        if (this.dashboardData.recentReviews) {
          this.dashboardData.recentReviews = this.dashboardData.recentReviews.map(
            (review) => normalizeReview(review)
          );
        }
        this.isLoading = true;
        return result;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getDashboardStats");
        }
      } finally {
        commonStore.stopLoading();
        // this.isLoading = true;
      }
    },

    async updatePeriod(name: string, startDate: Date, endDate: Date, period: PeriodValue) {
      const ps = { startDate, endDate, period };
      if (name === 'visits') {
        this.companyService.getVisitStats(getRangeParams(ps)).then((result) => {
          Object.assign(this.dashboardData.visitStats, result.data?.visitStats);
          this.periodVisits.startDate = startDate;
          this.periodVisits.endDate = endDate;
          this.periodVisits.period = period;
        })
      } else if (name === 'reviews') {
        this.companyService.getReviewSourceStats(getRangeParams(ps)).then((result) => {
          Object.assign(this.dashboardData.reviewSources, result.data?.reviewSources);
          //Weird but works only like this
          //this.dashboardData.reviewSources = result.data?.reviewSources;
          this.periodReviews.startDate = startDate;
          this.periodReviews.endDate = endDate;
          this.periodReviews.period = period;
        })

      }
    },
  },
});
