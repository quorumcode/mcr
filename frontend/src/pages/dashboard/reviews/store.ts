import { defineStore } from "pinia";
import { Review } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { useReviewModalStore } from "@/containers/reviewModal/store";
import { showErrorNotification } from "@/helpers/errorHelper";

export enum ReviewsSort {
  recent = "recent",
  rate = "rate",
  unreplied = "unreplied",
}

const sortMap = {
  [ReviewsSort.recent]: "-createdAt",
  [ReviewsSort.rate]: "-rate",
  [ReviewsSort.unreplied]: "reply",
};

export const useDashboardReviewsPageStore = defineStore({
  id: "dashboardReviewsPage",
  state: () => ({
    sort: "recent" as ReviewsSort,
    isLoading: false,
    isExportCsvLoading: false,
    reviewsTotal: 0,
    reviews: [] as Review[],
    companyName: "",
  }),
  getters: {},
  actions: {
    async changeSort(value: ReviewsSort) {
      this.sort = value;
      await this.fetchReviews();
    },

    async fetch() {
      await Promise.all([this.fetchReviews()]);
    },

    async fetchReviews(isMore = false) {
      const userStore = useUserStore();
      const commonStore = useCommonStore();
      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        return;
      }
      this.companyName = userStore.info?.company?.name;

      const skip = isMore ? this.reviews.length : 0;
      const sort = sortMap[this.sort];

      const service = this.reviewService;

      commonStore.startLoading();
      this.isLoading = true;
      try {
        const result = await service.getReviews(companyId, {
          sort,
          skip,
          limit: 9,
        });

        if (isMore) {
          this.reviews = this.reviews.concat(result.data);
        } else {
          this.reviews = result.data;
        }

        this.reviewsTotal = result.meta.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReviews");
        }
      } finally {
        commonStore.stopLoading();
        this.isLoading = false;
      }
    },

    openReviewModal(review: Review, replyCallback = () => {}) {
      const reviewModalStore = useReviewModalStore();
      reviewModalStore.openReview(review, () => {
        this.updateReview(review.id);
        replyCallback();
      });
    },

    async updateReview(reviewId: string) {
      const service = this.reviewService;
      const reviewIndex = this.reviews.findIndex(({ id }) => id === reviewId);
      if (reviewIndex < 0) {
        return;
      }

      let newReview: Review;
      try {
        newReview = await service.getReviewById(reviewId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReviewById");
        }
        return;
      }
      if (newReview.reportedAt) {
        this.reviews.splice(reviewIndex, 1);
        this.reviewsTotal--;
        return;
      }
      this.reviews[reviewIndex] = newReview;
    },

    async exportCsv() {
      const userStore = useUserStore();
      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        return;
      }

      const service = this.reviewService;

      this.isExportCsvLoading = true;
      try {
        await service.exportCsv(companyId, userStore.info?.company?.name || "");
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "exportCsv");
        }
      } finally {
        this.isExportCsvLoading = false;
      }
    },
  },
});
