import { defineStore } from "pinia";
import { ServiceError } from "@/services/ServiceError";
import { Page, PageBody, PageCategory } from "@/types/commonTypes";
import { routesNames } from "@/routesNames";
import { Form } from "@/helpers/form";
import { useCommonStore } from "@/stores/common";
import { usePagesStore } from "@/stores/pages";
import { useNotificationModalStore } from "@/containers/notificationModal/store";
import { showErrorNotification } from "@/helpers/errorHelper";

interface FormFields {
  name: string;
  title: string;
  subtitle: string;
  category: PageCategory | "";
  body: PageBody | undefined;
  withHeaderImage: boolean;
}

export const useAdminPageEditStore = defineStore({
  id: "adminPageEdit",
  state: () => ({
    page: undefined as Page | undefined,
    form: {
      name: "",
      title: "",
      subtitle: "",
      category: "",
      body: undefined,
      withHeaderImage: false,
    } as FormFields,
  }),
  getters: {
    isEdit(state) {
      return !!state.page?.id;
    },
  },
  actions: {
    async init(id: string | undefined) {
      this.reset();
      if (id) {
        await this.fetchPage(id);
      }
    },

    async reset() {
      this.page = undefined;
      this.form.name = "";
      this.form.title = "";
      this.form.subtitle = "";
      this.form.category = "";
      this.form.body = undefined;
      this.form.withHeaderImage = false;
    },

    async fetchPage(id: string) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        const page = await this.pageService.getPageById(id);
        this.fillForm(page);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getPageById");
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    async fillForm(page: Page) {
      this.page = page;
      this.form.name = page.name || "";
      this.form.title = page.title || "";
      this.form.subtitle = page.subtitle || "";
      this.form.category = page.category || "";
      this.form.body = page.body;
      this.form.withHeaderImage = page.withHeaderImage || false;
    },

    async submit(id: string | undefined, form: Form<FormFields>) {
      const commonStore = useCommonStore();
      const pagesStore = usePagesStore();

      form.setErrorsVisible(true);
      if (form.hasError) {
        return;
      }

      commonStore.startLoading();
      form.setDisabled(true);
      try {
        const bodyData = form.fields.body.ref;
        const params = {
          name: form.fields.name.ref,
          title: form.fields.title.ref,
          subtitle: form.fields.subtitle.ref,
          category: form.fields.category.ref,
          body: bodyData ? JSON.stringify(bodyData) : "",
          withHeaderImage: form.fields.withHeaderImage.ref,
        };
        if (id) {
          await this.pageService.updatePage(id, params);
        } else {
          const page = await this.pageService.createPage(params);
          this.fillForm(page);
        }
        await pagesStore.fetchPages();
        commonStore.showNotification("success", "Successfully saved");
      } catch (e) {
        if (e instanceof ServiceError) {
          if (id) {
            showErrorNotification(e.code, "updatePage");
          } else {
            showErrorNotification(e.code, "createPage");
          }
          return;
        }
      } finally {
        form.setDisabled(false);
        commonStore.stopLoading();
      }
    },

    openRemovePageModal(id: string) {
      const notificationModalStore = useNotificationModalStore();
      notificationModalStore.openModal({
        type: "warning",
        title: "Please Confirm",
        message: "Are you sure you want to delete this page?",
        primaryButton: {
          title: "Delete",
          onClick: () => {
            this.removePage(id);
          },
        },
        secondaryButton: {
          title: "Cancel",
        },
      });
    },

    async removePage(id: string) {
      const pagesStore = usePagesStore();
      const commonStore = useCommonStore();

      commonStore.startLoading();
      try {
        await this.pageService.removePage(id);
        await pagesStore.fetchPages();
        this.router.push({ name: routesNames.adminDashboardPagesList });
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "removePage");
          return;
        }
      } finally {
        commonStore.stopLoading();
      }
    },

    async uploadImage(image: unknown) {
      const commonStore = useCommonStore();
      commonStore.startLoading();
      try {
        return await this.pageService.uploadImage(image);
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "uploadImage");
        }
      } finally {
        commonStore.stopLoading();
      }
    },
  },
});
