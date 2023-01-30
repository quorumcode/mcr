import { defineStore } from "pinia";
import { routesNames } from "@/routesNames";
import { WidgetData, WidgetType } from "@/types/commonTypes";
import { Review, ReviewTokenInfo } from "@/types/commonTypes";
import { Form } from "@/helpers/form";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { useNotificationModalStore } from "@/containers/notificationModal/store";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FormFields {
  email: string;
}

const queryMap: Record<
  WidgetType,
  {
    withReviewsStats: boolean;
    reviewsLimit: number;
    withReplys?: boolean;
    skip?: number;
  }
> = {
  [WidgetType.rating]: {
    withReviewsStats: true,
    reviewsLimit: 0,
  },
  [WidgetType.ratingWithCarousel]: {
    withReviewsStats: true,
    reviewsLimit: 6,
  },
  [WidgetType.carousel]: {
    withReviewsStats: false,
    reviewsLimit: 6,
  },
  [WidgetType.lastReview]: {
    withReviewsStats: false,
    reviewsLimit: 3,
  },
  [WidgetType.scrolling]: {
    withReviewsStats: true,
    reviewsLimit: 6,
    withReplys: true,
    skip: 0,
  },
  [WidgetType.compact]: {
    withReviewsStats: true,
    reviewsLimit: 0,
  },
};

export const useWidgetViewPageStore = defineStore({
  id: "widgetViewPage",
  state: () => ({
    data: undefined as WidgetData | undefined,
    tokenInfo: undefined as ReviewTokenInfo | undefined,
    reviews: [] as Review[],
    isMoreReviewsLoading: false,
  }),
  actions: {
    async fetchWidgetData(companyId: string, widgetType: WidgetType) {
      const commonStore = useCommonStore();
      try {
        const res = await this.widgetService.getWidgetData(
          companyId,
          queryMap[widgetType]
        );
        this.data = res;
        this.reviews = res.reviews as Review[];
      } catch (e) {
        const errText = getErrorText("GetWidgetData", "getWidgetData");
        commonStore.showNotification("error", errText);
      }
    },

    async fetchAddReviewWidgetData(reviewToken: string) {
      const notificationModal = useNotificationModalStore();

      try {
        this.tokenInfo = await this.reviewService.getTokenInfo(reviewToken);
      } catch (e) {
        let errorMessage = "Unrecognized error";
        if (e instanceof ServiceError) {
          errorMessage = getErrorText(e.code, "getTokenInfo");
        }

        notificationModal.openModal({
          type: "error",
          title: "Error",
          message: errorMessage,
          closeOnClickOutside: false,
          primaryButton: {
            title: "Go home",
            onClick: () => {
              this.router.push({ name: routesNames.home });
            },
          },
        });
      }
    },

    async fetchMoreReviews(companyId: string, widgetType: WidgetType) {
      const commonStore = useCommonStore();
      this.isMoreReviewsLoading = true;
      queryMap[widgetType].skip = this.reviews.length;

      try {
        const res = await this.widgetService.getWidgetData(
          companyId,
          queryMap[widgetType]
        );
        this.reviews.push(...res.reviews);
        this.data.reviews = this.reviews;
        this.isMoreReviewsLoading = false;
      } catch (e) {
        const errText = getErrorText("GetWidgetData", "getWidgetData");
        commonStore.showNotification("error", errText);
      }
    },

    async getCompanyName(companyId: string): Promise<string | undefined> {
      const service = this.companyService;

      try {
        const company = await service.getCompany(companyId);
        return company.name;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompany");
        }
      }
    },

    async sendInvite(companyId: string, form: Form<FormFields>) {
      form.setErrorsVisible(true);
      if (form.hasError || !companyId) {
        return;
      }

      const commonStore = useCommonStore();
      commonStore.startLoading();
      form.setDisabled(true);

      try {
        this.widgetService.sendInvite(companyId, form.fields.email.ref);
        commonStore.showNotification(
          "success",
          "We've sent instructions to your email"
        );
        form.fields.email.ref = "";
        form.setErrorsVisible(false);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "sendInvite");
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
