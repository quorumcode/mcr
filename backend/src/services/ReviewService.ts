import { Review, ReviewDoc, ReviewProps } from "@/models/Review";
import { FilterQuery, Types } from "mongoose";
import { ClientDoc } from "@/models/Client";
import { CompanyDoc } from "@/models/Company";
import { addDays, subDays, subMinutes } from "date-fns";
import { ServiceError } from "./ServiceError";
import { ReviewErrors } from "@/types/errors";

type PopulatedReviewDoc = ReviewDoc & {
  client: ClientDoc;
  company: CompanyDoc;
};

const resendReportLimitInDays = 7;

interface GetReviewsParams {
  companyId: string;
  skip?: number;
  limit?: number;
  sort?: "createdAt" | "-createdAt" | "rate" | "-rate" | "reply" | "-reply";
  withoutReported?: boolean;
  onlyPositive?: boolean;
  withReplys?: boolean;
  createdBefore?: Date;
}

interface GetReviewsQueryParams {
  filterQuery: FilterQuery<ReviewDoc>;
  skip?: number;
  limit?: number;
  sort?: "createdAt" | "-createdAt" | "rate" | "-rate" | "reply" | "-reply";
}

interface FullReviewStats {
  rateAvg: number;
  count: number;
  excellent: number;
  good: number;
  okay: number;
  poor: number;
  terrible: number;
}

interface ReviewSourceStats {
  year: number;
  byBcc: number;
  byBccPercent: number;
  byEmail: number;
  byEmailPercent: number;
  byQr: number;
  byQrPercent: number;
}

interface ReviewSourceStatsByDateRange {
  dateRangeFrom: Date;
  dateRangeTo: Date;
  byBcc: number;
  byBccPercent: number;
  byEmail: number;
  byEmailPercent: number;
  byQr: number;
  byQrPercent: number;
}

const rateAverageLimit = 3;

export class ReviewService {
  async createReview({
    company,
    client,
    rate,
    message,
    source,
  }: Pick<
    ReviewProps,
    "company" | "client" | "rate" | "message" | "source"
  >): Promise<ReviewDoc> {
    const review = new Review({
      company,
      client,
      rate,
      message,
      source,
    });
    review.createdAt = new Date();
    await review.save();
    return review;
  }

  async getReviewById(id: string): Promise<PopulatedReviewDoc | null> {
    const query: FilterQuery<ReviewDoc> = {
      _id: Types.ObjectId(id),
      isRemoved: { $ne: true },
    };

    try {
      return (await Review.findOne(query)
        .populate("client")
        .populate("company")) as PopulatedReviewDoc;
    } catch (e) {
      return null;
    }
  }

  async getReviewByClient(
    clientId: string,
    companyId: string
  ): Promise<PopulatedReviewDoc[] | null> {
    const query: FilterQuery<ReviewDoc> = {
      client: Types.ObjectId(clientId),
      company: Types.ObjectId(companyId),
      isRemoved: { $ne: true },
    };

    try {
      return (await Review.find(query)
        .populate("client")
        .populate("company")) as PopulatedReviewDoc[];
    } catch (e) {
      return null;
    }
  }

  async getReviews({
    companyId,
    skip = 0,
    limit = 100,
    sort = "createdAt",
    withoutReported = false,
    onlyPositive = false,
    withReplys = true,
    createdBefore,
  }: GetReviewsParams): Promise<{
    data: PopulatedReviewDoc[];
    total: number;
  }> {
    const filterQuery: FilterQuery<ReviewDoc> = {
      company: Types.ObjectId(companyId),
      isRemoved: { $ne: true },
    };
    if (withoutReported) {
      filterQuery.reportedAt = { $exists: false };
    }

    if (onlyPositive) {
      filterQuery.rate = { $gte: 3 };
    }
    if (createdBefore) {
      filterQuery.createdAt = {
        $lt: createdBefore,
      };
    }
    const sortParams: any = {};

    if (sort) {
      const sortDirection = sort.charAt(0) === "-" ? -1 : 1;
      const sortField = sort.replace("-", "");
      sortParams[sortField] = sortDirection;
      if (sort == "reply") {
        sortParams["createdAt"] = -1;
      }
    }

    const query = Review.find(filterQuery)
      .populate("client")
      .populate("company")
      .sort(sortParams)
      .skip(skip)
      .limit(limit);

    if (!withReplys) {
      query.select({ reply: false });
    }

    const data = (await query.exec()) as PopulatedReviewDoc[];
    const total = await Review.countDocuments(filterQuery);

    return { data, total };
  }

