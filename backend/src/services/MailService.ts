import Email from "email-templates";
import path from "path";
import format from "date-fns/format";
import { UrlBuilder } from "@/helpers/UrlBuilder";
import { FastifyLoggerInstance } from "fastify";
const sgMail = require("@sendgrid/mail");

interface Config {
  urlBuilder: UrlBuilder;
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  testMode: boolean;
}

export class MailService {
  private config: Config;
  private email: Email;
  private logger: FastifyLoggerInstance;

  constructor(logger: FastifyLoggerInstance, config: Config) {
    this.config = config;
    this.logger = logger;
    sgMail.setApiKey(this.config.password);
    this.email = new Email({
      send: !this.config.testMode, // Send emails for dev and test environments too (Not for Sendgrid)
      views: {
        root: path.resolve("src", "emails", "views"),
        locals: {
          frontendBaseUrl: this.config.urlBuilder.getFrontendBaseUrl(),
          imageBucketUrl: this.config.urlBuilder.getImageBucketUrl(),
        },
      },
      message: {
        from: config.from,
      },
      juice: true,
      juiceResources: {
        webResources: {
          relativeTo: path.resolve("src", "emails", "assets"),
        },
      },
      transport: {
        // pool: true,
        host: config.host,
        port: config.port,
        secure: false,
        auth: {
          user: config.user,
          pass: config.password,
        },
      },
    });
  }

  async renderEmail(tempName: string, locals: object): Promise<string> {
    return await this.email.render(tempName, {
      frontendBaseUrl: this.config.urlBuilder.getFrontendBaseUrl(),
      imageBucketUrl: this.config.urlBuilder.getImageBucketUrl(),
      ...locals,
    });
  }

  emailFromBuild(fromName: string, fromEmail: string): string {
    return `${fromName} <${fromEmail}>`;
  }

  async sendEmailVerify(
    email: string,
    { url, name }: { url: string; name: string }
  ): Promise<void> {
    await this.email.send({
      template: "emailVerify",
      message: {
        to: email,
        subject: "My Client Reviews - Verify Your Email",
      },
      locals: {
        url,
        name,
      },
    });
  }

