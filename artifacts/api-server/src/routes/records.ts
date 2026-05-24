import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, recordsTable } from "@workspace/db";
import {
  CreateRecordBody, UpdateRecordBody, GetRecordParams,
  UpdateRecordParams, DeleteRecordParams, GetRecordResponse,
  UpdateRecordResponse, ListRecordsResponse, DeleteRecordResponse,
  GetRecordStatsResponse,
} from "@workspace/api-zod";
import { requireAdmin, type AuthUser } from "../middleware/requireAuth";
import type { Request } from "express";

type AuthRequest = Request & { user: AuthUser };

const router: IRouter = Router();

// Stats — admin only
router.get("/records/stats", requireAdmin, async (req, res): Promise<void> => {
  const records = await db.select().from(recordsTable);
  const total = records.length;
  const resolved = records.filter((r) => r.resolved === "Yes").length;
  const unresolved = records.filter((r) => r.resolved === "No").length;
  const bonebridge = records.filter((r) => (r.implant ?? "").includes("Bone")).length;
  const soundbridge = records.filter((r) => (r.implant ?? "").includes("Sound")).length;
  res.json(GetRecordStatsResponse.parse({ total, resolved, unresolved, bonebridge, soundbridge }));
});

// List records — admin sees all, staff sees own
router.get("/records", async (req, res): Promise<void> => {
  const user = (req as AuthRequest).user;
  const all = await db.select().from(recordsTable);
  const records = user.role === "admin"
    ? all
    : all.filter((r) => r.submittedBy === user.username);
  res.json(ListRecordsResponse.parse(records));
});

// Create record — sets submittedBy from token
router.post("/records", async (req, res): Promise<void> => {
  const user = (req as AuthRequest).user;
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid record body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db.insert(recordsTable).values({
    patientName: parsed.data.patientName ?? "",
    dob: parsed.data.dob ?? "",
    phone: parsed.data.phone ?? "",
    serial: parsed.data.serial ?? "",
    implant: parsed.data.implant ?? "",
    issueDescription: parsed.data.issueDescription ?? "",
    conditions: parsed.data.conditions ?? "",
    skin: parsed.data.skin ?? [],
    visual: parsed.data.visual ?? [],
    audio: parsed.data.audio ?? [],
    physical: parsed.data.physical ?? [],
    accessory: parsed.data.accessory ?? [],
    connectivity: parsed.data.connectivity ?? [],
    steps: parsed.data.steps ?? [],
    resolved: parsed.data.resolved ?? "",
    resolvedHow: parsed.data.resolvedHow ?? "",
    nextAction: parsed.data.nextAction ?? "",
    contactName: parsed.data.contactName ?? "",
    contactEmail: parsed.data.contactEmail ?? "",
    submittedBy: user.username,
  }).returning();

  res.status(201).json(GetRecordResponse.parse(record));
});

// Get single record
router.get("/records/:id", async (req, res): Promise<void> => {
  const user = (req as AuthRequest).user;
  const params = GetRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [record] = await db.select().from(recordsTable).where(eq(recordsTable.id, params.data.id));
  if (!record) { res.status(404).json({ error: "Record not found" }); return; }

  // Staff can only access own records
  if (user.role === "staff" && record.submittedBy !== user.username) {
    res.status(403).json({ error: "Access denied" }); return;
  }

  res.json(GetRecordResponse.parse(record));
});

// Update record — staff can only update own records
router.put("/records/:id", async (req, res): Promise<void> => {
  const user = (req as AuthRequest).user;
  const params = UpdateRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid record update body");
    res.status(400).json({ error: parsed.error.message }); return;
  }

  // Check ownership for staff
  if (user.role === "staff") {
    const [existing] = await db.select().from(recordsTable).where(eq(recordsTable.id, params.data.id));
    if (!existing || existing.submittedBy !== user.username) {
      res.status(403).json({ error: "Access denied" }); return;
    }
  }

  const [record] = await db.update(recordsTable).set({
    patientName: parsed.data.patientName ?? "",
    dob: parsed.data.dob ?? "",
    phone: parsed.data.phone ?? "",
    serial: parsed.data.serial ?? "",
    implant: parsed.data.implant ?? "",
    issueDescription: parsed.data.issueDescription ?? "",
    conditions: parsed.data.conditions ?? "",
    skin: parsed.data.skin ?? [],
    visual: parsed.data.visual ?? [],
    audio: parsed.data.audio ?? [],
    physical: parsed.data.physical ?? [],
    accessory: parsed.data.accessory ?? [],
    connectivity: parsed.data.connectivity ?? [],
    steps: parsed.data.steps ?? [],
    resolved: parsed.data.resolved ?? "",
    resolvedHow: parsed.data.resolvedHow ?? "",
    nextAction: parsed.data.nextAction ?? "",
    contactName: parsed.data.contactName ?? "",
    contactEmail: parsed.data.contactEmail ?? "",
  }).where(eq(recordsTable.id, params.data.id)).returning();

  if (!record) { res.status(404).json({ error: "Record not found" }); return; }
  res.json(UpdateRecordResponse.parse(record));
});

// Delete — admin only
router.delete("/records/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [record] = await db.delete(recordsTable).where(eq(recordsTable.id, params.data.id)).returning();
  if (!record) { res.status(404).json({ error: "Record not found" }); return; }

  res.json(DeleteRecordResponse.parse({ success: true }));
});

export default router;
