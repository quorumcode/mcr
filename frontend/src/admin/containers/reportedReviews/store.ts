import { defineStore } from "pinia";
import { Review } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useAdminReportedReviewsStore = defineStore({
  id: "adminReportedReviews",
  state: () => ({
    isLoading: false,
    reviewsTotal: 0,
    reviews: [] as Review[],
    review: undefined as Review | undefined,
    limit: 12,
    serverReviewCount: 0,
  }),
  actions: {
    async fetchReviews(isMore = false) {
      const commonStore = useCommonStore();

      const skip = isMore ? this.reviews.length : 0;

      if (isMore) {
        this.limit += 12;
      }

      commonStore.startLoading();
      this.isLoading = true;
      try {
        const result = await this.reviewService.getReportedReviews({
          skip,
          limit: 12,
        });

        if (isMore) {
          this.reviews = this.reviews.concat(result.data);
        } else {
          this.reviews = result.data;
        }

        this.reviewsTotal = result.meta.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReportedReviews");
        }
      } finally {
        commonStore.stopLoading();
        this.isLoading = false;
      }
    },

    async refreshReviewList() {
      try {
        const result = await this.reviewService.getReportedReviews({
          skip: 0,
          limit: this.limit,
        });
        this.reviews = result.data;
        this.serverReviewCount = result.meta.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReportedReviews");
        }
      }
    },

    async denyReport(reviewId: string) {
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        await this.reviewService.denyReport(reviewId);
        this.removeReviewFromList(reviewId);
        commonStore.showNotification(
          "success",
          "Report was successfully denied"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "denyReport");
        }
      } finally {
        commonStore.stopLoading();
        this.closeReview();
      }
    },

    async removeReview(reviewId: string) {
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        await this.reviewService.removeReview(reviewId);
        this.removeReviewFromList(reviewId);
        commonStore.showNotification(
          "success",
          "Review was successfully removed"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "removeReview");
        }
      } finally {
        commonStore.stopLoading();
        this.closeReview();
      }
    },

    removeReviewFromList(reviewId: string) {
      const reviewIndex = this.reviews.findIndex(({ id }) => id === reviewId);
      if (reviewIndex < 0) {
        return;
      }
      this.reviews.splice(reviewIndex, 1);
      this.reviewsTotal--;
    },

    openReviewModal(review: Review) {
      this.review = review;
    },

    closeReview() {
      this.review = undefined;
    }
  },
});
