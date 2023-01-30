export const userName = {
  type: "string",
  maxLength: 128,
} as const;

export const email = {
  type: "string",
  format: "email",
  maxLength: 128,
} as const;

export const password = {
  type: "string",
  minLength: 8,
  maxLength: 128,
} as const;

export const companyName = {
  type: "string",
  maxLength: 128,
} as const;

export const review = {
  type: "object",
  required: ["id", "company", "client", "createdAt", "rate"],
  properties: {
    id: { type: "string" },
    company: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        user: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
        },
      },
    },
    client: {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    },
    createdAt: { type: "string" },
    rate: { type: "number" },
    message: { type: "string" },
    reply: {
      type: "object",
      required: ["createdAt", "message"],
      properties: {
        createdAt: { type: "string" },
        message: { type: "string" },
      },
    },
    reportedAt: { type: "string" },
    reportReason: { type: "string" },
    isAnonymousOnlyReported: { type: "boolean" },
    anonymousReports: {
      type: "array",
      properties: {
        reportedAt: { type: "string" },
        reportReason: { type: "string" },
        fingerprint: { type: "string" },
      },
    },
  },
} as const;
