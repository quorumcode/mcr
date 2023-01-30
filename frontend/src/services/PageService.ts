import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { FromSchema } from "json-schema-to-ts";
import {
  pageGetPagesSchema,
  pageGetPageSchema,
  pageCreatePageSchema,
  pageUpdatePageSchema,
  pageResponseSchema,
} from "@backend/src/schemas/dtoSchemas";
import { Page } from "@/types/commonTypes";

export class PageService extends BaseService {
  async getPages(): Promise<
    Array<Pick<Page, "id" | "name" | "title" | "category">>
  > {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof pageGetPagesSchema.response[200]>
      >("/page");
      return result.data.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getPageById(id: string): Promise<Page> {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof pageGetPageSchema.response[200]>
      >(`/page/${id}`);
      return normalizePageFromResponse(result.data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getPageByName(name: string): Promise<Page> {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof pageGetPageSchema.response[200]>
      >(`/page/${name}`, { params: { by: "name" } });
      return normalizePageFromResponse(result.data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async createPage(
    data: FromSchema<typeof pageCreatePageSchema.body>
  ): Promise<Page> {
    try {
      const result = await this.client.axios.post<
        FromSchema<typeof pageCreatePageSchema.response[200]>
      >("/page", data);
      return normalizePageFromResponse(result.data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async updatePage(
    id: string,
    data: FromSchema<typeof pageUpdatePageSchema.body>
  ): Promise<void> {
    try {
      await this.client.axios.patch<
        FromSchema<typeof pageUpdatePageSchema.response[200]>
      >(`/page/${id}`, data);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async removePage(id: string): Promise<void> {
    try {
      await this.client.axios.delete(`/page/${id}`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async uploadImage(image: unknown): Promise<void> {
    try {
      const jsonImage = JSON.stringify({ image: image });
      const res = await this.client.axios.post(
        `/page/upload-image`,
        jsonImage,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}

function normalizePageFromResponse(
  data: FromSchema<typeof pageResponseSchema>
): Page {
  return {
    ...data,
    body: data.body ? JSON.parse(data.body) : undefined,
  };
}
