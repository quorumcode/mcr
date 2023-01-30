import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { routesNames } from "@/routesNames";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";
import {
  Review,
  WidgetConfig,
  WidgetData,
  WidgetType,
  WidgetCardBackgroud,
} from "@/types/commonTypes";

export enum ReviewsSort {
  recent = "recent",
  rate = "rate",
  unreplied = "unreplied",
}

export enum DefaultColor {
  white = "FFFFFF",
  black = "0F1441",
}

type Query = {
  widgetType: string;
  color: string;
  backgroudColor: string;
  secondaryColor?: string;
  cardBackgroud?: string;
};

const widgetConfigDefaults: WidgetConfig = {
  widgetType: WidgetType.compact,
  color: DefaultColor.black,
  secondaryColor: DefaultColor.black,
  backgroudColor: DefaultColor.white,
  cardBackgroud: WidgetCardBackgroud.white,
  width: 600,
  height: 317,
};

export const useWidgetEditorPageStore = defineStore({
  id: "widgetEditorPage",
  state: () => ({
    companyId: "",
    reviewToken: "",
    sort: "recent" as ReviewsSort,
    isLoading: false,
    widgetConfig: widgetConfigDefaults,
    data: undefined as WidgetData | undefined,
    reviews: [] as Review[],
    isMoreReviewsLoading: false,
  }),
  getters: {
    defaultBackgroundColor() {
      return DefaultColor.white;
    },

    defaultColor() {
      return DefaultColor.black;
    },

    backgroundColorPresets() {
      return ["transparent", "0F1441", "FFFFFF", "E43962", "C955FF", "5566FF"];
    },

    colorPresets() {
      return [
        this.defaultColor,
        "FFA755",
        "E43962",
        "C955FF",
        "5566FF",
        "30BE3E",
      ];
    },

    secondaryColorPresets() {
      return ["6F728D", "FFA755", "E43962", "C955FF", "5566FF", "30BE3E"];
    },

    code(state) {
      if (!state.companyId) {
        return "";
      }

      const query = {
        widgetType: state.widgetConfig.widgetType,
        color: state.widgetConfig.color,
        backgroudColor: state.widgetConfig.backgroudColor,
      } as Query;

      if (
        state.widgetConfig.widgetType === WidgetType.ratingWithCarousel ||
        state.widgetConfig.widgetType === WidgetType.carousel ||
        state.widgetConfig.widgetType === WidgetType.lastReview ||
        state.widgetConfig.widgetType === WidgetType.scrolling
      ) {
        query.cardBackgroud = state.widgetConfig.cardBackgroud;
      }

      if (
        state.widgetConfig.widgetType === WidgetType.rating ||
        state.widgetConfig.widgetType === WidgetType.ratingWithCarousel ||
        state.widgetConfig.widgetType === WidgetType.scrolling ||
        state.widgetConfig.widgetType === WidgetType.compact
      ) {
        query.secondaryColor = state.widgetConfig.secondaryColor;
      }

      let location;
      if (
        state.widgetConfig.widgetType === WidgetType.addReview ||
        state.widgetConfig.widgetType === WidgetType.invite
      ) {
        location = this.router.resolve({
          name: routesNames.widgetView,
          params: {
            companyId: state.companyId,
            reviewToken: state.reviewToken,
          },
          query,
        });
      } else {
        location = this.router.resolve({
          name: routesNames.widgetView,
          params: {
            companyId: state.companyId,
          },
          query,
        });
      }

      return `<!-- My Client Reviews widget --><iframe src="${this.appConfig.frontendExternalBaseUrl}${location.href}" scrolling="no" style="width: ${state.widgetConfig.width}px; height: ${state.widgetConfig.height}px; border: none; display: block;"></iframe>`;
    },
  },
  actions: {
    async init(
      companyId: string,
      widgetConfig: Partial<WidgetConfig> = {},
      reviewToken: any
    ) {
      this.companyId = companyId;
      this.reviewToken = reviewToken;
      Object.keys(widgetConfig).forEach((key) => {
        // @ts-ignore
        this.widgetConfig[key] = widgetConfig[key];
      });
      await this.fetchWidgetData();
    },

    async fetchWidgetData() {
      const commonStore = useCommonStore();
      const service = this.widgetService;

      commonStore.startLoading();
      try {
        const res = await service.getWidgetData(this.companyId, {
          withReviewsStats: true,
          reviewsLimit: 6,
          withReplys: true,
        });
        this.data = res;
        this.reviews = res.reviews as Review[];
      } catch (e) {
        const errText = getErrorText("GetWidgetData", "getWidgetData");
        commonStore.showNotification("error", errText);
      } finally {
        commonStore.stopLoading();
      }
    },

    async fetchMoreReviews() {
      const commonStore = useCommonStore();
      const service = this.widgetService;
      const skip = this.reviews.length;
      this.isMoreReviewsLoading = true;
      try {
        const res = await service.getWidgetData(this.companyId, {
          withReviewsStats: true,
          reviewsLimit: 6,
          withReplys: true,
          skip,
        });
        this.reviews.push(...res.reviews);
        this.data.reviews = this.reviews;
      } catch (e) {
        const errText = getErrorText("GetWidgetData", "getWidgetData");
        commonStore.showNotification("error", errText);
      } finally {
        this.isMoreReviewsLoading = false;
      }
    },

    async saveWidgetConfig() {
      const commonStore = useCommonStore();
      const service = this.companyService;

      commonStore.startLoading();
      try {
        await service.patchCompany(this.companyId, {
          widgetConfig: this.widgetConfig,
        });
        commonStore.showNotification(
          "success",
          "Widget config saved successfully"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "patchCompany");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    changeWidgetType(value: WidgetType) {
      this.widgetConfig.widgetType = value;
    },

    setWidgetHeight(height: number) {
      this.widgetConfig.height = height;
    },
  },
});