  async getReportedReviews({
    skip = 0,
    limit = 100,
  }: {
    skip?: number;
    limit?: number;
  }): Promise<{
    data: PopulatedReviewDoc[];
    total: number;
  }> {
    const query: FilterQuery<ReviewDoc> = {
      $or: [
        { reportedAt: { $exists: true } },
        { anonymousReports: { $gt: [] } },
      ],
      isRemoved: { $ne: true },
    };

    const data = (await Review.find(query)
      .populate("client")
      .populate({
        path: "company",
        populate: "user",
      })
      .sort({
        reportedAt: 1,
      })
      .skip(skip)
      .limit(limit)) as PopulatedReviewDoc[];

    //TODO delete when frontend will prepared to anonymous reports
    data.forEach((review) => {
      if (!review.reportedAt && review.anonymousReports) {
        const lastAnonReport =
          review.anonymousReports[review.anonymousReports?.length - 1];
        review.reportedAt = lastAnonReport.reportedAt;
        review.reportReason = lastAnonReport.reportReason;
      }
    });

    const total = await Review.countDocuments(query);

    return { data, total };
  }

  async getReviewsStats(
    companiesIds: string[]
  ): Promise<{ [_id: string]: { rateAvg: number; count: number } }> {
    const aggregation = (await Review.aggregate([
      {
        $match: {
          company: { $in: companiesIds.map((id) => Types.ObjectId(id)) },
          isRemoved: { $ne: true },
          reportedAt: { $exists: false },
        },
      },
      {
        $addFields: {
          rateWeight: {
            $function: {
              body: function (rate: number, createdAt: Date) {
                const reviewAgeTime = Date.now() - createdAt.getTime();
                const months = reviewAgeTime / 1000 / 60 / 60 / 24 / 30;
//                 let k = -1 * 0.005 * months + 1.01;
//                 if (k > 1) {
//                   k = 1;
//                 } else if (k < 0) {
//                   k = 0;
//                 }
                let k = 1; // tmpoverride

                // rateAverageLimit = 3
                return (rate - 3) * k;
              },
              args: ["$rate", "$createdAt"],
              lang: "js",
            },
          },
        },
      },
      {
        $group: {
          _id: "$company",
          rateWeightAvg: { $avg: "$rateWeight" },
          count: { $sum: 1 },
        },
      },
    ])) as Array<{ _id: string; rateWeightAvg: number; count: number }>;

    const stats = aggregation.reduce(
      (result, { _id, count, rateWeightAvg }) => {
        result[_id] = { count, rateAvg: rateAverageLimit + rateWeightAvg };
        return result;
      },
      {} as { [_id: string]: { rateAvg: number; count: number } }
    );

    const emptyStats = companiesIds.reduce((result, id) => {
      if (!stats[id]) {
        result[id] = { count: 0, rateAvg: 0 };
      }
      return result;
    }, {} as { [_id: string]: { rateAvg: number; count: number } });

    return {
      ...stats,
      ...emptyStats,
    };
  }

  async getRecentReview(
    companyId: string,
    clientId: string
  ): Promise<ReviewDoc | null> {
    const query: FilterQuery<ReviewDoc> = {
      company: Types.ObjectId(companyId),
      client: Types.ObjectId(clientId),
      createdAt: {
        $gt: subMinutes(
          new Date(),
          parseInt(process.env.LIMIT_FROM_LAST_INVITATION_IN_MINUTES as string)
        ),
      },
      isRemoved: { $ne: true },
    };

    try {
      return await Review.findOne(query);
    } catch (e) {
      return null;
    }
  }

  async addAnonymousReport(
    review: ReviewDoc,
    reportReason: string,
    fingerprint?: string
  ): Promise<ReviewDoc> {
    const reachAnonymouslimit = review.anonymousReports?.length === 3;
    if (reachAnonymouslimit) {
      review.anonymousReports?.shift();
      review.anonymousReports?.push({
        reportReason: reportReason,
        reportedAt: new Date(),
        fingerprint: fingerprint,
      });
    } else {
      review.anonymousReports?.push({
        reportReason: reportReason,
        reportedAt: new Date(),
        fingerprint: fingerprint,
      });
    }
    await review.save();
    return review;
  }

