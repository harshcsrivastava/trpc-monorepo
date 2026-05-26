import { pgTable, uuid, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { formsTable } from "./form";
import { relations } from "drizzle-orm";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .references(() => formsTable.id)
    .notNull(),
  answers: jsonb("answers").$type<Record<string, any>>().notNull(), // Keyed by field ID

  // Metadata for Analytics
  browser: varchar("browser", { length: 50 }),
  os: varchar("os", { length: 50 }),
  country: varchar("country", { length: 100 }),
  durationSeconds: integer("duration_seconds"), // Time spent filling form

  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// A response belongs to a single form
export const responsesRelations = relations(responsesTable, ({ one }) => ({
  form: one(formsTable, { fields: [responsesTable.formId], references: [formsTable.id] }),
}));
