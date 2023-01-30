import { defineStore } from "pinia";
import { EmailTemplateName } from "@/types/commonTypes";
import { ServiceError } from "@/services/ServiceError";
import { useUserStore } from "@/stores/user";
import { useCommonStore } from "@/stores/common";
import { showErrorNotification } from "@/helpers/errorHelper";
import {
  getRequiredValidator,
  getWhitespaceValidator,
  combineValidators,
} from "@/helpers/validation";
import { CompanyErrors } from "@/types/errors";

type Templates = Record<EmailTemplateName, string>;

interface FormFields {
  reminderDelay: string;
}

export const useEmailTemplatesFormStore = defineStore({
  id: "emailTemplatesForm",
  state: () => ({
    isLoading: false,
    lastFetchedTemplates: {} as Templates,
    templates: {} as Templates,
    companyLogoUrl: "",
    htmlTemplate: "",
    matches: {} as any,
    form: {
      reminderDelay: "7",
    } as FormFields,
    lastReminderDelay: "7",
    reminderErrorText: "",
  }),
  getters: {
    isNoChanges(): boolean {
      return (
        this.form.reminderDelay === this.lastReminderDelay &&
        JSON.stringify(this.templates) ===
        JSON.stringify(this.lastFetchedTemplates)
      );
    },
  },
  actions: {
    fetchTemplates() {
      const userStore = useUserStore();
      const templates = userStore.info?.company?.emailTemplates;

      if (userStore.info?.company?.logo) {
        this.companyLogoUrl = userStore.info.company.logo;
      }

      if (
        !templates ||
        !templates[EmailTemplateName.invitation] ||
        !templates[EmailTemplateName.reminder]
      ) {
        throw new Error("No email templates");
      }
      // @ts-ignore checks have been made above
      this.templates = { ...templates };

      // @ts-ignore checks have been made above
      this.lastFetchedTemplates = { ...templates };

      if (userStore.info?.company?.reminderDelay) {
        this.form.reminderDelay =
          userStore.info?.company?.reminderDelay.toString();
        this.lastReminderDelay =
          userStore.info?.company?.reminderDelay.toString();
      }
    },

    async saveTemplates() {
      if (this.isNoChanges) {
        return;
      }

      let result = false;

      // Template validation
      const validator = combineValidators(
        getRequiredValidator("Template cannot be empty"),
        getWhitespaceValidator()
      );
      const error =
        validator
          .validate(this.templates[EmailTemplateName.invitation])
          ?.toString() ||
        validator
          .validate(this.templates[EmailTemplateName.reminder])
          ?.toString();
      if (error) {
        throw new Error(error);
      }

      const userStore = useUserStore();
      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        throw new Error("Not company ID");
      }

      const service = this.companyService;
      const params = {
        emailTemplates: this.templates,
        reminderDelay: this.form.reminderDelay,
      };

      this.isLoading = true;
      try {
        await service.patchCompany(companyId, params);
        await userStore.fetchUserInfo();
        this.fetchTemplates();
        result = true;
      } catch (e) {
        if (e instanceof ServiceError) {
          if (
            this.reminderErrorText &&
            (e.code === CompanyErrors.ReminderDelayLimitExceeded ||
              e.code === CompanyErrors.ReminderDelayLessThenMinimum)
          ) {
            const commonStore = useCommonStore();
            commonStore.showNotification("error", this.reminderErrorText);
          } else {
            showErrorNotification(e.code, "patchCompany");
          }
          if (e.code === CompanyErrors.BadInvitationText) {
            this.matches[EmailTemplateName.invitation] = e.data?.matches;
          } else if (e.code === CompanyErrors.BadReminderText) {
            this.matches[EmailTemplateName.reminder] = e.data?.matches;
          }
        }
      } finally {
        this.isLoading = false;
        return result;
      }
    },

    hideHighlight(name: EmailTemplateName) {
      this.matches[name] = undefined;
    },

    async fetchHtmlTemplates() {
      const userStore = useUserStore();
      const service = this.reviewService;

      const companyId = userStore.info?.company?._id;
      if (!companyId) {
        throw new Error("Not company ID");
      }

      this.isLoading = true;
      try {
        const res = await service.getHtmlTemplates(companyId);

        // remove footer
        const removeFooterString =
          '<div class="layout__footer footer" style="margin-top: 100px; color: #6f728d; border-top: 2px solid #e9eaf5;"><div class="footer__text center-block" style="margin: 24px 0; text-align: center;">This message was sent to you by “My Client Reviews”.</div><div class="center-block" style="text-align: center;"><img src="https://mcr-uploads.s3.ap-southeast-2.amazonaws.com/logo-gray.png"></div></div>';
        let html = res.data.html.replace(removeFooterString, "");

        // remove links
        const startHrefText = `href`;
        const endHrefText = `"`;
        let startHrefIndex, endHrefIndex;
        while (startHrefText) {
          startHrefIndex = html.indexOf(startHrefText);
          if (startHrefIndex === -1) break;
          endHrefIndex = html.indexOf(endHrefText, startHrefIndex + 6);
          const hrefText = html.slice(startHrefIndex, endHrefIndex + 2);
          html = html.replace(hrefText, "");
        }
        html = html.replaceAll("<a", "<div");
        html = html.replaceAll("</a", "</div");

        this.htmlTemplate = html;
      } catch (e) {
        if (e instanceof ServiceError) {
          showErrorNotification(e.code, "getHtmlTemplates");
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
