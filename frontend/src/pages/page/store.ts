import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { Page } from "@/types/commonTypes";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export const usePageStore = defineStore({
  id: "page",
  state: () => ({
    page: undefined as Page | undefined,
  }),
  getters: {},
  actions: {
    async fetchPage(name: string) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        this.page = await this.pageService.getPageByName(name);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getPageByName");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
