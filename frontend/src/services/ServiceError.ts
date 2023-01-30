import { AxiosError } from "axios";

import {
  BillingErrors,
  ClientErrors,
  CompanyErrors,
  PageErrors,
  ReviewErrors,
  UserErrors,
} from "@/types/errors";

interface Params {
  message: string;
  status?: number;
  code?:
    | BillingErrors
    | ClientErrors
    | CompanyErrors
    | PageErrors
    | ReviewErrors
    | UserErrors;
  data: any;
}

export class ServiceError extends Error {
  status: number | undefined;
  initialError: Error | undefined;
  code:
    | BillingErrors
    | ClientErrors
    | CompanyErrors
    | PageErrors
    | ReviewErrors
    | UserErrors
    | string
    | undefined;
  data: any;

  constructor(params: Params, initialError?: Error) {
    super(params.message);
    this.status = params.status;
    this.initialError = initialError;
    this.code = params.code;
    this.data = params.data;
  }
}

export function createServiceErrorFromError(error: AxiosError): ServiceError {
  return new ServiceError(
    {
      status: error.response?.status,
      code: error.response?.data.code,
      message:
        error.response?.data.message ||
        error.response?.data.error ||
        error.message ||
        "Unrecognized error",
      data: error.response?.data,
    },
    error
  );
}
