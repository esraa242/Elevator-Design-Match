import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cabinsTable = pgTable("cabins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  style: text("style").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  ceiling: text("ceiling").notNull(),
  wallPanels: text("wall_panels").notNull(),
  handrail: text("handrail").notNull(),
  flooring: text("flooring").notNull(),
  lighting: text("lighting").notNull(),
  capacity: text("capacity").notNull(),
  finish: text("finish").notNull(),
  warranty: text("warranty").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCabinSchema = createInsertSchema(cabinsTable).omit({ id: true, createdAt: true });
export type InsertCabin = z.infer<typeof insertCabinSchema>;
export type Cabin = typeof cabinsTable.$inferSelect;