  async patchAnonymousReport(
    review: ReviewDoc,
    reportReason: string,
    fingerprint?: string
  ): Promise<void> {
    if (fingerprint) {
      const existReview = review.anonymousReports?.find(
        (cur) => cur.fingerprint == fingerprint
      );
      if (existReview) {
        if (
          // @ts-ignore
          existReview.reportedAt > subDays(new Date(), resendReportLimitInDays)
        ) {
          throw new ServiceError({ code: ReviewErrors.ReportSubmissionLimit });
        }
        await Review.updateOne(
          {
            _id: Types.ObjectId(review.id),
            "anonymousReports.fingerprint": { $eq: fingerprint },
          },
          {
            $set: {
              "anonymousReports.$.reportReason": reportReason,
              "anonymousReports.$.reportedAt": new Date(),
            },
          }
        ).exec();
      } else {
        await this.addAnonymousReport(review, reportReason, fingerprint);
      }
    } else {
      await this.addAnonymousReport(review, reportReason, fingerprint);
    }
  }

  async getNotRepliedCount(companyId: string): Promise<number> {
    const query: FilterQuery<ReviewDoc> = {
      company: Types.ObjectId(companyId),
      reply: { $exists: false },
      reportedAt: { $exists: false },
      isRemoved: { $ne: true },
    };

    try {
      return await Review.count(query);
    } catch (e) {
      return 0;
    }
  }

  async getReviewsByQuery({
    filterQuery,
    skip = 0,
    limit = 100,
    sort = "createdAt",
  }: GetReviewsQueryParams): Promise<PopulatedReviewDoc[]> {
    const sortParams: any = {};

    if (sort) {
      const sortDirection = sort.charAt(0) === "-" ? -1 : 1;
      const sortField = sort.replace("-", "");
      sortParams[sortField] = sortDirection;
    }

    const query = Review.find(filterQuery)
      .populate("client")
      .populate("company")
      .sort(sortParams)
      .skip(skip)
      .limit(limit);

    return (await query.exec()) as PopulatedReviewDoc[];
  }

  async getReviewsForDashboard(
    companyId: string,
    limit: number
  ): Promise<PopulatedReviewDoc[]> {
    const filterQuery: FilterQuery<ReviewDoc> = {
      company: Types.ObjectId(companyId),
      isRemoved: { $ne: true },
      reportedAt: { $exists: false },
    };

    const reventReviews = await this.getReviewsByQuery({
      filterQuery,
      limit,
      sort: "-createdAt",
    });

    return reventReviews;
  }

  async getReviewsStatsForDashboard(
    companyId: string
  ): Promise<FullReviewStats> {
    const reviewsStats = await this.getReviewsStats([companyId]);

    const reviewsCount = reviewsStats[companyId].count;

    let excellent = Math.round(
      ((await Review.countDocuments({
        company: { $eq: Types.ObjectId(companyId) },
        rate: 5,
        reportedAt: { $exists: false },
      })) /
        reviewsCount) *
        100
    );

    let good = Math.round(
      ((await Review.countDocuments({
        company: { $eq: Types.ObjectId(companyId) },
        rate: 4,
        reportedAt: { $exists: false },
      })) /
        reviewsCount) *
        100
    );

    let okay = Math.round(
      ((await Review.countDocuments({
        company: { $eq: Types.ObjectId(companyId) },
        rate: 3,
        reportedAt: { $exists: false },
      })) /
        reviewsCount) *
        100
    );

    let poor = Math.round(
      ((await Review.countDocuments({
        company: { $eq: Types.ObjectId(companyId) },
        rate: 2,
        reportedAt: { $exists: false },
      })) /
        reviewsCount) *
        100
    );

    let terrible = Math.round(
      ((await Review.countDocuments({
        company: { $eq: Types.ObjectId(companyId) },
        rate: 1,
        reportedAt: { $exists: false },
      })) /
        reviewsCount) *
        100
    );
    while (excellent + good + okay + poor + terrible > 100) {
      const max = Math.max(excellent, good, okay, poor, terrible);
      switch (max) {
        case excellent: {
          excellent--;
          break;
        }
        case good: {
          good--;
          break;
        }
        case okay: {
          okay--;
          break;
        }
        case poor: {
          poor--;
          break;
        }
        case terrible: {
          terrible--;
          break;
        }
      }
    }

    return {
      ...reviewsStats[companyId],
      excellent,
      good,
      okay,
      poor,
      terrible,
    };
  }

