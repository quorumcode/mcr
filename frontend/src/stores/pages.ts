import { defineStore } from "pinia";
import { RouteLocation } from "vue-router";
import { routesNames } from "@/routesNames";
import { ServiceError } from "@/services/ServiceError";
import { Page } from "@/types/commonTypes";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";

export const usePagesStore = defineStore({
  id: "pages",
  state: () => ({
    pages: [] as Page[],
    isHaveHistory: "",
  }),
  actions: {
    async init() {
      return this.fetchPages();
    },

    async fetchPages() {
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        this.pages = await this.pageService.getPages();
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getPages");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    getPageRoute(pageName: string): RouteLocation & { href: string } {
      return this.router.resolve({
        name: routesNames.page,
        params: { name: pageName },
      });
    },

    setIsHaveHistory(routeName: string) {
      this.isHaveHistory = routeName;
    },
  },
});
