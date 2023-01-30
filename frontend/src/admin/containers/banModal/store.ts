import { defineStore } from "pinia";
import { Company, UserInfo } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useAdminBanModalStore = defineStore({
  id: "adminBanModal",
  state: () => ({
    company: undefined as Company | undefined,
    userInfo: undefined as UserInfo | undefined,
  }),
  actions: {
    async fetchData(companyId: string) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        await this.fetchCompany(companyId);
        const userId = this.company?.user as string;
        await this.fetchUserInfo(userId);
      } catch (e) {
        console.error(e);
      } finally {
        commonStore.stopLoading();
      }
    },

    async fetchUserInfo(userId: string) {
      const service = this.userService;

      try {
        this.userInfo = await service.getInfo(userId);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getInfo");
        }
      }
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

    async ban() {
      if (!this.userInfo?.id || !this.company?._id) {
        throw new Error("No user or company id");
      }

      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        await Promise.all([
          this.userService.ban(this.userInfo.id),
          this.companyService.removeCompany(this.company._id),
        ]);
        commonStore.showNotification(
          "success",
          "The user was banned, the company was deleted"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "removeCompany");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    async restore() {
      if (!this.userInfo?.id || !this.company?._id) {
        throw new Error("No user or company id");
      }

      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        await Promise.all([
          this.userService.unban(this.userInfo.id),
          this.companyService.restoreCompany(this.company._id),
        ]);
        commonStore.showNotification(
          "success",
          "The user and company was restored"
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "restoreCompany");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
