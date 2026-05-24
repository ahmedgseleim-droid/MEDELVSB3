import { z } from "zod";

export const recordSchema = z.object({
  patientName: z.string().min(1, "Required"),
  dob: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  serial: z.string().min(1, "Required"),
  implant: z.string().min(1, "Required"),
  issueDescription: z.string().optional(),
  conditions: z.string().optional(),
  skin: z.array(z.string()).optional(),
  visual: z.array(z.string()).optional(),
  audio: z.array(z.string()).optional(),
  physical: z.array(z.string()).optional(),
  accessory: z.array(z.string()).optional(),
  connectivity: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  resolved: z.string().optional(),
  resolvedHow: z.string().optional(),
  nextAction: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
});

export type RecordFormValues = z.infer<typeof recordSchema>;

export const defaultRecordValues: RecordFormValues = {
  patientName: "",
  dob: "",
  phone: "",
  serial: "",
  implant: "",
  issueDescription: "",
  conditions: "",
  skin: [],
  visual: [],
  audio: [],
  physical: [],
  accessory: [],
  connectivity: [],
  steps: [],
  resolved: "",
  resolvedHow: "",
  nextAction: "",
  contactName: "",
  contactEmail: "",
};
