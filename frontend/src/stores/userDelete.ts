// Костыль: метод deleteUser перенесен из stores/user.ts, потому что при разработке сайт зависает.
// Происходит это из за того, что в хелпере showErrorNotification вызывается useCommonStore.
// По не понятной причине перенос этого метода в этот файл решает проблему.

import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { showErrorNotification } from "@/helpers/errorHelper";

export const useUserDeleteStore = defineStore({
  id: "userDelete",
  actions: {
    async deleteUser(id: string) {
      const service = this.userService;
      try {
        return await service.deleteUser(id);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "deleteUser");
        }
      }
    },
  },
});