  async getReviewsSources(companyId: string): Promise<ReviewSourceStats[]> {
    const aggregation = (await Review.aggregate([
      {
        $match: {
          company: Types.ObjectId(companyId),
          isRemoved: { $ne: true },
          reportedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
          },
          year: { $first: { $year: "$createdAt" } },
          byBcc: {
            $sum: { $cond: [{ $eq: ["$source", "byBcc"] }, 1, 0] },
          },
          byQr: {
            $sum: { $cond: [{ $eq: ["$source", "byQr"] }, 1, 0] },
          },
          byEmail: {
            $sum: { $cond: [{ $eq: ["$source", "byEmail"] }, 1, 0] },
          },
        },
      },
    ])) as ReviewSourceStats[];

    aggregation.forEach((group) => {
      const groupSum = group.byBcc + group.byEmail + group.byQr;

      group.byBccPercent = Math.round((group.byBcc / groupSum) * 100);
      group.byEmailPercent = Math.round((group.byEmail / groupSum) * 100);
      group.byQrPercent = Math.round((group.byQr / groupSum) * 100);

      while (
        group.byBccPercent + group.byEmailPercent + group.byQrPercent >
        100
      ) {
        const max = Math.max(
          group.byBccPercent,
          group.byEmailPercent,
          group.byQrPercent
        );
        switch (max) {
          case group.byBccPercent: {
            group.byBccPercent--;
            break;
          }
          case group.byEmailPercent: {
            group.byEmailPercent--;
            break;
          }
          case group.byQrPercent: {
            group.byQrPercent--;
            break;
          }
        }
      }
    });

    return aggregation;
  }

  async getReviewsSourcesByDateRange(
    companyId: string,
    dateRangeFrom: Date,
    dateRangeTo: Date
  ): Promise<ReviewSourceStatsByDateRange> {
    const reviewStats = (
      await Review.aggregate([
        {
          $match: {
            company: Types.ObjectId(companyId),
            isRemoved: { $ne: true },
            reportedAt: { $exists: false },
            createdAt: { $gte: dateRangeFrom, $lte: addDays(dateRangeTo, 1) },
          },
        },
        {
          $group: {
            _id: null,
            byBcc: {
              $sum: { $cond: [{ $eq: ["$source", "byBcc"] }, 1, 0] },
            },
            byQr: {
              $sum: { $cond: [{ $eq: ["$source", "byQr"] }, 1, 0] },
            },
            byEmail: {
              $sum: { $cond: [{ $eq: ["$source", "byEmail"] }, 1, 0] },
            },
          },
        },
        {
          $addFields: {
            dateRangeFrom: dateRangeFrom,
            dateRangeTo: dateRangeTo,
          },
        },
      ])
    ).pop() as ReviewSourceStatsByDateRange;

    if (!reviewStats) {
      return {
        dateRangeFrom: dateRangeFrom,
        dateRangeTo: dateRangeTo,
        byBcc: 0,
        byBccPercent: 0,
        byEmail: 0,
        byEmailPercent: 0,
        byQr: 0,
        byQrPercent: 0,
      };
    }

    const groupSum = reviewStats.byBcc + reviewStats.byEmail + reviewStats.byQr;

    reviewStats.byBccPercent = Math.round((reviewStats.byBcc / groupSum) * 100);
    reviewStats.byEmailPercent = Math.round(
      (reviewStats.byEmail / groupSum) * 100
    );
    reviewStats.byQrPercent = Math.round((reviewStats.byQr / groupSum) * 100);

    while (
      reviewStats.byBccPercent +
        reviewStats.byEmailPercent +
        reviewStats.byQrPercent >
      100
    ) {
      const max = Math.max(
        reviewStats.byBccPercent,
        reviewStats.byEmailPercent,
        reviewStats.byQrPercent
      );
      switch (max) {
        case reviewStats.byBccPercent: {
          reviewStats.byBccPercent--;
          break;
        }
        case reviewStats.byEmailPercent: {
          reviewStats.byEmailPercent--;
          break;
        }
        case reviewStats.byQrPercent: {
          reviewStats.byQrPercent--;
          break;
        }
      }
    }

    return reviewStats;
  }
}
