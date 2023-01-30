import { defineStore } from "pinia";
import {
  Company,
  Review,
  FullReviewStats,
  VisitCompanyData,
} from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { useReviewModalStore } from "@/containers/reviewModal/store";
import { getErrorText, showErrorNotification } from "@/helpers/errorHelper";
import { Form } from "@/helpers/form";
import { CompanyErrors } from "@/types/errors";

type HighlightInterval = [startChar: number, endChar: number];

export const useCompanyProfilePageStore = defineStore({
  id: "companyProfilePage",
  state: () => ({
    company: undefined as Company | undefined,
    isMyCompany: false,
    isLoading: false,
    reviewsTotal: 0,
    reviewStats: {} as FullReviewStats,
    reviews: [] as Review[],
    visitCompanyData: {} as VisitCompanyData,
    bodyMatches: [] as HighlightInterval[],
  }),
  getters: {},
  actions: {
    async fetch(companyId: string) {
      await Promise.all([
        this.fetchCompany(companyId),
        this.fetchReviews(companyId),
        this.fetchReviewStats(companyId),
      ]);
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

    async fetchReviews(companyId: string, isMore = false) {
      const commonStore = useCommonStore();
      const skip = isMore ? this.reviews.length : 0;
      const service = this.reviewService;

      commonStore.startLoading();
      this.isLoading = true;
      try {
        const result = await service.getReviews(companyId, {
          sort: "-createdAt",
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
          showErrorNotification(e.code, "getReviews");
        }
      } finally {
        commonStore.stopLoading();
        this.isLoading = false;
      }
    },

    async fetchReviewStats(companyId: string) {
      const commonStore = useCommonStore();
      const service = this.companyService;

      commonStore.startLoading();
      this.isLoading = true;
      try {
        this.reviewStats = await service.getReviewStats(companyId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReviewStats");
        }
      } finally {
        commonStore.stopLoading();
        this.isLoading = false;
      }
    },

    async companyVisit(
      companyId: string,
      fromWidget: boolean,
      userVisitorId: string
    ) {
      const service = this.companyService;

      this.visitCompanyData = {
        companyId,
        fromWidget,
        fingerprint: userVisitorId,
      };

      try {
        await service.companyVisit(this.visitCompanyData);
      } catch (e) {
        console.error(e);
      }
    },

    async openReviewById(companyId: string, reviewId: string) {
      const commonStore = useCommonStore();
      const service = this.reviewService;

      commonStore.startLoading();
      try {
        const review = await service.getReviewById(reviewId);
        if (review.company.id !== companyId) {
          throw new Error("The review does not belong to this company");
        }
        this.openReviewModal(review);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getReviewById");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    openReviewModal(review: Review) {
      const reviewModalStore = useReviewModalStore();
      reviewModalStore.openReview(review, () => {
        this.updateReview(review.id);
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

    async updateAlert(alert: any, form: Form<{ title: string, body: string }>) {
      if (this.company) {
        const service = this.companyService;
        //await service.patchCompany(this.company._id, { alert });
        await service.putCompanyAlert(this.company._id, alert)
          .then(() => {
            this.fetchCompany(this.company._id);
          })
          .catch((e) => {
            if (e instanceof ServiceError) {
              if (e.code === CompanyErrors.TitleIsProfane) {
                const errText = getErrorText(e.code, "putAlert");
                form.fields.title.setServerErrors([errText]);
              } else if (e.code === CompanyErrors.BodyIsProfane) {
                const errText = getErrorText(e.code, "putAlert");
                form.fields.body.setServerErrors([errText]);
                this.bodyMatches = e.data.matches || [];
              }
            }
            throw (e);
          });

      }
    },

    async deleteAlert() {
      if (this.company) {
        const service = this.companyService;
        await service.deleteCompanyAlert(this.company._id);
        this.fetchCompany(this.company._id);
      }
    },

    async convertToTest() {
      if (this.company) {
        const service = this.companyService;
        await service.convertToTest(this.company._id);
        this.fetchCompany(this.company._id);
      }
    },

    hideBodyHighlight() {
      this.bodyMatches = [];
    },
  },
});
