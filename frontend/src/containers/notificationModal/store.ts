import { defineStore } from "pinia";

type NotificationModalType = "success" | "warning" | "error";
interface ModalButton {
  title: string;
  onClick?: () => void;
}

interface ModalConfig {
  type: NotificationModalType;
  title: string;
  closeOnClickOutside?: boolean;
  message?: string;
  secondaryButton?: ModalButton;
  primaryButton?: ModalButton;
}

export const useNotificationModalStore = defineStore({
  id: "notificationModal",
  state: () => ({
    modalConfig: undefined as ModalConfig | undefined,
  }),
  getters: {
    isModalOpened(state) {
      return !!state.modalConfig;
    },
  },
  actions: {
    openModal(modalConfig: ModalConfig) {
      this.modalConfig = {
        closeOnClickOutside: true,
        ...modalConfig,
      };
    },

    closeModal() {
      this.modalConfig = undefined;
    },

    triggerPrimaryAction() {
      const callback = this.modalConfig?.primaryButton?.onClick;
      if (callback) callback();
      this.closeModal();
    },

    triggerSecondaryAction() {
      const callback = this.modalConfig?.secondaryButton?.onClick;
      if (callback) callback();
      this.closeModal();
    },
  },
});