  async sgSendEmailVerify(
    email: string,
    { url, name }: { url: string; name: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendEmailVerify started");
    const locals = {
      url,
      name,
    };
    const msg = {
      to: email,
      from: this.config.from,
      subject: "My Client Reviews - Verify Your Email",
      html: await this.renderEmail("emailVerify", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendEmailVerify SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendChangePasswordCode(
    email: string,
    { url }: { url: string }
  ): Promise<void> {
    await this.email.send({
      template: "changePassword",
      message: {
        to: email,
        subject: "Password Reset",
      },
      locals: {
        url,
      },
    });
  }

  async sgSendChangePasswordCode(
    email: string,
    { url }: { url: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendChangePasswordCode started");
    const locals = {
      url,
    };
    const msg = {
      to: email,
      from: this.config.from,
      subject: "Password Reset",
      html: await this.renderEmail("changePassword", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendChangePasswordCode SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendReviewInvitation(
    email: string,
    {
      url,
      text,
      businessName,
    }: { url: string; text: string; businessName: string }
  ): Promise<void> {
    await this.email.send({
      template: "reviewInvitation",
      message: {
        to: email,
        subject: "Review Invitation",
      },
      locals: {
        url,
        text,
        businessName,
      },
    });
  }

  async sgSendReviewInvitation(
    email: string,
    {
      url,
      text,
      businessName,
      logoUrl,
    }: { url: string; text: string; businessName: string; logoUrl: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendReviewInvitation started");
    const locals = {
      url,
      text,
      businessName,
      logoUrl,
    };
    const msg = {
      to: email,
      from: this.emailFromBuild(businessName, this.config.from),
      subject: "Review Invitation",
      html: await this.renderEmail("reviewInvitation", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendReviewInvitation SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendReviewInvitationRemind(
    email: string,
    {
      url,
      text,
      businessName,
    }: { url: string; text: string; businessName: string }
  ): Promise<void> {
    await this.email.send({
      template: "reviewInvitationRemind",
      message: {
        to: email,
        subject: "Review Invitation Reminder",
      },
      locals: {
        url,
        text,
        businessName,
      },
    });
  }

  async sgSendReviewInvitationRemind(
    email: string,
    {
      url,
      text,
      businessName,
    }: { url: string; text: string; businessName: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendReviewInvitationRemind started");
    const locals = {
      url,
      text,
      businessName,
    };
    const msg = {
      to: email,
      from: this.emailFromBuild(businessName, this.config.from),
      subject: "Review Invitation Reminder",
      html: await this.renderEmail("reviewInvitationRemind", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendReviewInvitationRemind SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendReviewNotification(
    email: string,
    {
      replyUrl,
      clientName,
      rate,
      message,
      date,
    }: {
      replyUrl: string;
      clientName: string;
      rate: number;
      message: string;
      date: Date;
    }
  ): Promise<void> {
    const formattedRate = rate.toFixed(1);
    const formattedDate = format(date, "d LLL, y");

    await this.email.send({
      template: "reviewNotification",
      message: {
        to: email,
        subject: `You Have Received A New ${rate} Star Review`,
      },
      locals: {
        replyUrl,
        clientName,
        message,
        rate,
        formattedRate,
        formattedDate,
      },
    });
  }

  async sgSendReviewNotification(
    email: string,
    {
      replyUrl,
      clientName,
      rate,
      message,
      date,
    }: {
      replyUrl: string;
      clientName: string;
      rate: number;
      message: string;
      date: Date;
    }
  ): Promise<void> {
    this.logger.info("MailService. sgSendReviewNotification started");
    const formattedRate = rate.toFixed(1);
    const formattedDate = format(date, "d LLL, y");
    const locals = {
      replyUrl,
      clientName,
      message,
      rate,
      formattedRate,
      formattedDate,
    };
    const msg = {
      to: email,
      from: this.config.from,
      subject: `You Have Received A New ${rate} Star Review`,
      html: await this.renderEmail("reviewNotification", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendReviewNotification SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendReplyNotification(
    email: string,
    {
      reviewUrl,
      businessName,
      clientName,
      reviewRate,
      reviewMessage,
      reviewDate,
      replyMessage,
      replyDate,
    }: {
      reviewUrl: string;
      businessName: string;
      clientName: string;
      reviewRate: number;
      reviewMessage: string;
      reviewDate: Date;
      replyMessage: string;
      replyDate: Date;
    }
  ): Promise<void> {
    const formattedReviewRate = reviewRate.toFixed(1);
    const formattedReviewDate = format(reviewDate, "d LLL, y");
    const formattedReplyDate = format(replyDate, "d LLL, y");

    await this.email.send({
      template: "replyNotification",
      message: {
        to: email,
        subject: "Business Response",
      },
      locals: {
        reviewUrl,
        businessName,
        clientName,
        reviewMessage,
        reviewRate,
        formattedReviewRate,
        formattedReviewDate,
        replyMessage,
        formattedReplyDate,
      },
    });
  }

  async sgSendReplyNotification(
    email: string,
    {
      reviewUrl,
      businessName,
      clientName,
      reviewRate,
      reviewMessage,
      reviewDate,
      replyMessage,
      replyDate,
      logoUrl,
    }: {
      reviewUrl: string;
      businessName: string;
      clientName: string;
      reviewRate: number;
      reviewMessage: string;
      reviewDate: Date;
      replyMessage: string;
      replyDate: Date;
      logoUrl: string;
    }
  ): Promise<void> {
    this.logger.info("MailService. sgSendReplyNotification started");
    const formattedReviewRate = reviewRate.toFixed(1);
    const formattedReviewDate = format(reviewDate, "d LLL, y");
    const formattedReplyDate = format(replyDate, "d LLL, y");

    const locals = {
      reviewUrl,
      businessName,
      clientName,
      reviewMessage,
      reviewRate,
      formattedReviewRate,
      formattedReviewDate,
      replyMessage,
      formattedReplyDate,
      logoUrl,
    };
    const msg = {
      to: email,
      from: this.emailFromBuild(businessName, this.config.from),
      subject: "Business Response",
      html: await this.renderEmail("replyNotification", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendReplyNotification SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sendTrialEndingRemind(
    email: string,
    {
      name,
    }: {
      name: string;
    }
  ): Promise<void> {
    await this.email.send({
      template: "trialEndingRemind",
      message: {
        to: email,
        subject: "3 Month Free Trial Ending",
      },
      locals: {
        name,
      },
    });
  }

  async sgSendTrialEndingRemind(
    email: string,
    {
      name,
      expiryDate,
    }: {
      name: string;
      expiryDate: string;
    }
  ): Promise<void> {
    this.logger.info("MailService. sgSendTrialEndingRemind started");
    const locals = {
      name,
      expiryDate,
    };
    const msg = {
      to: email,
      from: this.config.from,
      subject: "3 Month Free Trial Ending",
      html: await this.renderEmail("trialEndingRemind", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendTrialEndingRemind SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sgSendCredentialsChange(
    email: string,
    { url }: { url: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendCredentialsChange started");
    const locals = {
      url,
    };
    const msg = {
      to: email,
      from: this.config.from,
      subject: "My Client Reviews - Change Credentials Confirmation",
      html: await this.renderEmail("credentialsChange", locals),
      mail_settings: {
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendCredentialsChange SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sgSendContactForm(
    email: string,
    { body }: { body: string }
  ): Promise<void> {
    this.logger.info("MailService. sgSendContactForm started");
    const formattedTicketDate = format(new Date(), "d LLL, y");
    const msg = {
      to: "1185772236@tickets.helpdesk.com",
      cc: email,
      from: this.config.from,
      subject: `Support ticket from ${email} on  ${formattedTicketDate}`,
      text: body,
      mail_settings: {
        footer: {
          enable: false,
        },
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendContactForm SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }

  async sgSendWithFile(
    toEmail: string[] | undefined,
    htmlBody: string,
    attachment: string
  ): Promise<void> {
    this.logger.info("MailService. sgSendErrorLogs started");
    const msg = {
      to: toEmail,
      from: this.config.from,
      subject: `Unhandled errors`,
      html: htmlBody,
      attachments: [
        {
          content: attachment,
          filename: "log.txt",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
      mail_settings: {
        footer: {
          enable: false,
        },
        sandbox_mode: {
          enable: this.config.testMode,
        },
      },
    };
    const result = await sgMail.send(msg);
    this.logger.info(
      `MailService. sgSendErrorLogs SendGridReponse: 
      ${JSON.stringify(result)}`
    );
  }
}
