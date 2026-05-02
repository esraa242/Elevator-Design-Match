import { pgTable, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { tenantsTable } from "./tenants";
import { cabinsTable } from "./cabins";

export const tenantCabinsTable = pgTable("tenant_cabins", {
  tenantId: integer("tenant_id").references(() => tenantsTable.id, { onDelete: "cascade" }).notNull(),
  cabinId: integer("cabin_id").references(() => cabinsTable.id, { onDelete: "cascade" }).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.tenantId, t.cabinId] })]);

export type TenantCabin = typeof tenantCabinsTable.$inferSelect;
