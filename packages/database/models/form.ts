import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { relations } from "drizzle-orm";
import { responsesTable } from "./response";

export type VisibilityType = "public" | "unlisted";

export interface FormFieldsType {
  id: string;
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "select"
    | "multi_select"
    | "rating"
    | "date";

  label: string;
  label_slug: string;
  placeholder?: string;
  description?: string;
  isRequired: boolean;
  options?: string[];
  validations?: {
    min?: number;
    max?: number;
    regex?: string;
  };
}

export interface ConditionalLogicRule {
  fieldId: string; // The ID of the field that will change state (e.g., "dietary_restrictions_input")
  dependsOnFieldId: string; // The ID of the field being watched (e.g., "attending_after_party_dropdown")
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: any; // The expected trigger criteria (e.g., "Yes" or 3)
  action: "show" | "hide"; // The UI mutation state to apply when the condition passes
}

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("created_by").references(() => usersTable.id),

  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 300 }),
  slug: varchar("tile", { length: 100 }).notNull(),

  // Settings
  isPublished: boolean("is_published").default(false).notNull(),
  visibility: varchar("visibility").$type<VisibilityType>().default("public"),
  themeId: varchar("theme_id", { length: 50 }).default("default").notNull(),

  // Dynamic Elements
  fields: jsonb("fields").$type<FormFieldsType[]>().notNull().default([]),
  logic: jsonb("logic"),

  // Additional Feature
  accessKey: varchar("access_key"),
  expiresAt: timestamp("expire_at"),
  responseLimit: integer("response_limit"),
  responseCount: integer("response_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// A form belongs to a single creator, and has many responses
export const formsRelations = relations(formsTable, ({ one, many }) => ({
  creator: one(usersTable, { fields: [formsTable.creatorId], references: [usersTable.id] }),
  responses: many(responsesTable),
}));
