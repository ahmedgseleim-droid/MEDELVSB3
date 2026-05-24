import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recordsTable = pgTable("records", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull().default(""),
  dob: text("dob").notNull().default(""),
  phone: text("phone").notNull().default(""),
  serial: text("serial").notNull().default(""),
  implant: text("implant").notNull().default(""),
  issueDescription: text("issue_description").notNull().default(""),
  conditions: text("conditions").notNull().default(""),
  skin: text("skin").array().notNull().default([]),
  visual: text("visual").array().notNull().default([]),
  audio: text("audio").array().notNull().default([]),
  physical: text("physical").array().notNull().default([]),
  accessory: text("accessory").array().notNull().default([]),
  connectivity: text("connectivity").array().notNull().default([]),
  steps: text("steps").array().notNull().default([]),
  resolved: text("resolved").notNull().default(""),
  resolvedHow: text("resolved_how").notNull().default(""),
  nextAction: text("next_action").notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  submittedBy: text("submitted_by").notNull().default(""),
});

export const insertRecordSchema = createInsertSchema(recordsTable).omit({ id: true });
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof recordsTable.$inferSelect;
