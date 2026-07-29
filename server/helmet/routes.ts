// Express router for the 360° helmet-camera ingestion module.
//
// Device registry:
//   GET    /api/devices                 → list
//   GET    /api/devices/:id             → detail
//   PATCH  /api/devices/:id             → assign walker / floor / project
//   POST   /api/devices/pair            → issue pairing code
//   POST   /api/devices/pair/complete   → device claims code, receives token
//   POST   /api/devices/:id/heartbeat   → device pushes telemetry
//
// Chunked upload:
//   POST   /api/uploads/init            → open session, returns uploadId + chunk plan
//   POST   /api/uploads/:uploadId/chunk → upload one chunk (multipart, field "chunk", header X-Chunk-Index)
//   POST   /api/uploads/:uploadId/complete → assemble + verify checksum
//   GET    /api/uploads/:uploadId       → resume state
//   GET    /api/uploads?deviceId=…      → list sessions
//   DELETE /api/uploads/:uploadId       → abort

import { Router, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as store from "./store";

const router = Router();

// Multer streams each chunk to disk under .uploads/chunks/<uploadId>/<index>.part
const chunkUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const { uploadId } = req.params as { uploadId: string };
      const dir = store.chunkDir(uploadId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, _file, cb) => {
      const idx = Number(req.header("x-chunk-index"));
      if (!Number.isInteger(idx) || idx < 0) return cb(new Error("Missing/invalid X-Chunk-Index"), "");
      cb(null, `${idx}.part`);
    },
  }),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32 MB per chunk max
});

// ---------- Devices --------------------------------------------------------

router.get("/api/devices", (_req, res) => {
  res.json({ devices: store.listDevices() });
});

router.get("/api/devices/:id", (req, res) => {
  const d = store.getDevice(req.params.id);
  if (!d) return res.status(404).json({ error: "Device not found" });
  res.json({ device: d });
});

router.patch("/api/devices/:id", (req, res) => {
  const { assignedWalker, assignedFloor, projectId } = req.body ?? {};
  const patch: Record<string, unknown> = {};
  if (typeof assignedWalker === "string") patch.assignedWalker = assignedWalker;
  if (typeof assignedFloor === "string") patch.assignedFloor = assignedFloor;
  if (typeof projectId === "string") patch.projectId = projectId;
  const d = store.updateDevice(req.params.id, patch);
  if (!d) return res.status(404).json({ error: "Device not found" });
  res.json({ device: d });
});

router.post("/api/devices/pair", (_req, res) => {
  const p = store.createPairing();
  res.json({ code: p.code, expiresAt: p.expiresAt });
});

router.post("/api/devices/pair/complete", (req, res) => {
  const { code, model, serialNo } = req.body ?? {};
  if (typeof code !== "string" || typeof model !== "string" || typeof serialNo !== "string") {
    return res.status(400).json({ error: "code, model, serialNo required" });
  }
  const result = store.claimPairing(code, { model, serialNo });
  if ("error" in result) return res.status(400).json(result);
  res.json({ device: result.device, token: result.token });
});

router.post("/api/devices/:id/heartbeat", (req, res) => {
  const authed = requireDeviceToken(req, req.params.id);
  if (!authed) return res.status(401).json({ error: "Invalid or missing device token" });
  const d = store.heartbeat(req.params.id, req.body ?? {});
  if (!d) return res.status(404).json({ error: "Device not found" });
  res.json({ device: d });
});

function requireDeviceToken(req: Request, expectedDeviceId: string): boolean {
  const token = (req.header("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const d = store.findDeviceByToken(token);
  return !!d && d.id === expectedDeviceId;
}

// ---------- Uploads --------------------------------------------------------

router.post("/api/uploads/init", (req, res) => {
  const {
    deviceId,
    filename,
    totalBytes,
    chunkSize,
    projectId,
    checksumSha256,
    captureStartedAt,
    captureEndedAt,
  } = req.body ?? {};
  if (
    typeof deviceId !== "string" ||
    typeof filename !== "string" ||
    typeof totalBytes !== "number" ||
    typeof chunkSize !== "number"
  ) {
    return res.status(400).json({ error: "deviceId, filename, totalBytes, chunkSize required" });
  }
  const device = store.getDevice(deviceId);
  if (!device) return res.status(404).json({ error: "Device not found" });
  try {
    const session = store.createUpload({
      deviceId, filename, totalBytes, chunkSize,
      projectId, checksumSha256, captureStartedAt, captureEndedAt,
    });
    res.json({ session });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "createUpload failed" });
  }
});

