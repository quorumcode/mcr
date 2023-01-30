import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { getRandomString } from "@/helpers/getRandomString";
import { Notification } from "@/commonTypes";
import { useUserStore } from "@/stores/user";
import { getMainNavigation } from "@/helpers/getMainNavigation";
import { useNotificationModalStore } from "@/containers/notificationModal/store";

export const useCommonStore = defineStore({
  id: "common",
  state: () => ({
    loadingCount: 0,
    notifications: [] as Notification[],
    isFirstLoadingFix: true,
  }),
  getters: {
    isLoading(): boolean {
      return this.loadingCount > 0;
    },
  },
  actions: {
    getMainNavigation(isShort = false) {
      const userStore = useUserStore();
      return getMainNavigation(
        !!userStore.info?.permissions.hasAdminControls,
        isShort
      );
    },
    startLoading() {
      this.loadingCount += 1;
    },
    stopLoading() {
      this.loadingCount -= 1;
      setTimeout(() => {
        this.isFirstLoadingFix = false;
      }, 0);
    },
    startFirstLoading() {
      this.isFirstLoadingFix = true;
    },
    stopFirstLoading() {
      this.isFirstLoadingFix = false;
    },
    showBanError(errorMsg?: string) {
      const message = errorMsg
        ? errorMsg
        : "Your account has been blocked. Please contact support to resolve the issue.";
      const notificationModalStore = useNotificationModalStore();
      notificationModalStore.openModal({
        type: "error",
        title: "Error",
        message,
      });
    },
    showNotification(
      type: "success" | "error" | "warning",
      message: string,
      timeout = 5000
    ) {
      const notificationId = getRandomString();
      this.notifications.push({
        id: notificationId,
        type,
        message,
      });
      setTimeout(() => {
        this.closeNotification(notificationId);
      }, timeout);
    },
    closeNotification(notificationId: string) {
      this.notifications = this.notifications.filter(
        ({ id }) => id !== notificationId
      );
    },
    handleError(error: ServiceError | Error) {
      // this.showNotification("error", "Ooops!");
    },
  },
});
