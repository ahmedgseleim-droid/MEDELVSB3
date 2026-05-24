import { Router, type IRouter } from "express";
import { db, insertRecordSchema, recordConverter, RECORDS_COLLECTION, META_COLLECTION, COUNTER_DOC, type InsertRecord } from "@workspace/db";
import {
  CreateRecordBody, UpdateRecordBody, GetRecordParams, UpdateRecordParams,
  DeleteRecordParams, GetRecordResponse, UpdateRecordResponse,
  ListRecordsResponse, DeleteRecordResponse, GetRecordStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getNextId(): Promise<number> {
  const counterRef = db.collection(META_COLLECTION).doc(COUNTER_DOC);
  return db.runTransaction(async (txn) => {
    const snap = await txn.get(counterRef);
    const next: number = snap.exists ? (snap.data()!.nextId as number) + 1 : 1;
    txn.set(counterRef, { nextId: next }, { merge: true });
    return next;
  });
}

router.get("/records/stats", async (_req, res): Promise<void> => {
  const snap = await db.collection(RECORDS_COLLECTION).withConverter(recordConverter).get();
  const records = snap.docs.map((d) => d.data());
  res.json(GetRecordStatsResponse.parse({
    total: records.length,
    resolved: records.filter((r) => r.resolved === "Yes").length,
    unresolved: records.filter((r) => r.resolved === "No").length,
    bonebridge: records.filter((r) => (r.implant ?? "").includes("Bone")).length,
    soundbridge: records.filter((r) => (r.implant ?? "").includes("Sound")).length,
  }));
});

router.get("/records", async (_req, res): Promise<void> => {
  const snap = await db.collection(RECORDS_COLLECTION).withConverter(recordConverter).orderBy("id", "asc").get();
  res.json(ListRecordsResponse.parse(snap.docs.map((d) => d.data())));
});

router.post("/records", async (req, res): Promise<void> => {
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const id = await getNextId();
  const data: InsertRecord = insertRecordSchema.parse(parsed.data);
  const record = { ...data, id };
  await db.collection(RECORDS_COLLECTION).doc(String(id)).withConverter(recordConverter).set(record);
  res.status(201).json(GetRecordResponse.parse(record));
});

router.get("/records/:id", async (req, res): Promise<void> => {
  const params = GetRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const snap = await db.collection(RECORDS_COLLECTION).doc(String(params.data.id)).withConverter(recordConverter).get();
  if (!snap.exists) { res.status(404).json({ error: "Record not found" }); return; }
  res.json(GetRecordResponse.parse(snap.data()));
});

router.put("/records/:id", async (req, res): Promise<void> => {
  const params = UpdateRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const docRef = db.collection(RECORDS_COLLECTION).doc(String(params.data.id)).withConverter(recordConverter);
  if (!(await docRef.get()).exists) { res.status(404).json({ error: "Record not found" }); return; }
  const updated = { ...insertRecordSchema.parse(parsed.data), id: params.data.id };
  await docRef.set(updated);
  res.json(UpdateRecordResponse.parse(updated));
});

router.delete("/records/:id", async (req, res): Promise<void> => {
  const params = DeleteRecordParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const docRef = db.collection(RECORDS_COLLECTION).doc(String(params.data.id));
  if (!(await docRef.get()).exists) { res.status(404).json({ error: "Record not found" }); return; }
  await docRef.delete();
  res.json(DeleteRecordResponse.parse({ success: true }));
});

export default router;
