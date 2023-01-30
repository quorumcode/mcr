import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";
import { CompanyErrors } from "@/types/errors";
import { useUserStore } from "@/stores/user";

interface FormFields {
  bccDelay: string;
}

export const useBccDelayStore = defineStore({
  id: "bccDelay",
  state: () => ({
    companyId: undefined as string | undefined,
    form: {
      bccDelay: "0",
    } as FormFields,
    bccInvitationDelayMax: "180",
    bbcEmails: [] as string[] | undefined,
  }),
  actions: {
    init() {
      const userStore = useUserStore();
      this.companyId = userStore.info?.company?._id;
      if (userStore.info?.company?.bccDelay) {
        this.form.bccDelay = userStore.info.company.bccDelay.toString();
      }
      this.bccInvitationDelayMax = import.meta.env
        .VITE_BCC_INVITATION_DELAY_MAX as string;

      this.bbcEmails = userStore.info?.company?.emailsForImportHook;
    },

    async patchCompany() {
      const commonStore = useCommonStore();
      const service = this.companyService;
      if (typeof this.companyId === "undefined") {
        return;
      }

      commonStore.startLoading();
      try {
        await service.patchCompany(this.companyId, {
          bccDelay: +this.form.bccDelay,
        });
        commonStore.showNotification(
          "success",
          "Updated your BCC settings successfully."
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code === CompanyErrors.BccDelayLimitExceeded) {
            const bccInvitationDelayMax =
              import.meta.env.VITE_BCC_INVITATION_DELAY_MAX || 180;
            showErrorNotification(e.code, "patchCompany", {
              bccInvitationDelayMax,
            });
          } else {
            showErrorNotification(e.code, "patchCompany");
          }
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    async addEmailForBcc(bccEmail: string): Promise<boolean> {
      const service = this.companyService;
      const commonStore = useCommonStore();
      if (typeof this.companyId === "undefined") {
        return false;
      }

      commonStore.startLoading();
      try {
        await service.addEmailForBcc(this.companyId, bccEmail);
        this.bbcEmails?.push(bccEmail);
        commonStore.showNotification(
          "success",
          "Successfully saved a new email to the BCC list."
        );
        return true;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "addEmailForBcc");
        }
        return false;
      } finally {
        commonStore.stopLoading();
      }
    },

    async deleteEmailForBcc(idx: number, bccEmail: string) {
      const service = this.companyService;
      const commonStore = useCommonStore();
      if (typeof this.companyId === "undefined") {
        return;
      }

      commonStore.startLoading();
      try {
        await service.deleteEmailForBcc(this.companyId, bccEmail);
        this.bbcEmails?.splice(idx, 1);
        commonStore.showNotification(
          "success",
          "Succesfully removed an email from the BCC list."
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "deleteEmailForBcc");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
