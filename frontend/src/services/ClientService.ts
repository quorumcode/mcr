import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { EmailTemplateName } from "@/types/commonTypes";

interface GetClientsForInvitationParams {
  companyId: string;
  skip?: number;
  limit?: number;
  batchId?: string;
}

interface Client {
  id: string;
  name?: string;
  email: string;
}

interface ClientMeta {
  total: string;
  uploadSuccess: string;
  alredyInvited: string;
}

interface InviteParams {
  companyId: string;
  clientsIds: string[];
  emailTemplate: EmailTemplateName;
}

export class ClientService extends BaseService {
  async getClientsForInvitation(
    query: GetClientsForInvitationParams
  ): Promise<{ data: Client[]; meta: ClientMeta[] }> {
    try {
      const result = await this.client.axios.get<{
        data: Client[];
        meta: ClientMeta[];
      }>(`/client/for-invitation`, { params: query });
      return result.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async importCsv(file: File, companyId: string): Promise<string> {
    this.client.axios.defaults.timeout = 30000;
    const formData = new FormData();
    formData.append("csv", file);
    formData.append("companyId", companyId);

    try {
      const result = await this.client.axios.post<{
        createdCount: number;
        importedCount: number;
        updatedCount: number;
        batchId: string;
      }>("/client/import-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return result.data.batchId;
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }

  async invite({
    companyId,
    clientsIds,
    emailTemplate,
  }: InviteParams): Promise<void> {
    this.client.axios.defaults.timeout = 30000;
    try {
      await this.client.axios.post("/client/invite", {
        companyId,
        clientsIds,
        emailTemplate,
      });
    } catch (e) {
      throw createServiceErrorFromError(e);
    } finally {
      this.client.axios.defaults.timeout = 3000;
    }
  }
}