router.post(
  "/api/uploads/:uploadId/chunk",
  chunkUpload.single("chunk"),
  (req, res) => {
    const { uploadId } = req.params;
    const session = store.getUpload(uploadId);
    if (!session) return res.status(404).json({ error: "Upload not found" });
    if (session.status === "completed" || session.status === "aborted") {
      return res.status(409).json({ error: `Upload ${session.status}` });
    }
    const idx = Number(req.header("x-chunk-index"));
    if (!Number.isInteger(idx) || idx < 0 || idx >= session.totalChunks) {
      return res.status(400).json({ error: "Invalid X-Chunk-Index" });
    }
    if (!req.file) return res.status(400).json({ error: "Missing chunk file (field 'chunk')" });
    const updated = store.recordChunk(uploadId, idx);
    res.json({
      session: updated,
      receivedIndex: idx,
      progress: updated ? updated.receivedChunks.length / updated.totalChunks : 0,
    });
  }
);

router.post("/api/uploads/:uploadId/complete", async (req, res) => {
  const { uploadId } = req.params;
  const session = store.getUpload(uploadId);
  if (!session) return res.status(404).json({ error: "Upload not found" });
  if (session.status === "completed") return res.json({ session });

  const missing: number[] = [];
  for (let i = 0; i < session.totalChunks; i++) {
    if (!session.receivedChunks.includes(i)) missing.push(i);
  }
  if (missing.length) {
    return res.status(409).json({ error: "Missing chunks", missing });
  }

  const target = store.assembledPathFor(session.deviceId, session.uploadId, session.filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  store.updateUpload(uploadId, { status: "assembling" });

  try {
    const out = fs.createWriteStream(target);
    const hash = crypto.createHash("sha256");
    for (let i = 0; i < session.totalChunks; i++) {
      const partPath = path.join(store.chunkDir(uploadId), `${i}.part`);
      const buf = fs.readFileSync(partPath);
      hash.update(buf);
      out.write(buf);
    }
    await new Promise<void>((resolve, reject) => out.end((err?: unknown) => (err ? reject(err) : resolve())));
    const sha = hash.digest("hex");
    if (session.checksumSha256 && session.checksumSha256.toLowerCase() !== sha.toLowerCase()) {
      store.updateUpload(uploadId, { status: "failed", error: "Checksum mismatch" });
      return res.status(422).json({ error: "Checksum mismatch", expected: session.checksumSha256, actual: sha });
    }
    // Clean up part files after successful assembly.
    try { fs.rmSync(store.chunkDir(uploadId), { recursive: true, force: true }); } catch { /* ignore */ }

    const finalized = store.updateUpload(uploadId, {
      status: "completed",
      storagePath: path.relative(process.cwd(), target),
      checksumSha256: sha,
    });
    res.json({ session: finalized });
  } catch (e: any) {
    store.updateUpload(uploadId, { status: "failed", error: e?.message || "assemble failed" });
    res.status(500).json({ error: e?.message || "assemble failed" });
  }
});

router.get("/api/uploads/:uploadId", (req, res) => {
  const s = store.getUpload(req.params.uploadId);
  if (!s) return res.status(404).json({ error: "Upload not found" });
  res.json({ session: s });
});

router.get("/api/uploads", (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  res.json({ uploads: store.listUploads(deviceId) });
});

router.delete("/api/uploads/:uploadId", (req, res) => {
  const s = store.getUpload(req.params.uploadId);
  if (!s) return res.status(404).json({ error: "Upload not found" });
  store.updateUpload(req.params.uploadId, { status: "aborted" });
  try { fs.rmSync(store.chunkDir(req.params.uploadId), { recursive: true, force: true }); } catch { /* ignore */ }
  res.json({ ok: true });
});

export default router;
