import { PageCategory } from "@/types/common";

export const pageProperties = {
  id: { type: "string" },
  name: { type: "string" },
  title: { type: "string" },
  subtitle: { type: "string" },
  category: {
    type: "string",
    enum: Object.values(PageCategory) as PageCategory[],
  },
  body: { type: "string" },
  withHeaderImage: { type: "boolean" },
} as const;

export const pageRequestSchema = {
  type: "object",
  required: ["name", "title"],
  properties: pageProperties,
} as const;

export const pageResponseSchema = {
  type: "object",
  required: ["id", "name", "title"],
  properties: pageProperties,
} as const;
