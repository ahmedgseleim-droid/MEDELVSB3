import { z } from "zod";
import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export const insertRecordSchema = z.object({
  patientName: z.string().default(""),
  dob: z.string().default(""),
  phone: z.string().default(""),
  serial: z.string().default(""),
  implant: z.string().default(""),
  issueDescription: z.string().default(""),
  conditions: z.string().default(""),
  skin: z.array(z.string()).default([]),
  visual: z.array(z.string()).default([]),
  audio: z.array(z.string()).default([]),
  physical: z.array(z.string()).default([]),
  accessory: z.array(z.string()).default([]),
  connectivity: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  resolved: z.string().default(""),
  resolvedHow: z.string().default(""),
  nextAction: z.string().default(""),
  contactName: z.string().default(""),
  contactEmail: z.string().default(""),
});

export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = InsertRecord & { id: number };

export const recordConverter: FirestoreDataConverter<Record> = {
  toFirestore(record: Record) {
    return { ...record };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Record {
    const d = snapshot.data();
    return {
      id: d.id as number,
      patientName: d.patientName ?? "",
      dob: d.dob ?? "",
      phone: d.phone ?? "",
      serial: d.serial ?? "",
      implant: d.implant ?? "",
      issueDescription: d.issueDescription ?? "",
      conditions: d.conditions ?? "",
      skin: d.skin ?? [],
      visual: d.visual ?? [],
      audio: d.audio ?? [],
      physical: d.physical ?? [],
      accessory: d.accessory ?? [],
      connectivity: d.connectivity ?? [],
      steps: d.steps ?? [],
      resolved: d.resolved ?? "",
      resolvedHow: d.resolvedHow ?? "",
      nextAction: d.nextAction ?? "",
      contactName: d.contactName ?? "",
      contactEmail: d.contactEmail ?? "",
    };
  },
};

export const RECORDS_COLLECTION = "records";
export const META_COLLECTION = "meta";
export const COUNTER_DOC = "idCounter";
