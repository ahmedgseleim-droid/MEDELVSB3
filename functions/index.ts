import { onRequest } from "firebase-functions/v2/https";
import app from "../artifacts/api-server/src/index.js";

process.env.FIREBASE_FUNCTIONS = "true";

export const api = onRequest(
  { region: "us-central1", timeoutSeconds: 60, memory: "256MiB" },
  app as any
);
