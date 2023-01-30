/* eslint-disable prettier/prettier */
import { ClientErrors, CompanyErrors, PageErrors, ReviewErrors, UserErrors, BillingErrors, WidgetErrors } from "@/types/errors";

export enum FrontendErrors {
  GetCountries = "GetCountries",
  GetWidgetData = "GetWidgetData",
  GetCategories = "GetCategories",
}

export const errorTexts = {
  // ClientService
  getClientsForInvitation: {
    [ClientErrors.ClientUnhandledError]: "We are unable to retrieve the client list. Please try again.",
    [ClientErrors.CompanyNotFound]: "We were unable to retrieve your company details. Please contact support.",
    [ClientErrors.CompanyRemoved]: "This company has been removed from this platform. Please contact support.",
    [ClientErrors.SubscriptionExpired]: "You need to upgrade your subscription to invite clients.",
    [ClientErrors.Forbidden]: "You are not allowed to perform this action.",
  },
  uploadCsv: {
    [ClientErrors.ClientDuplicated]: "Duplicate email found. Each email address in the CSV needs to be unique.",
    [ClientErrors.CsvInvalid]: "Make sure that your CSV follows the guidelines.",
    [ClientErrors.ImportLimitExceeded]: "Your list contains more than ${csvEmailsLimit} emails. Please, upload a smaller file.",
    [ClientErrors.ClientUnhandledError]: "We are unable to import the client list. Please try again.",
  },
  invite: {
    [ClientErrors.CompanyNotFound]: "We are unable to retrieve your company details. The invitations have not been sent.",
    [ClientErrors.Forbidden]: "You are not allowed to perform this action.",
    [ClientErrors.InvitationsNotSent]: "We were unable to send your invitations. Please contact support.",
  },
  // CompanyService
  getCompany: {
    [CompanyErrors.CompanyUnhandledError]: "We were unable to retrieve company details.",
    [CompanyErrors.CompanyNotFound]: "We were unable to find the company.",
  },
  getCompanies: {
    [CompanyErrors.CompanyUnhandledError]: "We were unable to retrieve the company details.",
  },
  createCompany: {
    [CompanyErrors.UserAlreadyHasCompany]: "Your company has already been registered. Try logging in.",
    [CompanyErrors.LogoUploadError]: "We were unable to upload the logo. Please try again.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to create your company. Please contact support.",
  },
  patchCompany: {
    [CompanyErrors.CompanyUnhandledError]: "We were unable to update the company details. Please try again.",
    [CompanyErrors.CompanyNotFound]: "We were unable to retrieve the company details. Please contact support.",
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
    [CompanyErrors.LogoUploadError]: "We were unable to upload the logo. Please try again.",
    [CompanyErrors.BadInvitationText]: "Your input contains prohibited words.",
    [CompanyErrors.UrlInInvitationText]: "Please remove any website links.",
    [CompanyErrors.BadReminderText]: "Your content contains prohibited words.",
    [CompanyErrors.UrlInReminderText]: "Please remove any website links.",
    [CompanyErrors.BccDelayLimitExceeded]: "Please set the delay below ${bccInvitationDelayMax}.",
    [CompanyErrors.ReminderDelayLimitExceeded]: "Please make sure the delay is set between ${invitationReminderDelayMin} and ${invitationReminderDelayMax}", // validation
  },
  removeCompany: {
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to delete this account. Please contact support.",
    [CompanyErrors.CompanyNotFound]: "We were unable to delete this account. Please contact support.",
  },
  restoreCompany: {
    [CompanyErrors.CompanyUnhandledError]: "User or company not restored. Please contact support.",
    [CompanyErrors.CompanyNotFound]: "User or company not restored. Please contact support.",
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
  },
  generateReviewToken: {
    [CompanyErrors.CompanyUnhandledError]: "Issue in generating review tokens. Please contact support.",
    [CompanyErrors.CompanyNotFound]: "Issue in generating review tokens. Please contact support.",
    [CompanyErrors.Forbidden]: "Issue in generating review tokens. Please contact support.",
  },
  getDashboardStats: {
    [CompanyErrors.CompanyNotFound]: "We were unable to retrieve the company details. Please contact support.",
    [CompanyErrors.Forbidden]: "You are not allowed to view this page.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to retrieve the dashboard data.",
  },
  getReviewStats: {
    [CompanyErrors.CompanyNotFound]: "We were unable to retrieve the company details.",
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to retrieve the review stats. Please contact support.",
  },
  addEmailForBcc: {
    [CompanyErrors.BccEmailInUse]: "This email is already associated with an existing account. Check your spelling or try adding a different one.",
    [CompanyErrors.CompanyNotFound]: "We were unable to process your request. Refresh the page and try again.",
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to process your request. Please contact support.",
  },
  deleteEmailForBcc: {
    [CompanyErrors.CompanyNotFound]: "We were unable to process your request. Refresh the page and try again.",
    [CompanyErrors.Forbidden]: "You are not allowed to perform this action.",
    [CompanyErrors.CompanyUnhandledError]: "We were unable to process your request. Please contact support.",
  },
  companyVisit: {
    [CompanyErrors.CompanyUnhandledError]: "", // don't need to show
    [CompanyErrors.FingerprintRequired]: "", // don't need to show
    [CompanyErrors.CompanyVisitRestricted]: "", // don't need to show
  },
  getCategories: {
    [FrontendErrors.GetCategories]: "We were unable to fetch the list of companies.",
  },
  putAlert: {
    [CompanyErrors.TitleIsProfane]: "Title is in breach of the Terms of Service (section 2).",
    [CompanyErrors.BodyIsProfane]: "Highlighted word(s) breach the Terms of Service (section 2).",
  },
  // PageService
  getPages: {
    [PageErrors.PageUnhandledError]: "We were unable to retrieve the page.",
  },
  getPageById: {
    [PageErrors.PageUnhandledError]: "We were unable to retrieve the page.",
    [PageErrors.PageNotFound]: "We were unable to find the page you requested.",
  },
  getPageByName: {
    [PageErrors.PageUnhandledError]: "We were unable to retrieve the page.",
    [PageErrors.PageNotFound]: "We were unable to find the page you requested.",
  },
  createPage: {
    [PageErrors.PageWitchNameAlreadyExists]: "A page with the same name already exists.",
    [PageErrors.Forbidden]: "You are not allowed to perform this action.",
    [PageErrors.PageUnhandledError]: "We were unable to update the page. Please try again.",
  },
  updatePage: {
    [PageErrors.Forbidden]: "You are not allowed to perform this action.",
    [PageErrors.PageNotFound]: "Couldn’t find the page you’re trying to update.",
    [PageErrors.PageWitchNameAlreadyExists]: "A page with the same name already exists.",
    [PageErrors.PageUnhandledError]: "Couldn’t process your request. Contact support.",
  },
  removePage: {
    [PageErrors.PageUnhandledError]: "Couldn’t delete the page.",
    [PageErrors.PageNotFound]: "Couldn’t find the page you’re trying to delete.",
    [PageErrors.Forbidden]: "You are not allowed to perform this action.",
  },
  uploadImage: {
    [PageErrors.PageUnhandledError]: "Couldn’t upload the image. Try again.",
    [PageErrors.Forbidden]: "You are not allowed to perform this action.",
  },
  // ReviewService
  getReviews: {
    [ReviewErrors.ReviewUnhandledError]: "We were unable to retrieve the review.",
    [ReviewErrors.CompanyNotFound]: "We were not able to find the company you’re posting the review for."
  },
  getReviewById: {
    [ReviewErrors.ReviewNotFound]: "We were unable to find the review.",
  },
  createReview: {
    [ReviewErrors.InvalidToken]: "We were unable to validate your review. Please contact support.",
    [ReviewErrors.CompanyNotFound]: "We were not able to find the company you’re posting the review for.",
    [ReviewErrors.ClientFieldsRequired]: "Please enter valid inputs in the required fields.",
    [ReviewErrors.ErrorLastReviewTimeLimit]: "You have already left a review for this company in the last three months",
    [ReviewErrors.DoublicateReviewMessage]: "Your review has already been submitted.",
    [ReviewErrors.MessageIsProfane]: "Highlighted word(s) breach the Terms of Service (section 2).", // validation
  },
  updateReview: {
    [ReviewErrors.InvalidToken]: "We were unable to validate your review. Please contact support.",
    [ReviewErrors.ReviewNotFound]: "We were unable to validate your review. Please refresh the page and try again.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to update your review. Please contact support.",
    [ReviewErrors.MessageIsProfane]: "Highlighted word(s) breach the Terms of Service (section 2).", // validation
  },
  removeReview: {
    [ReviewErrors.ReviewNotFound]: "We were unable to update this review’s status. Please refresh the page and try again",
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to update this review’s status.",
  },
  getTokenInfo: { // in popup
    [ReviewErrors.InvalidToken]: "The token is invalid. Please contact support.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to validate your review invitation. Please contact support.",
    [ReviewErrors.CompanyNotFound]: "We were unable to retrieve the company details.",
    [ReviewErrors.CompanyRemoved]: "The company has been removed from this platform.",
    [ReviewErrors.CompanySubscriptionExpired]: "The company’s subscription has expired.",
    [ReviewErrors.ReviewEditTimeExpired]: "This review cannot be edited any longer.",
  },
  createReply: {
    [ReviewErrors.ReviewNotFound]: "We were unable to post a response. Please refresh the page and try again.",
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.MessageIsProfane]: "Highlighted word(s) breach the Terms of Service (section 2).", // validation
  },
  getReportedReviews: {
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to retrieve the list of reported reviews.",
  },
  report: {
    [ReviewErrors.ReviewNotFound]: "We were unable to report this review. Please refresh the page and try again.",
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to report this review. Please contact support.",
  },
  reportAnonymous: {
    [ReviewErrors.ReviewNotFound]: "We were unable to report this review. Refresh the page and try again.",
    [ReviewErrors.ReportSubmissionLimit]: "You can only report one review per week.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to report this review. Please contact support.",
  },
  denyReport: {
    [ReviewErrors.ReviewNotFound]: "We were unable to update this review’s status. Please refresh the page and try again.",
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to update this review’s status.",
  },
  exportCsv: {
    [ReviewErrors.CompanyNotFound]: "We were unable to retrieve the company details. Please refresh the page and try again.",
    [ReviewErrors.Forbidden]: "You are not allowed to perform this action.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to export the reviews. Please contact support.",
  },
  getHtmlTemplates: {
    [ReviewErrors.CompanyNotFound]: "We were unable to retrieve the email preview. Please contact support.",
    [ReviewErrors.ReviewUnhandledError]: "We were unable to retrieve the email preview. Please contact support.",
  },
  // UserService
  register: {
    [UserErrors.UserAlreadyExists]: "This user already exists. Please contact support.", // validation
    [UserErrors.UserUnhandledError]: "We were unable to create the user. Please contact support.",
  },
  confirmEmail: {
    [UserErrors.InvalidEmailVerifyCode]: "The verification code was incorrect or the email has already been confirmed.",
    [UserErrors.UserUnhandledError]: "We were unable to verify the email. Please contact support.",
    [UserErrors.UserBanned]: "Your account has been blocked. Contact support to resolve the issue.", // modal
  },
  login: {
    [UserErrors.InvalidPassword]: "The password you entered was Invalid.", // validation
    [UserErrors.UserNotFound]: "The user details were not found.", // validation
    [UserErrors.EmailNotVerified]: "The email has not been verified", // validation
    [UserErrors.UserUnhandledError]: "We were unable to log you in. Please contact support.",
    [UserErrors.UserBanned]: "Your account has been blocked. Please contact support to resolve the issue.", // modal
  },
  resetPassword: {
    [UserErrors.UserNotFound]: "The user details were not found.", // validation
    [UserErrors.UserUnhandledError]: "We were unable to reset your password. Please contact support.",
    [UserErrors.UserBanned]: "Your account has been blocked. Please contact support to resolve the issue.", // modal
  },
  changePassword: {
    [UserErrors.InvalidChangePasswordCode]: "The verification code was incorrect. Please contact support.",
    [UserErrors.UserUnhandledError]: "We were unable to change the password. Please contact support.",
    [UserErrors.UserBanned]: "Your account has been blocked. Please contact support to resolve the issue.", // modal
  },
  changeAccountPassword: {
    [UserErrors.UserBanned]: "Your account has been locked and so we cannot change your password.",
    [UserErrors.UserUnhandledError]: "We were unable to change the password. Please contact support.",
    [UserErrors.EqualPasswords]: "Please ensure that your new password is different from the old one.",
    [UserErrors.InvalidOldPassword]: "Your old password is incorrect.",
  },
  getMyInfo: {
    [UserErrors.UserUnhandledError]: "We are unable to retrieve your user information. Please contact support.",
  },
  getInfo: {
    [UserErrors.Forbidden]: "You are not allowed to perform this action.",
    [UserErrors.UserNotFound]: "We were unable to retrieve the user details. Please contact support.",
    [UserErrors.UserUnhandledError]: "We were unable to retrieve the user details. Please contact support.",
  },
  ban: {
    [UserErrors.Forbidden]: "You are not allowed to perform this action.", // in code used removeCompany Forbidden
  },
  unban: {
    [UserErrors.Forbidden]: "You are not allowed to perform this action.", // in code used restoreCompany Forbidden
  },
  deleteUser: {
    [UserErrors.Forbidden]: "You are not allowed to perform this action.",
    [UserErrors.UserUnhandledError]: "We are unable to delete the user.",
    [UserErrors.CompanyNotFound]: "We were unable to retrieve the company details to delete.",
  },
  sendContactForm: {
    [UserErrors.ContactFormSendError]: "We were unable to send the message to the support team. Please contact us by phone.",
  },
  updateEmailAndName: {
    [UserErrors.BlankRequest]: "You have submitted invalid information.",
    [UserErrors.UserUnhandledError]: "We were unable to process your credentials update request. Please contact support.",
    [UserErrors.EmailNotSent]: "We were unable to send you a confirmation email. Please try again.",
    [UserErrors.UserAlreadyExists]: "This email is already registered.",
  },
  putTokensChangeCreds: {
    [UserErrors.UserUnhandledError]: "We were unable to confirm your request.",
    [UserErrors.CompanyNotFound]: "We were unable to retrieve the company details.",
    [UserErrors.UserNotFound]: "We were unable to retrieve the user details.",
    [UserErrors.UserBanned]: "Your account has been blocked. Please contact support.",
  },
  // BillingService
  updatePaymentMethod: {
    [BillingErrors.errorCreateStripeCustomer]: "We were unable to update your billing details. Please try again.",
    [BillingErrors.BillingUnhandledError]: "We were unable to update your billing details. Please contact support.",
  },
  getPaymentMethod: {
    [BillingErrors.customerNotExists]: "We are unable to retrieve your payment information. Please contact support.",
    [BillingErrors.paymentMethodNotExists]: "We are unable to retrieve your payment method. Please contact support.",
    [BillingErrors.BillingUnhandledError]: "We were unable to retrieve the payment method.",
  },
  subscribe: {
    [BillingErrors.BillingUnhandledError]: "We couldn't process your subscription. Please contact support.",
    [BillingErrors.alreadySubscribed]: "You're already subscribed. Try refreshing the page.",
    [BillingErrors.subscriptionInProgress]: "We are  verifying your subscription details. Try again in a few minutes. ",
    [BillingErrors.companyNotFound]: "We couldn't process your subscription. Log out, sign in, and try again.",
  },
  resubscribe: {
    [BillingErrors.companyNotFound]: "We were unable to retrieve your company details. Please refresh the page and try again.",
    [BillingErrors.companySubscriptionNotFound]: "We were unable to retrieve your subscription details. Please refresh the page and try again.",
    [BillingErrors.customerNotExists]: "We were unable to retrieve your billing details. Pleae refresh the page and try again.",
    [BillingErrors.subscriptionInProgress]: "Your subscription status in being updated. Wait a few minutes and try again.",
    [BillingErrors.alreadySubscribed]: "You are already subscribed. Thank you!",
    [BillingErrors.errorSubscriptionNotCanceled]: "We have not been able to cancel your subscription. Please contact support.",
    [BillingErrors.errorRetrieveStripeSubscription]: "We were unable to retrieve your billing details. Please refresh the page and try again.",
    [BillingErrors.errorUpdateStripeSubscription]: "We were unable to update your billing details. Please refresh the page and try again.",
    [BillingErrors.errorUserNotSubscribed]: "We were unable to update your billing details. Please refresh the page and try again.",
    [BillingErrors.BillingUnhandledError]: "We were unable to update your billing details. Please contact support.",
  },
  getPayments: {
    [BillingErrors.companyNotFound]: "We were unable to retrieve your billing details. Please refresh the page and try again.",
    [BillingErrors.BillingUnhandledError]: "We were unable to retrieve your billing details. Please contact support.",
  },
  cancelSubscription: {
    [BillingErrors.companyNotFound]: "We were unable to update your subscription status. Please refresh the page and try again.",
    [BillingErrors.forbidden]: "You are not allowed to perform this action.",
    [BillingErrors.errorDeleteStripeSubscription]: "We were unable to update your subscription status. Please refresh the page and try again.",
    [BillingErrors.errorUpdateStripeSubscription]: "We were unable to update your subscription status. Please refresh the page and try again.",
    [BillingErrors.BillingUnhandledError]: "We were unable to update your subscription status. Please contact support.",
  },
  // CommonService
  getCountries: {
    [FrontendErrors.GetCountries]: "We were unable to fetch the list of countries.",
  },
  // WidgetService
  getWidgetData: {
    [FrontendErrors.GetWidgetData]: "Company information is currently unable.",
  },
  sendInvite: {
    [WidgetErrors.CompanyNotFound]: "Company information is currently unable.",
    [WidgetErrors.CompanyRemoved]: "Company information is currently unable.",
    [WidgetErrors.SubscriptionExpired]: "Company information is currently unable.",
  },
};
