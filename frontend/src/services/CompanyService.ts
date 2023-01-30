import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { Company, VisitCompanyData } from "@/types/commonTypes";
import {
  companyGetByIdSchema,
  companyGetSchema,
} from "@backend/src/schemas/dtoSchemas";
import { FromSchema } from "json-schema-to-ts";
import { normalizeCompanyFromResponse } from "@/helpers/normalizeCompanyFromResponse";

interface GetCategoriesResponse {
  data: string[];
}

interface GetCompaniesQuery {
  search?: string;
  skip?: number;
  limit?: number;
  sort?: string;
  fields?: string[];
}

export class CompanyService extends BaseService {
  async getCategories(): Promise<string[]> {
    try {
      const result = await this.client.axios.get<GetCategoriesResponse>(
        "/company/category"
      );
      return result.data.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getCompany(id: string): Promise<Company> {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof companyGetByIdSchema["response"]["200"]>
      >(`/company/${id}`);
      return normalizeCompanyFromResponse(result.data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getCompanies(
    query: GetCompaniesQuery
  ): Promise<{ data: Company[]; meta: { total: number } }> {
    try {
      const {
        data: { data, meta },
      } = await this.client.axios.get<
        FromSchema<typeof companyGetSchema["response"]["200"]>
      >(`/company`, { params: query });

      const companies = data.map((company) =>
        normalizeCompanyFromResponse(company)
      );

      return {
        data: companies,
        meta,
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async createCompany(params: Omit<Company, "_id">): Promise<void> {
    try {
      await this.client.axios.post("/company", params);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async patchCompany(id: string, params: Partial<Company>): Promise<void> {
    this.client.axios.defaults.timeout = 10000;
    try {
      await this.client.axios.patch(`/company/${id}`, params);
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }

  async removeCompany(id: string): Promise<void> {
    try {
      await this.client.axios.post(`/company/${id}/remove`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async restoreCompany(id: string): Promise<void> {
    try {
      await this.client.axios.post(`/company/${id}/restore`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async generateReviewToken(id: string): Promise<void> {
    try {
      await this.client.axios.post(`/company/${id}/generate-review-token`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getDashboardStats(params = {}): Promise<void> {
    try {
      return await this.client.axios.get("/company/dashboard-stats", { params });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getReviewStats(companyId: string): Promise<FullReviewStats> {
    try {
      const res = await this.client.axios.get(
        `/company/${companyId}/review-stats`
      );
      return res.data.reviewStats;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getReviewSourceStats(params = {}): Promise<void> {
    try {
      return await this.client.axios.get("/company/review-source-stats", { params });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getVisitStats(params = {}): Promise<void> {
    try {
      return await this.client.axios.get("/company/visit-stats", { params });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async addEmailForBcc(companyId: string, bccEmail: string): Promise<void> {
    try {
      await this.client.axios.put(`/company/${companyId}/email-for-bcc`, {
        bccEmail,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async deleteEmailForBcc(companyId: string, bccEmail: string): Promise<void> {
    try {
      await this.client.axios.delete(`/company/${companyId}/email-for-bcc`, {
        data: { bccEmail },
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async companyVisit(visitCompanyData: VisitCompanyData): Promise<void> {
    try {
      await this.client.axios.post("company/visit", visitCompanyData);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async putCompanyAlert(companyId: string, alert: any) {
    try {
      await this.client.axios.put(`company/${companyId}/alert`, alert);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async deleteCompanyAlert(companyId: string) {
    try {
      await this.client.axios.delete(`company/${companyId}/alert`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async convertToTest(companyId: string) {
    try {
      await this.client.axios.post("company/convert-to-test", { companyId });
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getCompanyOwner(companyId: string) {
    try {
      const result = await this.client.axios.get(`/company/${companyId}/owner`);
      return result.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}
