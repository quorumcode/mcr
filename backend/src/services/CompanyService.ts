import { Company, CompanyDoc, CompanyProps } from "@/models/Company";
import { Types, FilterQuery } from "mongoose";
import { escapeRegex } from "@/helpers/escapeRegex";
import { UserDoc } from "@/models/User";
import { SubscriptionStatus, VisitSource } from "@/types/common";
import { CompanyVisit, CompanyVisitDoc } from "@/models/CompanyVisit";
import { addDays, subMinutes } from "date-fns";
import { CompanyErrors } from "@/types/errors";
import { ServiceError } from "./ServiceError";

type Props = Pick<
  CompanyProps,
  | "name"
  | "categories"
  | "address"
  | "about"
  | "logo"
  | "webSite"
  | "contactPhone"
  | "isRemoved"
  | "emailForReviewNotifications"
  | "emailForNegativeReviewAlerts"
  | "isTest"
  | "isFingerprintDisable"
>;

interface GetCompaniesParams {
  search?: string;
  skip?: number;
  limit?: number;
  sort?: string;
  fields?: string[];
  includeRemoved?: boolean;
  includeUnsubscribed?: boolean;
  includeTest?: boolean;
}

interface VisitStatsByDateRange {
  dateRangeFrom: Date;
  dateRangeTo: Date;
  total: number;
  site: number;
  widget: number;
}

export class CompanyService {
  async getCompanyByUser(userId: string): Promise<CompanyDoc | null> {
    try {
      return await Company.findOne({ user: Types.ObjectId(userId) }).exec();
    } catch (e) {
      return null;
    }
  }

  async getCompanyById(id: string): Promise<CompanyDoc | null> {
    try {
      return await Company.findById(id).exec();
    } catch (e) {
      // TODO: Add error logger.
      return null;
    }
  }

  async getCompanyByEmailForImportHook(
    email: string
  ): Promise<CompanyDoc | null> {
    try {
      return await Company.findOne({ emailsForImportHook: email }).exec();
    } catch (e) {
      return null;
    }
  }

  async getCompanies({
    search = "",
    skip = 0,
    limit = 100,
    sort,
    fields,
    includeRemoved = false,
    includeUnsubscribed = false,
    includeTest = false,
  }: GetCompaniesParams): Promise<{ data: CompanyDoc[]; total: number }> {
    const query: FilterQuery<CompanyDoc> = {};
    const projection: any =
      fields?.reduce((result, field) => {
        result[field] = 1;
        return result;
      }, {} as any) || {};
    const sortParams: any = {};

    if (!includeTest) {
      // exclude test companies
      query.isTest = { $ne: true };
    }

    if (!includeRemoved) {
      query.isRemoved = { $ne: true };
    }
    if (!includeUnsubscribed) {
      query["subscription.status"] = {
        $in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
      };
    }
    if (search) {
      query.$or = [
        { $text: { $search: search, $caseSensitive: false } },
        { name: { $regex: escapeRegex(search), $options: "i" } },
      ];
      projection.score = { $meta: "textScore" };
      sortParams.score = { $meta: "textScore" };
    }
    if (sort) {
      const sortDirection = sort.charAt(0) === "-" ? -1 : 1;
      const sortField = sort.replace("-", "");
      sortParams[sortField] = sortDirection;
    }

    const data = await Company.find(query, projection)
      .sort(sortParams)
      .skip(skip)
      .limit(limit);
    const total = await Company.countDocuments(query);

    return { data, total };
  }

  async createCompany(data: Props, user: UserDoc): Promise<CompanyDoc> {
    const company = new Company(data);
    company.createdAt = new Date();
    company.user = user;
    company.emailsForImportHook = [user.email];
    await company.save();
    return company;
  }

  async patchCompany(
    company: CompanyDoc,
    data: Partial<Props>
  ): Promise<CompanyDoc> {
    await company.updateOne(data);
    return company;
  }

  async putAlert(
    company: CompanyDoc,
    title: string,
    body: string
  ): Promise<void> {
    company.alert = {
      title,
      body,
    };
    await company.save();
  }

  async putEmailWebhook(company: CompanyDoc, newEmail: string): Promise<void> {
    if (company.emailsForImportHook) {
      company.emailsForImportHook.push(newEmail);
    } else {
      company.emailsForImportHook = [newEmail];
    }
    await company.save();
  }

  async deleteEmailWebhook(
    company: CompanyDoc,
    emailToDelete: string
  ): Promise<void> {
    await company.update({
      $pull: { emailsForImportHook: emailToDelete },
    });
  }

  async deleteAlert(company: CompanyDoc): Promise<void> {
    company.alert = undefined;
    await company.save();
  }

  async checkCompanyVisit(
    companyId: string,
    fingerprint: string
  ): Promise<void> {
    const query: FilterQuery<CompanyVisitDoc> = {
      company: Types.ObjectId(companyId),
      fingerprint: fingerprint,
      visitDate: {
        $gt: subMinutes(new Date(), 15),
      },
    };

    if ((await CompanyVisit.countDocuments(query)) > 0) {
      throw new ServiceError({
        code: CompanyErrors.CompanyVisitRestricted,
      });
    }
  }

  async switchFingerprint(company: CompanyDoc): Promise<void> {
    if (company.isFingerprintDisable !== undefined) {
      company.isFingerprintDisable = !company.isFingerprintDisable;
      await company.save();
    } else {
      throw new ServiceError({
        code: CompanyErrors.CompanyFingerprintMarkerUndefined,
      });
    }
  }

  async addCompanyVisit(
    companyId: string,
    fingerprint: string,
    fromWidget?: boolean
  ): Promise<void> {
    await this.checkCompanyVisit(companyId, fingerprint);
    const companyVisit = new CompanyVisit();
    companyVisit.company = Types.ObjectId(companyId);
    companyVisit.visitDate = new Date();
    companyVisit.fingerprint = fingerprint;
    if (fromWidget) {
      companyVisit.visitSource = VisitSource.widget;
    }
    await companyVisit.save();
  }

  async getCompanyVisitStat(
    companyId: string,
    dateRangeFrom: Date,
    dateRangeTo: Date
  ): Promise<VisitStatsByDateRange> {
    const widgetVisits = await CompanyVisit.countDocuments({
      company: { $eq: Types.ObjectId(companyId) },
      visitSource: VisitSource.widget,
      visitDate: { $gte: dateRangeFrom, $lte: addDays(dateRangeTo, 1) },
    });

    const siteVisits = await CompanyVisit.countDocuments({
      company: { $eq: Types.ObjectId(companyId) },
      visitSource: VisitSource.site,
      visitDate: { $gte: dateRangeFrom, $lte: addDays(dateRangeTo, 1) },
    });

    return {
      dateRangeFrom,
      dateRangeTo,
      total: widgetVisits + siteVisits,
      site: siteVisits,
      widget: widgetVisits,
    };
  }
}
