import parseISO from "date-fns/parseISO";
import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { Review, ReviewTokenInfo } from "@/types/commonTypes";
import { ReviewErrors } from "@/types/errors";

interface ReviewResponse
  extends Omit<Review, "createdAt" | "reply" | "reportedAt"> {
  createdAt: string;
  reply?: { createdAt: string; message: string };
  reportedAt?: string;
}

interface CreateReviewParams {
  reviewToken: string;
  rate: number;
  message: string;
  name?: string;
  email?: string;
  fingerprint?: string;
}

interface UpdateReviewParams {
  reviewId: string;
  reviewToken: string;
  rate: number;
  message: string;
}

interface CreateReplyParams {
  reviewId: string;
  message: string;
}

interface GetReviewsQuery {
  skip?: number;
  limit?: number;
  sort?: string;
}

interface ReviewTokenInfoResponce {
  data: ReviewTokenInfo;
  code?: ReviewErrors;
}

export class ReviewService extends BaseService {
  async getReviews(
    companyId: string,
    query: GetReviewsQuery = {}
  ): Promise<{ data: Review[]; meta: { total: number } }> {
    try {
      const {
        data: { data, meta },
      } = await this.client.axios.get<{
        data: ReviewResponse[];
        meta: { total: number };
      }>(`/review/`, {
        params: {
          ...query,
          companyId,
        },
      });

      const reviews = data.map((review) => normalizeReview(review));

      return {
        data: reviews,
        meta,
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getReviewById(id: string): Promise<Review> {
    try {
      const {
        data: { data },
      } = await this.client.axios.get<{
        data: ReviewResponse;
      }>(`/review/${id}`, {});
      return normalizeReview(data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async createReview({
    reviewToken,
    rate,
    message,
    name,
    email,
    fingerprint,
  }: CreateReviewParams): Promise<void> {
    this.client.axios.defaults.timeout = 10000;
    try {
      await this.client.axios.post("/review", {
        reviewToken,
        rate,
        message,
        name,
        email,
        fingerprint,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }

  async updateReview({
    reviewId,
    reviewToken,
    rate,
    message,
  }: UpdateReviewParams): Promise<void> {
    this.client.axios.defaults.timeout = 10000;
    try {
      await this.client.axios.patch(`/review/${reviewId}`, {
        reviewToken,
        rate,
        message,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }

  async removeReview(reviewId: string): Promise<void> {
    try {
      await this.client.axios.delete(`/review/${reviewId}`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getTokenInfo(
    reviewToken: string,
    fingerprint?: string
  ): Promise<ReviewTokenInfoResponce> {
    this.client.axios.defaults.timeout = 100000;
    try {
      let url = `/review/token-info/${reviewToken}`;
      if (fingerprint) {
        url = `${url}?fingerprint=${fingerprint}`;
      }
      const result = await this.client.axios.get(url);
      return result.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }

  async createReply({ reviewId, message }: CreateReplyParams): Promise<void> {
    try {
      await this.client.axios.post(`/review/${reviewId}/reply`, {
        message,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getReportedReviews(
    query: {
      skip?: number;
      limit?: number;
    } = {}
  ): Promise<{ data: Review[]; meta: { total: number } }> {
    try {
      const {
        data: { data, meta },
      } = await this.client.axios.get<{
        data: ReviewResponse[];
        meta: { total: number };
      }>(`/review/reported`, {
        params: query,
      });

      const reviews = data.map((review) => normalizeReview(review));

      return {
        data: reviews,
        meta,
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async report(reviewId: string, reportReason: string): Promise<void> {
    try {
      await this.client.axios.post(`/review/${reviewId}/report`, {
        reportReason,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async reportAnonymous(
    reviewId: string,
    reportReason: string,
    visitorId: string
  ): Promise<void> {
    try {
      await this.client.axios.patch(`/review/${reviewId}/anonymous-report`, {
        reportReason,
        fingerprint: visitorId,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async denyReport(reviewId: string): Promise<void> {
    try {
      await this.client.axios.post(`/review/${reviewId}/deny-report`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async exportCsv(companyId: string, companyName: string): Promise<void> {
    try {
      const result = await this.client.axios.get(`/review/export-csv`, {
        responseType: "blob",
        params: { companyId },
      });
      const blob = new Blob([result.data]);
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("download", `Export of ${companyName} Reviews.csv`);
      link.href = href;
      link.click();
    } catch (e) {
      console.error(e);
      throw createServiceErrorFromError(e);
    }
  }

  async getHtmlTemplates(id: string): Promise<void> {
    try {
      return await this.client.axios.get(
        `/review/email-preview?companyId=${id}&emailTemplate=invitation`
      );
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}

export function normalizeReview(data: ReviewResponse): Review {
  return {
    ...data,
    createdAt: parseISO(data.createdAt),
    reportedAt: data.reportedAt ? parseISO(data.reportedAt) : undefined,
    reply: data.reply
      ? {
        message: data.reply.message,
        createdAt: parseISO(data.reply.createdAt),
      }
      : undefined,
  };
}
