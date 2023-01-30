import parseISO from "date-fns/parseISO";
import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { WidgetData } from "@/types/commonTypes";

interface WidgetDataResponse extends Omit<WidgetData, "reviews"> {
  reviews?: Array<{
    id: string;
    client: {
      name: string;
    };
    createdAt: string;
    rate: number;
    message: string;
  }>;
}

export class WidgetService extends BaseService {
  async getWidgetData(
    companyId: string,
    query: {
      withReviewsStats: boolean;
      reviewsLimit: number;
      withReplys: boolean;
      skip?: number;
    }
  ): Promise<WidgetData> {
    try {
      const result = await this.client.axios.get<{ data: WidgetDataResponse }>(
        `/widget/${companyId}/data`,
        { params: query }
      );
      return normalizeWidgetData(result.data.data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async sendInvite(companyId: string, email: string): Promise<void> {
    try {
      return await this.client.axios.post(`/widget/${companyId}/invite`, {
        email,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}

function normalizeWidgetData(data: WidgetDataResponse): WidgetData {
  if (data.reviews) {
    return {
      ...data,
      reviews: data.reviews.map((review) => ({
        ...review,
        createdAt: parseISO(review.createdAt),
      })),
    };
  }
  // @ts-ignore
  return data;
}
