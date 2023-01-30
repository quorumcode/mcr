import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { FromSchema } from "json-schema-to-ts";
import {
  billingGetPaymentMethodSchema,
  billingGetPaymentsSchema,
  billingSubscribeSchema,
  billingUpdatePaymentMethodSchema,
} from "@backend/src/schemas/dtoSchemas";
import { Payment } from "@/types/commonTypes";
import { parseISO } from "date-fns";

export class BillingService extends BaseService {
  async updatePaymentMethod(
    body: FromSchema<typeof billingUpdatePaymentMethodSchema.body>
  ): Promise<void> {
    try {
      await this.client.axios.patch("/billing/payment-method", body);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getPaymentMethod(): Promise<
    FromSchema<typeof billingGetPaymentMethodSchema.response[200]> | undefined
  > {
    try {
      this.client.axios.defaults.timeout = 100000;
      const result = await this.client.axios.get("/billing/payment-method");
      return result.data;
    } catch (e) {
      if (e.response?.data?.code === "paymentMethodNotExists") {
        return undefined;
      }
      throw createServiceErrorFromError(e);
    }
  }

  async subscribe(): Promise<{
    subscriptionId: string;
    requiresAction: boolean;
    clientSecret: string;
  }> {
    try {
      const result = await this.client.axios.post<
        FromSchema<typeof billingSubscribeSchema.response[200]>
      >("/billing/subscribe");
      return result.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async resubscribe(): Promise<void> {
    try {
      const result = await this.client.axios.post("/billing/resubscribe");
      return result.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getPayments(params: { limit?: number; skip?: number }): Promise<{
    data: Payment[];
    meta: {
      total: number;
    };
  }> {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof billingGetPaymentsSchema.response[200]>
      >("/billing/payments", { params });

      const data = result.data.data.map((payment) => ({
        ...payment,
        createdAt: parseISO(payment.createdAt),
      }));

      return {
        data,
        meta: {
          total: result.data.meta.total,
        },
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async cancelSubscription(
    companyId: string,
    immediately = false
  ): Promise<void> {
    try {
      await this.client.axios.post("/billing/cancel-subscription", {
        companyId,
        immediately,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}
