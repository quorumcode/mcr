import { defineStore } from "pinia";
import { useCommonStore } from "@/stores/common";
import { ServiceError } from "@/services/ServiceError";
import { Form } from "@/helpers/form";
import { Company, UserInfo } from "@/types/commonTypes";
import { showErrorNotification } from "@/helpers/errorHelper";
import { useUserStore } from "./user";

interface FieldsMap {
  newName: string;
  newEmail: string;
}

interface UpdatePasswordFieldsMap {
  password: string;
  oldPassword: string;
  newPassword: string;
}

export const useProfileFormStore = defineStore({
  id: "profileForm",
  state: () => ({
    form: {
      newName: "",
      newEmail: "",
    } as FieldsMap,

    changePasswordForm: {
      password: "",
      oldPassword: "",
      newPassword: "",
    } as UpdatePasswordFieldsMap,

    oldName: "",
    oldEmail: "",
    companyId: undefined as string | undefined,
    company: undefined as Company | undefined,
    userInfo: undefined as UserInfo | undefined,
    isManager: false,
  }),
  getters: {
    isFieldNameChanged(state) {
      return !(state.form.newName === state.oldName);
    },
    isFieldEmailChanged(state) {
      return !(state.form.newEmail === state.oldEmail);
    },
  },
  actions: {
    async fetchData(companyId: string) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        await this.fetchCompany(companyId);
        await this.fetchCompanyOwner(companyId);
      } catch (e) {
        console.error(e);
      } finally {
        commonStore.stopLoading();
      }
    },

    async fetchCompanyOwner(companyId: string) {
      try {
        if (!this.isManager) {
          const service = this.userService;
          this.userInfo = await service.getMyInfo();
        } else {
          const service = this.companyService;
          this.userInfo = await service.getCompanyOwner(companyId);
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getMyInfo");
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

    async init(companyId: string, route: any, isManager?: boolean) {
      this.companyId = companyId;
      this.isManager = !!isManager;
      await Promise.all([
        this.fetchFormData(),
        this.checkChangeCredsTokens(route),
      ]);
    },

    async updateInfo() {
      const userStore = useUserStore();
      await userStore.fetchUserInfo();
      if (userStore.info?.name) {
        this.oldName = userStore.info.name;
        this.form.newName = this.oldName;
      }
      if (userStore.info?.email) {
        this.oldEmail = userStore.info.email;
        this.form.newEmail = this.oldEmail;
      }
    },

    async fetchFormData() {
      const commonStore = useCommonStore();

      if (!this.companyId) {
        throw new Error("Not company ID");
      }


      let userInfoData;
      commonStore.startLoading();
      try {
        if (!this.isManager) {
          const service = this.userService;
          userInfoData = await service.getMyInfo();
        } else {
          const service = this.companyService;
          userInfoData = await service.getCompanyOwner(this.companyId);
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getMyInfo");
        }
      } finally {
        commonStore.stopLoading();
      }

      if (userInfoData) {
        this.oldName = userInfoData.name || "";
        this.oldEmail = userInfoData.email || "";
        this.form.newName = userInfoData.name || "";
        this.form.newEmail = userInfoData.email || "";
      }
    },

    async checkChangeCredsTokens(route: any) {
      if (route.query.jwtHeader) {
        setTimeout(async () => {
          await this.sendTokensChangeCreds(route.query);
        }, 100);
      }
    },

    async submit(form: Form<FieldsMap>) {
      const commonStore = useCommonStore();
      const service = this.userService;

      if (!this.companyId) {
        throw new Error("Not company ID");
      }

      const params = {} as FieldsMap;
      if (this.isFieldNameChanged) {
        params.newName = form.fields.newName.ref;
      }
      if (this.isFieldEmailChanged) {
        params.newEmail = form.fields.newEmail.ref;
      }

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        if (!this.isManager) {
          await service.updateEmailAndName(params);
          if (params.newEmail) {
            commonStore.showNotification(
              "success",
              "We've sent instructions to change the credentials to your email"
            );
          } else {
            commonStore.showNotification(
              "success",
              "All changes have been saved successfully"
            );
          }
          await this.updateInfo();
        } else {
          const body = {} as { name?: string; email?: string };
          if (params.newName) body.name = params.newName;
          if (params.newEmail) body.email = params.newEmail;
          await service.updateUser(this.userInfo?.id, body);
          commonStore.showNotification(
            "success",
            "All changes have been saved successfully"
          );
        }
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "updateEmailAndName");
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },

    async sendTokensChangeCreds(tokens: any) {
      const commonStore = useCommonStore();
      const service = this.userService;
      commonStore.startLoading();
      try {
        await service.putTokensChangeCreds(tokens);
        commonStore.showNotification(
          "success",
          "Your details have been updated"
        );
        await this.updateInfo();
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "putTokensChangeCreds");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    async changeAccountPassword(form: Form<UpdatePasswordFieldsMap>) {
      const commonStore = useCommonStore();
      if (!this.companyId) {
        throw new Error("Not company ID");
      }

      const service = this.userService;

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        let res;
        if (!this.isManager) {
          res = await service.changeAccountPassword({
            oldPassword: this.changePasswordForm.oldPassword,
            newPassword: this.changePasswordForm.newPassword,
          });
        } else {
          await service.updateUser(this.userInfo?.id, { password: this.changePasswordForm.newPassword });
          res = true;
        }

        this.changePasswordForm.oldPassword = "";
        this.changePasswordForm.newPassword = "";
        form.isErrorsVisible = false;

        commonStore.showNotification(
          "success",
          "Your password has been changed!"
        );
        return res;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "changeAccountPassword");
        }
      } finally {
        commonStore.stopLoading();
        form.setDisabled(false);
      }
    },
  },
});
