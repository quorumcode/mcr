import { defineStore } from "pinia";
import { Review } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { ReviewErrors } from "@/types/errors";
import { useUserStore } from "@/stores/user";
import { useCommonStore } from "@/stores/common";
import { useNotificationModalStore } from "@/containers/notificationModal/store";
import { Form } from "@/helpers/form";
import { showErrorNotification, getErrorText } from "@/helpers/errorHelper";

type HighlightInterval = [startChar: number, endChar: number];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const defaultReplyCallback = () => { };

export const useReviewModalStore = defineStore({
  id: "reviewModal",
  state: () => ({
    review: undefined as Review | undefined,
    replyMessage: "",
    replyCallback: defaultReplyCallback,
    replyMessageHighlightedIntervals: [] as HighlightInterval[],
    showReportModal: false,
    showSuccessReportModal: false,
    companyName: "",
  }),
  getters: {
    iAmCompanyOwner(state) {
      const userStore = useUserStore();
      if (!this.review) {
        return false;
      }
      return state.review?.company.id === userStore.info?.company?._id;
    },
    replyMessageChanged(state) {
      const savedMessage = state.review?.reply?.message || "";
      return savedMessage !== state.replyMessage;
    },
  },
  actions: {
    async getCompanyName(companyId: string) {
      const service = this.companyService;

      try {
        const company = await service.getCompany(companyId);
        this.companyName = company.name;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getCompany");
        }
      }
    },

    hideReplyMessageHighlight() {
      this.replyMessageHighlightedIntervals = [];
    },

    openReview(review: Review, replyCallback = defaultReplyCallback) {
      this.review = review;
      this.replyMessage = review.reply?.message || "";
      this.replyCallback = replyCallback;
    },

    closeReview() {
      this.review = undefined;
      this.replyMessage = "";
      this.replyCallback = defaultReplyCallback;
    },

    async reply(form: Form<{ replyMessage: string }>) {
      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      const commonStore = useCommonStore();

      if (!this.review) {
        throw new Error("No review");
      }

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        await this.reviewService.createReply({
          reviewId: this.review.id,
          message: this.replyMessage,
        });
        commonStore.showNotification(
          "success",
          "The reply was successfully submitted"
        );
        this.replyCallback();
        this.closeReview();
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === ReviewErrors.MessageIsProfane) {
            const errText = getErrorText(e.code, "createReply");
            form.fields.replyMessage.setServerErrors([errText]);
            this.replyMessageHighlightedIntervals = e.data.matches || [];
            return;
          } else {
            showErrorNotification(e.code, "createReply");
          }
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },

    openConfirmReportModal(reportReason: string) {
      const notificationModalStore = useNotificationModalStore();
      notificationModalStore.openModal({
        type: "warning",
        title: "Please Confirm",
        message: "Are you sure you want to report this review?",
        primaryButton: {
          title: "OK",
          onClick: () => {
            this.report(reportReason);
          },
        },
        secondaryButton: {
          title: "Cancel",
        },
      });
    },

    async report(reportReason: string) {
      const commonStore = useCommonStore();
      const userStore = useUserStore();
      const visitorId = userStore.userVisitorId;

      if (!this.review) {
        throw new Error("No review");
      }

      commonStore.startLoading();
      try {
        if (this.iAmCompanyOwner) {
          await this.reviewService.report(this.review.id, reportReason);
        } else {
          await this.reviewService.reportAnonymous(
            this.review.id,
            reportReason,
            visitorId
          );
        }
        this.replyCallback();
        this.closeReview();
        this.showSuccessReportModal = true;
      } catch (e) {
        if (e instanceof ServiceError) {
          if (this.iAmCompanyOwner) {
            showErrorNotification(e.code, "report");
          } else {
            showErrorNotification(e.code, "reportAnonymous");
          }
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    openReportModal() {
      this.showReportModal = true;
    },

    closeReportModal() {
      this.showReportModal = false;
    },

    closeSuccessReportModal() {
      this.showSuccessReportModal = false;
      const commonStore = useCommonStore();
      commonStore.showNotification(
        "success",
        "This review will remain visible until it has been reviewed by our staff"
      );
    },
  },
});
