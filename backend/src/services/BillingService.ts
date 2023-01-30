import Stripe from "stripe";
import getUnixTime from "date-fns/getUnixTime";
import isFuture from "date-fns/isFuture";
import { Setting } from "@/models/Setting";
import { User, UserDoc } from "@/models/User";
import { Company, CompanyDoc } from "@/models/Company";
import { ServiceError } from "@/services/ServiceError";
import { FilterQuery, Types } from "mongoose";
import { Payment, PaymentDoc } from "@/models/Payment";
import { ReviewDoc } from "@/models/Review";
import { PaymentStatus, SubscriptionStatus } from "@/types/common";
import { addDays, format, fromUnixTime, subDays } from "date-fns";
import { MailService } from "@/services/MailService";
import { FastifyLoggerInstance } from "fastify";
import { BillingErrors } from "@/types/errors";

interface Config {
  webhookSecretKey: string;
  secretKey: string;
  publicKey: string;
  frontendExternalBaseUrl: string;
  mailService: MailService;
  priceUnitAmountDecimal: number;
  recurringInterval: "day" | "month" | "week" | "year";
  recurringIntervalCount: number;
  defaultTaxRate?: string;
  daysAfterCancelingSubscription: number;
  daysOfTrial: number;
  daysBeforeNotificationOfTrialEnding: number;
  stripeProductId: string;
  testPriceId: string;
  testSecretKey: string;
  testWebhookSecretKey: string;
  testDefaultTaxRate: string;
}

interface BillingSettings {
  stripeProductId: string;
  stripePriceId: string;
}

export class BillingService {
  private config: Config;
  private stripe: Stripe;
  private testStripe: Stripe;
  private billingSettings: BillingSettings | undefined;
  private logger: FastifyLoggerInstance;

