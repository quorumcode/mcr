import { defineStore } from "pinia";
import { EmailTemplateName } from "@/types/commonTypes";
import { ReviewTemplateTabName } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useUserStore } from "@/stores/user";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

interface Client {
  id: string;
  name?: string;
  email: string;
  selected: boolean;
}

export const useInviteClientsStore = defineStore({
  id: "inviteClients",
  state: () => ({
    isClientsLoading: false,
    selectedTemplate: EmailTemplateName.invitation as EmailTemplateName,
    selectedTab: ReviewTemplateTabName.uploadCsvFile as ReviewTemplateTabName,
    isInviteModalOpened: false,
    isInviteEditTextModalOpened: false,
    clients: [] as Client[],
    totalClients: 0,
    batchId: "",
  }),
  getters: {
    isAllClientsSelected(state) {
      return state.clients.every(({ selected }) => selected);
    },
    selectedClientsIds(state) {
      return state.clients
        .filter(({ selected }) => selected)
        .map(({ id }) => id);
    },
    hasSelectedClients() {
      return !!this.selectedClientsIds.length;
    },
  },
  actions: {
    selectTemplate(value: EmailTemplateName) {
      this.selectedTemplate = value;
    },

    selectTab(value: ReviewTemplateTabName) {
      this.selectedTab = value;
    },

    openInviteModal() {
      this.isInviteModalOpened = true;
    },

    closeInviteModal() {
      this.isInviteModalOpened = false;
    },

    openInviteEditTextModal() {
      this.isInviteEditTextModalOpened = true;
    },

    closeInviteEditTextModal() {
      this.isInviteEditTextModalOpened = false;
    },

    handleSelectAllClients() {
      const selectedValue = !this.isAllClientsSelected;
      this.clients.forEach((client) => {
        client.selected = selectedValue;
      });
    },

    async fetchClients(isMore = false) {
      const userStore = useUserStore();
      const commonStore = useCommonStore();
      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        return;
      }

      const skip = isMore ? this.clients.length : 0;

      this.isClientsLoading = true;
      try {
        const { data, meta } = await this.clientService.getClientsForInvitation(
          {
            companyId,
            skip,
            limit: 1000,
            batchId: this.batchId,
          }
        );

        const metaData: any = meta;
        if (metaData.uploadSuccess === "partial") {
          commonStore.showNotification(
            "warning",
            `Some clients have been invited: ${metaData.alredyInvited} recipients has been recently invited already. \nEach client can only be invited once every 3 months.`,
            10000
          );
        } else if (metaData.uploadSuccess === "none") {
          commonStore.showNotification(
            "warning",
            `Couldn't invite clients. Each client can only be invited once every 3 months.`,
            8000
          );
        }

        const normalizedData = data.map((client) => ({
          ...client,
          selected: true,
        }));

        if (isMore) {
          this.clients = this.clients.concat(normalizedData);
        } else {
          this.clients = normalizedData;
        }
        this.totalClients = metaData.total;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getClientsForInvitation");
        }
      } finally {
        this.isClientsLoading = false;
      }
    },

    async uploadCsv(file: File) {
      const userStore = useUserStore();
      const service = this.clientService;

      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        throw new Error("No companyId");
      }

      this.isClientsLoading = true;
      try {
        this.batchId = await service.importCsv(file, companyId);
        await this.fetchClients();
      } catch (e) {
        if (e instanceof ServiceError) {
          const csvEmailsLimit = import.meta.env.VITE_CSV_EMAILS_LIMIT || 1000;
          showErrorNotification(e.code, "uploadCsv", { csvEmailsLimit });
        }
      } finally {
        this.isClientsLoading = false;
      }
    },

    async invite() {
      const service = this.clientService;
      const commonStore = useCommonStore();
      const userStore = useUserStore();

      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        throw new Error("No companyId");
      }

      if (!this.hasSelectedClients) {
        throw new Error("No selected clients");
      }

      commonStore.startLoading();
      try {
        await service.invite({
          companyId,
          clientsIds: this.selectedClientsIds,
          emailTemplate: EmailTemplateName.invitation,
        });
        this.clients = [];
        this.closeInviteModal();
        commonStore.showNotification(
          "success",
          "Review invitations have been sent"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "invite");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
