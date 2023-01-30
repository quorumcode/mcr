/**
 * This file is used by the frontend
 * Example:
 * import { companyGetByIdSchema } from "@backend/src/schemas/dtoSchemas";
 * ...
 * await this.client.axios.get<
 *   FromSchema<typeof companyGetByIdSchema["response"]["200"]>
 * >
 */

export { companyResponseSchema } from "./company";

export { schema as companyGetSchema } from "@/routes/company/routeOfGetCompanies";
export { schema as companyGetByIdSchema } from "@/routes/company/routeOfGetCompanyById";
export { schema as commonGetCountriesSchema } from "@/routes/common/routeOfGetCountries";

export { schema as billingUpdatePaymentMethodSchema } from "@/routes/billing/routeOfUpdatePaymentMethod";
export { schema as billingGetPaymentMethodSchema } from "@/routes/billing/routeOfGetPaymentMethod";
export { schema as billingSubscribeSchema } from "@/routes/billing/routeOfSubscribe";
export { schema as billingGetPaymentsSchema } from "@/routes/billing/routeOfGetPayments";

export { pageResponseSchema } from "./page";
export { schema as pageGetPagesSchema } from "@/routes/page/routeOfGetPages";
export { schema as pageGetPageSchema } from "@/routes/page/routeOfGetPage";
export { schema as pageCreatePageSchema } from "@/routes/page/routeOfCreatePage";
export { schema as pageUpdatePageSchema } from "@/routes/page/routeOfUpdatePage";
