import pick from "lodash/pick";
import set from "lodash/set";
import has from "lodash/has";
import { CompanyDoc, CompanyProps } from "@/models/Company";
import { getDefaultEmailTemplates } from "@/helpers/getDefaultEmailTemplates";
import { EmailTemplateName } from "@/types/common";

const publicFields: Array<keyof CompanyProps> = [
  "_id",
  "name",
  "categories",
  "address",
  "about",
  "logo",
  "alert",
  "webSite",
  "contactPhone",
  "bccDelay",
  "emailsForImportHook",
  "reminderDelay",
];

const privateFields: Array<keyof CompanyProps> = [
  "isRemoved",
  "user",
  "emailForNegativeReviewAlerts",
  "emailForReviewNotifications",
  "emailTemplates",
  "widgetConfig",
  "subscription",
  "subscriptionDeactivatedAt",
  "isActiveSubscription",
  "isRealSubscription",
  "isTest",
  "isFingerprintDisable",
];

export function normalizeCompanyForReply(
  company: CompanyDoc,
  isFullAccess: boolean
) {
  let result: Partial<CompanyProps> & { name: string } = pick(
    company,
    publicFields
  );
  if (isFullAccess) {
    result = {
      ...result,
      ...pick(company, privateFields),
    };
    normalizeEmailTemplates(result);
  }

  return result;
}

function normalizeEmailTemplates(
  company: Partial<CompanyProps> & { name: string }
) {
  const names = Object.keys(EmailTemplateName) as EmailTemplateName[];
  names.forEach((name) => {
    if (!has(company, ["emailTemplates", name])) {
      set(
        company,
        ["emailTemplates", name],
        getDefaultEmailTemplates(company.name)[name]
      );
    }
  });
}
