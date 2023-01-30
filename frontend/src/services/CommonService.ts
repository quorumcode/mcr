import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { Country } from "@/types/commonTypes";
import { FromSchema } from "json-schema-to-ts";
import { commonGetCountriesSchema } from "@backend/src/schemas/dtoSchemas";

export class CommonService extends BaseService {
  async getCountries(): Promise<Country[]> {
    try {
      const result = await this.client.axios.get<
        FromSchema<typeof commonGetCountriesSchema.response[200]>
      >("/common/country");
      return result.data.data;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}
