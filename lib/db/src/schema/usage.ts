import { pgTable, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tenantsTable } from "./tenants";

export const usageTable = pgTable("usage", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  tenantId: integer("tenant_id").references(() => tenantsTable.id, { onDelete: "cascade" }).notNull(),
  month: text("month").notNull(),
  requestsCount: integer("requests_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique().on(t.tenantId, t.month)]);

export const insertUsageSchema = createInsertSchema(usageTable).omit({ updatedAt: true });
export type InsertUsage = z.infer<typeof insertUsageSchema>;
export type Usage = typeof usageTable.$inferSelect;