  constructor(logger: FastifyLoggerInstance, config: Config) {
    this.config = config;
    this.logger = logger;
    this.testStripe = new Stripe(config.testSecretKey, {
      apiVersion: "2020-08-27",
      appInfo: {
        name: "app",
        version: "0.0.1",
        url: config.frontendExternalBaseUrl,
      },
    });
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: "2020-08-27",
      appInfo: {
        name: "app",
        version: "0.0.1",
        url: config.frontendExternalBaseUrl,
      },
    });
  }

  async setup(): Promise<void> {
    this.billingSettings = await this.getBillingSettings();
    if (!this.billingSettings) {
      const price = await this.stripe.prices.create({
        unit_amount_decimal: this.config.priceUnitAmountDecimal.toString(),
        currency: "aud",
        recurring: {
          interval: this.config.recurringInterval,
          interval_count: this.config.recurringIntervalCount,
          usage_type: "licensed",
        },
        billing_scheme: "per_unit",
        product_data: {
          name: "standard",
        },
        expand: ["product"],
      });
      await this.saveBillingSettings({
        stripePriceId: price.id,
        stripeProductId: (price.product as Stripe.Product).id,
      });
    }
  }

  async getBillingSettings(): Promise<BillingSettings | undefined> {
    const settings = await Setting.findOne({
      "billing.stripeProductId": this.config.stripeProductId,
    });
    return settings?.billing;
  }

  async saveBillingSettings(settings: BillingSettings): Promise<void> {
    await Setting.updateOne(
      {},
      {
        billing: settings,
      },
      {
        upsert: true,
      }
    );
    this.billingSettings = settings;
  }

  async getObjectsByCustomerId(stripeCustomerId: string): Promise<{
    user: UserDoc | null;
    company: CompanyDoc | null;
  }> {
    const user = await User.findOne({ stripeCustomerId }).exec();
    let company = null;
    if (user) {
      company = await Company.findOne({ user: Types.ObjectId(user.id) });
    }
    return {
      user,
      company,
    };
  }

  async createStripeCustomer(user: UserDoc): Promise<UserDoc> {
    let customer;
    try {
      const customerData = {
        name: user.name,
        email: user.email,
      } as Stripe.CustomerCreateParams;

      // handle test companies
      let stripe = this.stripe;
      if (user.isTest) {
        stripe = this.testStripe;
        const tesclock = await stripe.testHelpers.testClocks.create({
          frozen_time: getUnixTime(new Date()),
          name: "User " + user.name + " Clock",
        });
        customerData.test_clock = tesclock.id;
      }
      customer = await stripe.customers.create(customerData);
    } catch (e) {
      this.logger.error(
        e,
        "createStripeCustomer. Cant create customer in stripe."
      );
      throw new ServiceError({ code: BillingErrors.ErrorCreateStripeCustomer });
    }
    user.stripeCustomerId = customer.id;
    return await user.save();
  }

  // Obsolete (not in use now)
  async getStripeCustomer(id: string) {
    return await this.stripe.customers.retrieve(id);
  }

  async getPaymentMethod(
    stripeCustomerId: string,
    isTest = false
  ): Promise<
    | {
        email: string;
        name: string;
        card: {
          type: string;
          month: number;
          year: number;
          lastDigits: string;
        };
        address: {
          town: string;
          countryCode: string;
          line1: string;
          postalCode: string;
        };
      }
    | undefined
  > {
    // handle test companies
    let stripe = this.stripe;
    if (isTest) {
      stripe = this.testStripe;
    }

    const customer = (await stripe.customers.retrieve(stripeCustomerId, {
      expand: ["invoice_settings.default_payment_method"],
    })) as Stripe.Customer & {
      invoice_settings: {
        default_payment_method: Stripe.PaymentMethod | undefined;
      };
    };
    if (customer.deleted) {
      throw new ServiceError({ code: BillingErrors.CustomerDeleted });
    }
    if (!customer.invoice_settings.default_payment_method) {
      return undefined;
    }

    const { email, name, address } =
      customer.invoice_settings.default_payment_method.billing_details;
    const card = customer.invoice_settings.default_payment_method
      .card as Stripe.PaymentMethod.Card;

    return {
      email: email || "",
      name: name || "",
      card: {
        type: card.brand,
        month: card.exp_month,
        year: card.exp_year,
        lastDigits: card.last4,
      },
      address: {
        town: address?.city || "",
        countryCode: address?.country || "",
        line1: address?.line1 || "",
        postalCode: address?.postal_code || "",
      },
    };
  }

  async updatePaymentMethod(
    stripeCustomerId: string,
    params: {
      email?: string;
      name?: string;
      card?: {
        number: string;
        month: string;
        year: string;
        cvv: string;
      };
      address?: {
        town: string;
        countryCode: string;
        line1: string;
        postalCode: string;
      };
    },
    isTest = false
  ): Promise<void> {
    // handle test companies
    let stripe = this.stripe;
    if (isTest) {
      stripe = this.testStripe;
    }
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.deleted) {
      throw new ServiceError({ code: BillingErrors.CustomerDeleted });
    }

    const defaultPaymentMethodId = customer.invoice_settings
      ?.default_payment_method as string;

    const billingDetails: {
      name?: string;
      email?: string;
      address?: {
        city: string;
        country: string;
        line1: string;
        postal_code: string;
      };
    } = {
      name: params.name,
      email: params.email,
    };
    let card:
      | {
          number: string;
          exp_month: number;
          exp_year: number;
          cvc: string;
        }
      | undefined;

    if (params.address) {
      billingDetails.address = {
        city: params.address.town,
        country: params.address.countryCode,
        line1: params.address.line1,
        postal_code: params.address.postalCode,
      };
    }
    if (params.card) {
      card = {
        number: params.card.number,
        exp_month: Number(params.card.month),
        exp_year: Number(params.card.year),
        cvc: params.card.cvv,
      };
    }

    if (defaultPaymentMethodId && !card) {
      await stripe.paymentMethods.update(defaultPaymentMethodId, {
        billing_details: billingDetails,
      });
    } else {
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        billing_details: billingDetails,
        card,
      });
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
    }
  }

  async subscribe(
    user: UserDoc,
    company: CompanyDoc
  ): Promise<{
    subscriptionId: string;
    requiresAction: boolean;
    clientSecret: string;
  }> {
    if (!user.stripeCustomerId) {
      throw new ServiceError({ code: BillingErrors.CustomerNotExists });
    }
    if (!this.billingSettings?.stripePriceId) {
      throw new ServiceError({ code: BillingErrors.PriceIdNotExists });
    }
    if (company.subscription?.stripeSubscriptionId) {
      throw new ServiceError({ code: BillingErrors.AlreadySubscribed });
    }
    const trialEndAt = addDays(company.createdAt, this.config.daysOfTrial);
    const trialEndTimestamp = getUnixTime(trialEndAt);
    const hasTrial = isFuture(trialEndAt);

    if (company.subscription) {
      company.subscription.inProgress = true;
      company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
      await company.save();
    }
    const subscriptionData = {
      customer: user.stripeCustomerId,
      items: [
        {
          price: this.billingSettings?.stripePriceId,
        },
      ],
      trial_end: hasTrial ? trialEndTimestamp : undefined,
      billing_cycle_anchor: hasTrial ? trialEndTimestamp : undefined,
      collection_method: "charge_automatically",
      off_session: true,
      expand: ["latest_invoice.payment_intent"],
      default_tax_rates: this.config.defaultTaxRate
        ? [this.config.defaultTaxRate]
        : [],
    } as Stripe.SubscriptionCreateParams;

    // handle test companies
    let stripe = this.stripe;
    if (company.isTest) {
      stripe = this.testStripe;
      subscriptionData.default_tax_rates = this.config.testDefaultTaxRate
        ? [this.config.testDefaultTaxRate]
        : [];
    }
    const subscription = (await stripe.subscriptions.create(
      subscriptionData
    )) as Stripe.Subscription & {
      latest_invoice: Stripe.Invoice & {
        payment_intent: Stripe.PaymentIntent | null;
      };
    };

    return {
      subscriptionId: subscription.id,
      requiresAction:
        !!subscription.latest_invoice.payment_intent?.client_secret,
      clientSecret:
        subscription.latest_invoice.payment_intent?.client_secret || "",
    };
  }

  getWebhookEvent(body: any, sign: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        sign,
        this.config.webhookSecretKey
      );
    } catch (e) {
      // handle webhooks for test companies start
      if (e instanceof Stripe.errors.StripeSignatureVerificationError) {
        try {
          return this.testStripe.webhooks.constructEvent(
            body,
            sign,
            this.config.testWebhookSecretKey
          );
        } catch (e) {
          this.logger.error(e);
          throw new ServiceError(
            { code: BillingErrors.WebhookSignInvalid },
            e as Error
          );
        }
      }
      // handle webhooks for test companies end
      this.logger.error(e);
      throw new ServiceError(
        { code: BillingErrors.WebhookSignInvalid },
        e as Error
      );
    }
  }

  async getPayments({
    companyId,
    skip = 0,
    limit = 100,
  }: {
    companyId: string;
    skip?: number;
    limit?: number;
  }): Promise<{
    data: PaymentDoc[];
    total: number;
  }> {
    const filterQuery: FilterQuery<ReviewDoc> = {
      company: Types.ObjectId(companyId),
    };
    const query = Payment.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = await query.exec();
    const total = await Payment.countDocuments(filterQuery);

    return { data, total };
  }

  async cancelSubscription(company: CompanyDoc): Promise<void> {
    const subscriptionId = company.subscription?.stripeSubscriptionId;
    if (!company.subscription || !subscriptionId) {
      throw new ServiceError({ code: BillingErrors.ErrorUserNotSubscribed });
    }
    if (company.subscription?.status === SubscriptionStatus.trialing) {
      return this.cancelSubscriptionImmediately(company);
    }
    try {
      // handle test companies
      let stripe = this.stripe;
      if (company.isTest) {
        stripe = this.testStripe;
      }
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at: getUnixTime(
          addDays(
            company.subscription.periodEndAt,
            this.config.daysAfterCancelingSubscription
          )
        ),
      });
    } catch (e) {
      this.logger.error(
        e,
        "cancelSubscription. Cant update subscription in stripe."
      );
      throw new ServiceError({
        code: BillingErrors.ErrorUpdateStripeSubscription,
      });
    }

    if (company.subscription) {
      company.subscription.inProgress = true;
      company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
      await company.save();
    }
  }

  async reSubscribe(company: CompanyDoc): Promise<void> {
    const subscriptionId = company.subscription?.stripeSubscriptionId;
    if (!company.subscription || !subscriptionId) {
      throw new ServiceError({ code: BillingErrors.ErrorUserNotSubscribed });
    }
    // handle test companies
    let stripe = this.stripe;
    if (company.isTest) {
      stripe = this.testStripe;
    }

    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      if (stripeSub.cancel_at == null) {
        throw new ServiceError({
          code: BillingErrors.ErrorSubscriptionNotCanceled,
        });
      }
    } catch (e) {
      throw new ServiceError({
        code: BillingErrors.ErrorRetrieveStripeSubscription,
      });
    }

    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at: null,
      });
    } catch (e) {
      this.logger.error(e, "reSubscribe. Cant update subscription in stripe.");
      throw new ServiceError({
        code: BillingErrors.ErrorUpdateStripeSubscription,
      });
    }
    if (company.subscription) {
      company.subscription.inProgress = true;
      company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
      await company.save();
    }
  }

  async cancelSubscriptionImmediately(company: CompanyDoc): Promise<void> {
    const subscriptionId = company.subscription?.stripeSubscriptionId;
    if (!subscriptionId) {
      throw new ServiceError({ code: BillingErrors.ErrorUserNotSubscribed });
    }

    // handle test companies
    let stripe = this.stripe;
    if (company.isTest) {
      stripe = this.testStripe;
    }

    try {
      await stripe.subscriptions.del(subscriptionId);
    } catch (e) {
      this.logger.error(
        e,
        "cancelSubscriptionImmediately. Cant delete subscription in stripe."
      );
      throw new ServiceError({
        code: BillingErrors.ErrorDeleteStripeSubscription,
      });
    }

    if (company.subscription) {
      company.subscription.inProgress = true;
      await company.save();
    }
  }

  async startTrial(company: CompanyDoc): Promise<void> {
    company.subscription = {
      status: SubscriptionStatus.trialing,
      periodStartAt: company.createdAt,
      periodEndAt: addDays(company.createdAt, this.config.daysOfTrial),
      inProgress: false,
      trialingCardConfirmed: false,
    };
    await company.save();
  }

  async deactivateSubscription(company: CompanyDoc): Promise<void> {
    if (company.subscription?.status === SubscriptionStatus.trialing) {
      company.subscription.stripeSubscriptionId = undefined;
    } else {
      company.subscription = undefined;
      company.subscriptionDeactivatedAt = new Date();
    }
    company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
    await company.save();
  }

  async savePayment(data: {
    id: string;
    amount: number; // 9900 = 99$
    created: number; // unix timestamp
    currency: string;
    customer: string; // ID
    invoice: string; // ID
    status: PaymentStatus;
  }): Promise<void> {
    const { company } = await this.getObjectsByCustomerId(data.customer);
    if (!company) {
      throw new ServiceError({ code: BillingErrors.CompanyNotFound });
    }
    // handle test companies
    let stripe = this.stripe;
    if (company.isTest) {
      stripe = this.testStripe;
    }
    const { hosted_invoice_url: url } = await stripe.invoices.retrieve(
      data.invoice
    );
    let payment = await Payment.findOne({ stripePaymentIntentId: data.id });
    if (payment) {
      payment.status = data.status;
    } else {
      payment = new Payment({
        company,
        stripePaymentIntentId: data.id,
        createdAt: fromUnixTime(data.created),
        amount: data.amount / 100,
        currency: data.currency,
        status: data.status,
        url,
      });
    }
    await payment.save();
  }

  async getTrialEndingCompaniesForRemind(): Promise<
    Array<CompanyDoc & { user: UserDoc }>
  > {
    return (await Company.find({
      "subscription.status": SubscriptionStatus.trialing,
      "subscription.periodEndAt": {
        $lt: addDays(
          new Date(),
          this.config.daysBeforeNotificationOfTrialEnding
        ),
      },
      "subscription.trialEndingEmailSent": { $ne: true },
    })
      .populate("user")
      .exec()) as Array<CompanyDoc & { user: UserDoc }>;
  }

  async sendTrialEndingRemind(
    company: CompanyDoc & { user: UserDoc }
  ): Promise<void> {
    if (!company.subscription) {
      throw new ServiceError({
        code: BillingErrors.CompanySubscriptionNotFound,
      });
    }

    await this.config.mailService.sgSendTrialEndingRemind(company.user.email, {
      name: company.user.name,
      expiryDate: format(company.subscription.periodEndAt, "d MMM, yyyy"),
    });
    if (!company.subscription) {
      return;
    }
    company.subscription.trialEndingEmailSent = true;
    company.markModified("subscription"); //https://mongoosejs.com/docs/schematypes.html#mixed
    await company.save();
  }
}
