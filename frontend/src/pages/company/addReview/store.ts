import { defineStore } from "pinia";
import { routesNames } from "@/routesNames";
import { useCommonStore } from "@/stores/common";
import { useUserStore } from "@/stores/user";
import { ServiceError } from "@/services/ServiceError";
import { ReviewErrors } from "@/types/errors";
import { Form } from "@/helpers/form";
import { useNotificationModalStore } from "@/containers/notificationModal/store";
import { ReviewTokenInfo } from "@/types/commonTypes";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

interface FieldsMap {
  name: string;
  email: string;
  rate: number;
  message: string;
}

type HighlightInterval = [startChar: number, endChar: number];

export const useCompanyAddReviewStore = defineStore({
  id: "companyAddReviewPage",
  state: () => ({
    token: "",
    tokenInfo: undefined as ReviewTokenInfo | undefined,
    form: {
      name: "",
      email: "",
      rate: 0,
      message: "",
    } as FieldsMap,
    isError: false,
    messageHighlightedIntervals: [] as HighlightInterval[],
  }),
  actions: {
    hideMessageHighlight() {
      this.messageHighlightedIntervals = [];
    },

    async init(route: any) {
      const userStore = useUserStore();
      const commonStore = useCommonStore();
      const notificationModal = useNotificationModalStore();
      this.token = route.params.token as string;

      try {
        const res = await this.reviewService.getTokenInfo(
          this.token,
          userStore.userVisitorId
        );
        this.tokenInfo = res.data;
        const errorCode = res.code;
        if (errorCode) {
          const errText = getErrorText(errorCode, "createReview");
          if (errText) {
            commonStore.showNotification("error", errText);
          } else {
            throw new ServiceError({ code: errorCode, message: "", data: undefined });
          }
        }
      } catch (e) {
        this.isError = true;
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

    async submit(form: Form<FieldsMap>, userVisitorId: string) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();
      const userStore = useUserStore();
      commonStore.startLoading();
      form.setDisabled(true);
      const reviewId = this.tokenInfo?.review?.id;

      try {
        if (reviewId) {
          await this.reviewService.updateReview({
            reviewId,
            reviewToken: this.token,
            rate: form.fields.rate.ref,
            message: form.fields.message.ref,
          });
        } else {
          await userStore.getFingerprintData();
          await this.reviewService.createReview({
            reviewToken: this.token,
            name: form.fields.name.ref || undefined,
            email: form.fields.email.ref || undefined,
            rate: form.fields.rate.ref,
            message: form.fields.message.ref,
            fingerprint: userVisitorId,
          });
        }
        commonStore.showNotification(
          "success",
          "The review was successfully submitted"
        );
        this.router.push({
          name: routesNames.companyProfile,
          params: { id: this.tokenInfo?.company.id || "" },
        });
      } catch (e) {
        if (e instanceof ServiceError) {
          if (reviewId) {
            if (e.code === ReviewErrors.MessageIsProfane) {
              const errText = getErrorText(e.code, "updateReview");
              form.fields.message.setServerErrors([errText]);
              this.messageHighlightedIntervals = e.data.matches || [];
            } else {
              showErrorNotification(e.code, "updateReview");
            }
          } else {
            if (e.code === ReviewErrors.MessageIsProfane) {
              const errText = getErrorText(e.code, "createReview");
              form.fields.message.setServerErrors([errText]);
              this.messageHighlightedIntervals = e.data.matches || [];
            } else {
              showErrorNotification(e.code, "createReview");
            }
          }
          return;
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },

    async submitWidget(
      form: Form<FieldsMap>,
      userVisitorId: string,
      token: string,
      reviewId?: string
    ) {
      form.setErrorsVisible(true);
      if (form.hasError || !token) {
        return;
      }
      const commonStore = useCommonStore();
      const userStore = useUserStore();
      commonStore.startLoading();
      form.setDisabled(true);

      try {
        if (reviewId) {
          await this.reviewService.updateReview({
            reviewId,
            reviewToken: token,
            rate: form.fields.rate.ref,
            message: form.fields.message.ref,
          });
        } else {
          await userStore.getFingerprintData();
          await this.reviewService.createReview({
            reviewToken: token,
            name: form.fields.name.ref || undefined,
            email: form.fields.email.ref || undefined,
            rate: form.fields.rate.ref,
            message: form.fields.message.ref,
            fingerprint: userVisitorId,
          });
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          if (reviewId) {
            if (e.code === ReviewErrors.MessageIsProfane) {
              const errText = getErrorText(e.code, "updateReview");
              form.fields.message.setServerErrors([errText]);
              this.messageHighlightedIntervals = e.data.matches || [];
            } else {
              showErrorNotification(e.code, "updateReview");
            }
          } else {
            if (e.code === ReviewErrors.MessageIsProfane) {
              const errText = getErrorText(e.code, "createReview");
              form.fields.message.setServerErrors([errText]);
              this.messageHighlightedIntervals = e.data.matches || [];
            } else {
              showErrorNotification(e.code, "createReview");
            }
          }
          return;
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
