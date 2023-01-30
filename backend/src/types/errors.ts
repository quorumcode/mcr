export enum BillingErrors {
  AlreadySubscribed = "alreadySubscribed",
  Forbidden = "forbidden",
  PriceIdNotExists = "priceIdNotExists",
  CustomerDeleted = "customerDeleted",
  WebhookSignInvalid = "webhookSignInvalid",
  ErrorUserNotSubscribed = "errorUserNotSubscribed",
  CompanyNotFound = "companyNotFound",
  CompanySubscriptionNotFound = "companySubscriptionNotFound",
  ErrorUpdateStripeSubscription = "errorUpdateStripeSubscription",
  ErrorRetrieveStripeSubscription = "errorRetrieveStripeSubscription",
  ErrorSubscriptionNotCanceled = "errorSubscriptionNotCanceled",
  ErrorCreateStripeCustomer = "errorCreateStripeCustomer",
  ErrorDeleteStripeSubscription = "errorDeleteStripeSubscription",
  CustomerNotExists = "customerNotExists",
  PaymentMethodNotExists = "paymentMethodNotExists",
  SubscriptionInProgress = "subscriptionInProgress",
  StripeUserNotExists = "stripeUserNotExists",
  BillingUnhandledError = "BillingUnhandledError",
}

export enum ClientErrors {
  CompanyNotFound = "CompanyNotFound",
  Forbidden = "Forbidden",
  SubscriptionExpired = "SubscriptionExpired",
  CompanyRemoved = "CompanyRemoved",
  ClientDuplicated = "ClientDuplicated",
  CsvInvalid = "CsvInvalid",
  ImportLimitExceeded = "ImportLimitExceeded",
  FieldFromRequired = "FieldFromRequired",
  CompanyEmailInvalid = "CompanyEmailInvalid",
  InvitationsNotSent = "InvitationsNotSent",
  ClientUnhandledError = "ClientUnhandledError",
  EmailNotSent = "EmailNotSent",
  CreateInviteEmailFailed = "CreateInviteEmailFailed",
}

export enum CompanyErrors {
  TitleIsProfane = "TitleIsProfane",
  BodyIsProfane = "BodyIsProfane",
  LogoUploadError = "LogoUploadError",
  UserAlreadyHasCompany = "UserAlreadyHasCompany",
  CompanyNotFound = "CompanyNotFound",
  Forbidden = "Forbidden",
  CompanyUnhandledError = "CompanyUnhandledError",
  BadInvitationText = "BadInvitationText",
  BadReminderText = "BadReminderText",
  UrlInInvitationText = "UrlInInvitationText",
  UrlInReminderText = "UrlInReminderText",
  BccDelayLimitExceeded = "BccDelayLimitExceeded",
  BccEmailInUse = "BccEmailInUse",
  FingerprintRequired = "FingerprintRequired",
  CompanyVisitRestricted = "CompanyVisitRestricted",
  ReminderDelayLimitExceeded = "ReminderDelayLimitExceeded",
  ReminderDelayLessThenMinimum = "ReminderDelayLessThenMinimum",
  CompanyFingerprintMarkerUndefined = "CompanyFingerprintMarkerUndefined",
  CompanyIsNotTest = "CompanyIsNotTest",
}

export enum PageErrors {
  Forbidden = "forbidden",
  PageWitchNameAlreadyExists = "pageWitchNameAlreadyExists",
  PageNotFound = "pageNotFound",
  PageUnhandledError = "PageUnhandledError",
}

export enum ReviewErrors {
  ReviewNotFound = "ReviewNotFound",
  ReportSubmissionLimit = "ReportSubmissionLimit",
  Forbidden = "Forbidden",
  MessageIsProfane = "MessageIsProfane",
  InvalidToken = "InvalidToken",
  ClientFieldsRequired = "ClientFieldsRequired",
  ErrorLastReviewTimeLimit = "ErrorLastReviewTimeLimit",
  DoublicateReviewMessage = "DoublicateReviewMessage",
  CompanyNotFound = "CompanyNotFound",
  CompanySubscriptionExpired = "CompanySubscriptionExpired",
  CompanyRemoved = "CompanyRemoved",
  ReviewUnhandledError = "ReviewUnhandledError",
  ReviewEditTimeExpired = "ReviewEditTimeExpired",
}

export enum UserErrors {
  Forbidden = "forbidden",
  UserNotFound = "userNotFound",
  UserAlreadyExists = "userAlreadyExists",
  EmailNotVerified = "emailNotVerified",
  EmailAlreadyVerified = "emailAlreadyVerified",
  InvalidPassword = "invalidPassword",
  InvalidAccessToken = "invalidAccessToken",
  InvalidChangePasswordCode = "invalidChangePasswordCode",
  UserBanned = "userBanned",
  InvalidOldPassword = "invalidOldPassword",
  EqualPasswords = "equalPasswords",
  CompanyNotFound = "CompanyNotFound",
  BlankRequest = "BlankRequest",
  EmailNotSent = "EmailNotSent",
  InvalidEmailVerifyCode = "invalidEmailVerifyCode",
  MissingAuthorizationToken = "MissingAuthorizationToken",
  InvalidAuthorizationToken = "InvalidAuthorizationToken",
  ContactFormSendError = "ContactFormSendError",
  UserUnhandledError = "UserUnhandledError",
}