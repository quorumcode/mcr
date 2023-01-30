import { FromSchema } from "json-schema-to-ts";
import parseISO from "date-fns/parseISO";
import { companyResponseSchema } from "@backend/src/schemas/dtoSchemas";
import { Company } from "@/types/commonTypes";

type CompanyDto = FromSchema<typeof companyResponseSchema>;

export function normalizeCompanyFromResponse(data: CompanyDto): Company {
  return {
    ...data,
    subscription: data.subscription
      ? {
          ...data.subscription,
          periodStartAt: parseISO(data.subscription.periodStartAt),
          periodEndAt: parseISO(data.subscription.periodEndAt),
          willBeCanceledAt: data.subscription.willBeCanceledAt
            ? parseISO(data.subscription.willBeCanceledAt)
            : undefined,
        }
      : undefined,
  };
}
