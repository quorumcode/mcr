import { FromSchema } from "json-schema-to-ts";
import { envSchema } from "@/schemas/env";
import { UrlBuilder } from "@/helpers/UrlBuilder";
import { MailService } from "@/services/MailService";
import { ImageService } from "@/services/ImageService";
import { UserService } from "@/services/UserService";
import { CompanyService } from "@/services/CompanyService";
import { ClientService } from "@/services/ClientService";
import { ReviewService } from "@/services/ReviewService";
import { InvitationService } from "@/services/InvitationService";
import { BillingService } from "@/services/BillingService";
import { PageService } from "@/services/PageService";
import { FastifyLoggerInstance } from "fastify";
import { AWSCloudWatchLogsService } from "@/services/AWSCloudWatchLogsService";

export interface Resources {
  urlBuilder: UrlBuilder;
  mailService: MailService;
  imageService: ImageService;
  userService: UserService;
  companyService: CompanyService;
  clientService: ClientService;
  reviewService: ReviewService;
  invitationService: InvitationService;
  billingService: BillingService;
  pageService: PageService;
  cloudWatchLogsService: AWSCloudWatchLogsService;
}

export function getResources(
  env: FromSchema<typeof envSchema>,
  logger: FastifyLoggerInstance
): Resources {
  const urlBuilder = new UrlBuilder({
    frontendExternalBaseUrl: env.FRONTEND_EXTERNAL_BASE_URL,
    imageBucketUrl: env.S3_BUCKET_IMAGES,
  });
  const mailService = new MailService(logger, {
    urlBuilder,
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    user: env.MAIL_USER,
    password: env.MAIL_PASS,
    from: env.MAIL_FROM,
    testMode: env.MAIL_SERVICE_TEST_MODE,
  });
  const imageService = new ImageService({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    bucket: env.S3_BUCKET,
  });
  const userService = new UserService({
    jwtAuthSecret: env.JWT_AUTH_SECRET,
  });
  const companyService = new CompanyService();
  const clientService = new ClientService();
  const reviewService = new ReviewService();
  const invitationService = new InvitationService({
    mailService,
    urlBuilder,
    reminderDefaultDelay: env.INVITATION_REMINDER_DELAY_DEFAULT,
    reminderMaxDelay: env.INVITATION_REMINDER_DELAY_MAX,
    reminderMinDelay: env.INVITATION_REMINDER_DELAY_MIN,
    limitFromLastInvitation: env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES,
  });
  const billingService = new BillingService(logger, {
    mailService,
    webhookSecretKey: env.STRIPE_WEBHOOK_SECRET_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    publicKey: env.STRIPE_PUBLIC_KEY,
    frontendExternalBaseUrl: env.FRONTEND_EXTERNAL_BASE_URL,
    priceUnitAmountDecimal: env.BILLING_PRICE_UNIT_AMOUNT_DECIMAL,
    recurringInterval: env.BILLING_RECURRING_INTERVAL,
    recurringIntervalCount: env.BILLING_RECURRING_INTERVAL_COUNT,
    defaultTaxRate: env.BILLING_DEFAULT_TAX_RATE,
    daysAfterCancelingSubscription:
      env.BILLING_DAYS_AFTER_CANCELING_SUBSCRIPTION,
    daysOfTrial: env.BILLING_DAYS_OF_TRIAL,
    daysBeforeNotificationOfTrialEnding:
      env.BILLING_DAYS_BEFORE_NOTIFICATION_OF_TRIAL_ENDING,
    stripeProductId: env.STRIPE_PRODUCT_ID,
    testPriceId: env.STRIPE_TEST_PRICE_ID,
    testSecretKey: env.STRIPE_TEST_SECRET_KEY,
    testWebhookSecretKey: env.STRIPE_TEST_WEBHOOK_SECRET_KEY,
    testDefaultTaxRate: env.STRIPE_TEST_DEFAULT_TAX_RATE,
  });
  const pageService = new PageService();
  const cloudWatchLogsService = new AWSCloudWatchLogsService(
    {
      accessKeyId: env.CLOUD_WATCH_LOGS_ACCESS_KEY_ID,
      region: env.CLOUD_WATCH_LOGS_REGION,
      secretAccessKey: env.CLOUD_WATCH_LOGS_SECRET_ACCESS_KEY,
      logGroupNames: [env.CLOUD_WATCH_LOGS_GROUP_NAME],
      recordsLimit: env.CLOUD_WATCH_LOGS_RECORDS_LIMIT,
    },
    logger
  );

  return {
    urlBuilder,
    mailService,
    imageService,
    userService,
    companyService,
    clientService,
    reviewService,
    invitationService,
    billingService,
    pageService,
    cloudWatchLogsService,
  };
}
