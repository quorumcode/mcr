import {
  InvitationEmail,
  InvitationEmailDoc,
  InvitationEmailProps,
} from "@/models/InvitationEmail";
import { Client, ClientDoc } from "@/models/Client";
import { FilterQuery, Types } from "mongoose";
import { MailService } from "@/services/MailService";
import { CompanyDoc } from "@/models/Company";
import { EmailTemplateName } from "@/types/common";
import { ReviewToken, ReviewTokenDoc } from "@/models/ReviewToken";
import randToken from "rand-token";
import get from "lodash/get";
import { getDefaultEmailTemplates } from "@/helpers/getDefaultEmailTemplates";
import { UrlBuilder } from "@/helpers/UrlBuilder";
import { addDays, subDays, subMinutes } from "date-fns";
import { ServiceError } from "./ServiceError";
import { ClientErrors } from "@/types/errors";

interface Config {
  mailService: MailService;
  urlBuilder: UrlBuilder;
  reminderDefaultDelay: number;
  reminderMaxDelay: number;
  reminderMinDelay: number;
  limitFromLastInvitation: number;
}

type PopulatedReviewTokenDoc = ReviewTokenDoc & {
  company: CompanyDoc;
  client: ClientDoc | null;
};

type PopulatedInvitationEmailDoc = InvitationEmailDoc & {
  company: CompanyDoc;
  client: ClientDoc;
  reviewToken: ReviewTokenDoc;
};

export class InvitationService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async getClientsForInvitation({
    companyId,
    skip = 0,
    limit = 100,
    batchId,
  }: {
    companyId: string;
    skip?: number;
    limit?: number;
    batchId?: string;
  }): Promise<{
    data: ClientDoc[];
    total: number;
  }> {
    const query: FilterQuery<ClientDoc> = {
      company: Types.ObjectId(companyId),
      $or: [
        { lastInvitedAt: { $exists: false } },
        {
          lastInvitedAt: {
            $lt: subMinutes(new Date(), this.config.limitFromLastInvitation),
          },
        },
      ],
    };

    if (batchId) {
      query.batchId = batchId;
    }

    const data = await Client.find(query)
      .sort({
        name: 1,
      })
      .collation({ locale: "en_US" })
      .skip(skip)
      .limit(limit);
    const total = await Client.countDocuments(query);

    return { data, total };
  }

  async getAlredyInvitedCount({
    companyId,
    batchId,
  }: {
    companyId: string;
    batchId?: string;
  }): Promise<number> {
    const query: FilterQuery<ClientDoc> = {
      company: Types.ObjectId(companyId),
      lastInvitedAt: {
        $gt: subMinutes(new Date(), this.config.limitFromLastInvitation),
      },
    };

    if (batchId) {
      query.batchId = batchId;
    }

    return await Client.countDocuments(query);
  }

  async createInviteEmail(
    data: Pick<
      InvitationEmailProps,
      | "company"
      | "client"
      | "reviewToken"
      | "template"
      | "needRemind"
      | "sendAt"
    >
  ): Promise<InvitationEmailDoc> {
    const inviteEmail = new InvitationEmail(data);
    inviteEmail.createdAt = new Date();
    await inviteEmail.save();
    return inviteEmail;
  }

  async createReviewToken({
    companyId,
    clientId,
  }: {
    companyId: string;
    clientId?: string;
  }): Promise<ReviewTokenDoc> {
    const existsToken = await ReviewToken.findOne({
      company: Types.ObjectId(companyId),
      client: clientId ? Types.ObjectId(clientId) : { $exists: false },
    });
    if (existsToken) {
      return existsToken;
    }

    const value = randToken.generate(16);
    const reviewToken = new ReviewToken({
      value,
      company: Types.ObjectId(companyId),
    });
    if (clientId) {
      reviewToken.client = Types.ObjectId(clientId);
    }
    reviewToken.createdAt = new Date();
    await reviewToken.save();
    return reviewToken;
  }

  async sendReviewInvite({
    company,
    client,
    emailTemplateName,
  }: {
    company: CompanyDoc;
    client: ClientDoc;
    emailTemplateName: EmailTemplateName;
  }): Promise<void> {
    const emailTemplate = get(
      company,
      ["emailTemplates", emailTemplateName],
      getDefaultEmailTemplates(company.name)[emailTemplateName]
    ) as string;

    const reviewToken = await this.createReviewToken({
      companyId: company._id,
      clientId: client._id,
    });
    const url = this.config.urlBuilder.getAddReviewUrl(reviewToken.value);

    try {
      let reminderDelay = this.config.reminderDefaultDelay;
      if (company.reminderDelay) {
        reminderDelay = company.reminderDelay;
      }
      await this.createInviteEmail({
        company,
        client,
        reviewToken,
        template: emailTemplateName,
        needRemind: true,
        sendAt: addDays(new Date(), reminderDelay),
      });
      client.lastInvitedAt = new Date();
      await client.save();
    } catch {
      throw new ServiceError({
        message: client.email,
        code: ClientErrors.CreateInviteEmailFailed,
      });
    }

    try {
      await this.config.mailService.sgSendReviewInvitation(client.email, {
        url,
        text: emailTemplate,
        businessName: company.name,
        logoUrl: company.logo as string,
      });
    } catch {
      throw new ServiceError({
        message: client.email,
        code: ClientErrors.EmailNotSent,
      });
    }
  }

  async sendReviewInvitationRemind(
    invitationEmail: PopulatedInvitationEmailDoc
  ): Promise<void> {
    const emailTemplate = get(
      invitationEmail.company,
      ["emailTemplates", EmailTemplateName.reminder],
      getDefaultEmailTemplates(invitationEmail.company.name)[
        EmailTemplateName.reminder
      ]
    ) as string;

    const url = this.config.urlBuilder.getAddReviewUrl(
      invitationEmail.reviewToken.value
    );

    invitationEmail.isReminded = true;
    await invitationEmail.save();

    await this.config.mailService.sgSendReviewInvitationRemind(
      invitationEmail.client.email,
      {
        url,
        text: emailTemplate,
        businessName: invitationEmail.company.name,
      }
    );
  }

  async getReviewTokenInfoByValue(
    value: string
  ): Promise<PopulatedReviewTokenDoc | null> {
    return (await ReviewToken.findOne({
      value,
    })
      .populate("company")
      .populate("client")
      .exec()) as PopulatedReviewTokenDoc | null;
  }

  async getQRReviewTokenValue(
    companyId: string
  ): Promise<ReviewTokenDoc | null> {
    return ReviewToken.findOne({
      company: Types.ObjectId(companyId),
      client: { $exists: false },
    });
  }

  async turnOffReminds(client: ClientDoc): Promise<void> {
    await InvitationEmail.updateMany({ client }, { needRemind: false });
  }

  async getRemindNeededEmails(
    limit: number
  ): Promise<PopulatedInvitationEmailDoc[]> {
    return (await InvitationEmail.find({
      needRemind: true,
      isReminded: { $ne: true },
      createdAt: { $lt: subDays(new Date(), this.config.reminderMinDelay) },
      sendAt: { $lt: new Date() },
    })
      .limit(limit)
      .populate("company")
      .populate("client")
      .populate("reviewToken")) as PopulatedInvitationEmailDoc[];
  }
}
