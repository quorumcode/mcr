import { EmailTemplateName } from "@/types/common";

export function getDefaultEmailTemplates(
  businessName: string
): Record<EmailTemplateName, string> {
  return {
    [EmailTemplateName.invitation]: `Thank you for choosing ${businessName}!\nWe love feedback and would appreciate you taking 2 minutes to write a review. Just click below to begin:`,
    [EmailTemplateName.reminder]: `Thanks again for choosing ${businessName}!\nWe know life is busy but we would really love to get feedback on your experience with us.\nJust click below to begin:`,
  };
}
