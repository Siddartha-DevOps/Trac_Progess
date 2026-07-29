// JSON-file-backed store for the helmet-ingestion MVP.
// Encapsulates all persistence behind a single API so swapping to
// Prisma/Postgres later is a single-file change.
//
// Files:
//   data/helmet/devices.json     — DeviceRecord[]
//   data/helmet/pairings.json    — PairingCode[]
//   data/helmet/uploads.json     — UploadSession[]

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  DeviceRecord,
  PairingCode,
  UploadSession,
  DeviceHeartbeatInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "helmet");
const DEVICES_FILE = path.join(DATA_DIR, "devices.json");
const PAIRINGS_FILE = path.join(DATA_DIR, "pairings.json");
const UPLOADS_FILE = path.join(DATA_DIR, "uploads.json");

export const UPLOADS_ROOT = path.join(process.cwd(), ".uploads");

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, "utf-8");
    return raw.trim() ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(file: string, data: T) {
  ensureDirs();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, file);
}

function now() {
  return new Date().toISOString();
}

function shortId(prefix: string, n = 6) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, n)}`;
}

// ---------- Seeding ---------------------------------------------------------
// Seed the four demo cameras from the existing UI so the fleet grid is not
// empty on first boot. If devices.json already exists this is a no-op.
const SEED: DeviceRecord[] = [
  {
    id: "CAM-01", model: "Insta360 Pro 2 SLAM Edition", serialNo: "IN360-8841-A",
    batteryPercent: 88, sdCardUsedPercent: 42, bluetoothStatus: "Connected",
    assignedWalker: "Dave Miller (Site Superintendent)",
    assignedFloor: "Floor 3 East Wing",
    gpsSlamQuality: 99.4, status: "Active Capture", lastSyncTime: "2 mins ago",
    lastSeenAt: now(), createdAt: now(), updatedAt: now(),
  },
  {
    id: "CAM-02", model: "Insta360 Pro 2 SLAM Edition", serialNo: "IN360-8841-B",
    batteryPercent: 64, sdCardUsedPercent: 78, bluetoothStatus: "Connected",
    assignedWalker: "Alex Rivera (Field Engineer)",
    assignedFloor: "Floor 2 Mechanical Room",
    gpsSlamQuality: 98.1, status: "Active Capture", lastSyncTime: "5 mins ago",
    lastSeenAt: now(), createdAt: now(), updatedAt: now(),
  },
  {
    id: "CAM-03", model: "GoPro MAX 360 Enterprise", serialNo: "GP360-1120-X",
    batteryPercent: 18, sdCardUsedPercent: 91, bluetoothStatus: "Connected",
    assignedWalker: "Carlos Santos (Quality Inspector)",
    assignedFloor: "Floor 4 Exterior West Facade",
    gpsSlamQuality: 92.5, status: "Low Battery Warning", lastSyncTime: "1 min ago",
    lastSeenAt: now(), createdAt: now(), updatedAt: now(),
  },
  {
    id: "CAM-04", model: "Insta360 Pro 2 SLAM Edition", serialNo: "IN360-8841-C",
    batteryPercent: 100, sdCardUsedPercent: 12, bluetoothStatus: "Disconnected",
    assignedWalker: "Unassigned (Docking Station)",
    assignedFloor: "Site Office Dock #2",
    gpsSlamQuality: 100, status: "Charging / Idle", lastSyncTime: "30 mins ago",
    lastSeenAt: now(), createdAt: now(), updatedAt: now(),
  },
];

ensureDirs();
if (!fs.existsSync(DEVICES_FILE)) writeJson(DEVICES_FILE, SEED);
if (!fs.existsSync(PAIRINGS_FILE)) writeJson(PAIRINGS_FILE, []);
if (!fs.existsSync(UPLOADS_FILE)) writeJson(UPLOADS_FILE, []);

// ---------- Devices ---------------------------------------------------------

export function listDevices(): DeviceRecord[] {
  const list = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  // Never leak the device token in list responses.
  return list.map(({ token, ...rest }) => rest as DeviceRecord);
}

export function getDevice(id: string): DeviceRecord | null {
  const list = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  const d = list.find((x) => x.id === id);
  if (!d) return null;
  const { token, ...safe } = d;
  return safe as DeviceRecord;
}

export function findDeviceByToken(token: string): DeviceRecord | null {
  const list = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  return list.find((x) => x.token === token) ?? null;
}

export function updateDevice(id: string, patch: Partial<DeviceRecord>): DeviceRecord | null {
  const list = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const merged: DeviceRecord = { ...list[idx], ...patch, id, updatedAt: now() };
  list[idx] = merged;
  writeJson(DEVICES_FILE, list);
  const { token, ...safe } = merged;
  return safe as DeviceRecord;
}

export function heartbeat(id: string, input: DeviceHeartbeatInput): DeviceRecord | null {
  const list = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    ...input,
    lastSeenAt: now(),
    lastSyncTime: "just now",
    updatedAt: now(),
  };
  writeJson(DEVICES_FILE, list);
  const { token, ...safe } = list[idx];
  return safe as DeviceRecord;
}

// ---------- Pairing --------------------------------------------------------
// Flow:
//   1) UI calls POST /api/devices/pair → server issues a 6-digit code (10 min TTL).
//   2) Device SDK calls POST /api/devices/pair/complete with that code and its
//      hardware descriptor → server creates a DeviceRecord and returns a token.

export function createPairing(): PairingCode {
  const list = readJson<PairingCode[]>(PAIRINGS_FILE, []);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const createdAt = now();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const p: PairingCode = { code, createdAt, expiresAt, claimed: false };
  list.push(p);
  writeJson(PAIRINGS_FILE, list);
  return p;
}

export function claimPairing(
  code: string,
  deviceDescriptor: { model: string; serialNo: string }
): { device: DeviceRecord; token: string } | { error: string } {
  const list = readJson<PairingCode[]>(PAIRINGS_FILE, []);
  const idx = list.findIndex((x) => x.code === code);
  if (idx < 0) return { error: "Unknown pairing code" };
  const p = list[idx];
  if (p.claimed) return { error: "Pairing code already claimed" };
  if (new Date(p.expiresAt).getTime() < Date.now()) return { error: "Pairing code expired" };

  const devices = readJson<DeviceRecord[]>(DEVICES_FILE, []);
  const nextIndex = devices.length + 1;
  const deviceId = `CAM-${String(nextIndex).padStart(2, "0")}`;
  const token = crypto.randomBytes(24).toString("hex");
  const device: DeviceRecord = {
    id: deviceId,
    model: deviceDescriptor.model,
    serialNo: deviceDescriptor.serialNo,
    batteryPercent: 100,
    sdCardUsedPercent: 0,
    bluetoothStatus: "Connected",
    assignedWalker: "Unassigned",
    assignedFloor: "Unassigned",
    gpsSlamQuality: 0,
    status: "Charging / Idle",
    lastSyncTime: "just paired",
    lastSeenAt: now(),
    token,
    createdAt: now(),
    updatedAt: now(),
  };
  devices.push(device);
  writeJson(DEVICES_FILE, devices);

  list[idx] = { ...p, claimed: true, deviceId };
  writeJson(PAIRINGS_FILE, list);

  const { token: _t, ...safe } = device;
  return { device: safe as DeviceRecord, token };
}

// ---------- Uploads --------------------------------------------------------

export function chunkDir(uploadId: string) {
  return path.join(UPLOADS_ROOT, "chunks", uploadId);
}

export function assembledPathFor(deviceId: string, uploadId: string, filename: string) {
  const safeName = filename.replace(/[^\w.\-]+/g, "_");
  return path.join(UPLOADS_ROOT, "captures", deviceId, `${uploadId}__${safeName}`);
}

export function createUpload(input: {
  deviceId: string;
  filename: string;
  totalBytes: number;
  chunkSize: number;
  projectId?: string;
  checksumSha256?: string;
  captureStartedAt?: string;
  captureEndedAt?: string;
}): UploadSession {
  if (input.totalBytes <= 0 || input.chunkSize <= 0) {
    throw new Error("totalBytes and chunkSize must be positive");
  }
  const list = readJson<UploadSession[]>(UPLOADS_FILE, []);
  const uploadId = shortId("UP");
  const totalChunks = Math.ceil(input.totalBytes / input.chunkSize);
  const session: UploadSession = {
    uploadId,
    deviceId: input.deviceId,
    projectId: input.projectId,
    filename: input.filename,
    totalBytes: input.totalBytes,
    chunkSize: input.chunkSize,
    totalChunks,
    receivedChunks: [],
    status: "initialized",
    checksumSha256: input.checksumSha256,
    captureStartedAt: input.captureStartedAt,
    captureEndedAt: input.captureEndedAt,
    createdAt: now(),
    updatedAt: now(),
  };
  list.push(session);
  writeJson(UPLOADS_FILE, list);
  fs.mkdirSync(chunkDir(uploadId), { recursive: true });
  return session;
}

export function getUpload(uploadId: string): UploadSession | null {
  const list = readJson<UploadSession[]>(UPLOADS_FILE, []);
  return list.find((x) => x.uploadId === uploadId) ?? null;
}

export function listUploads(deviceId?: string): UploadSession[] {
  const list = readJson<UploadSession[]>(UPLOADS_FILE, []);
  return deviceId ? list.filter((x) => x.deviceId === deviceId) : list;
}

export function recordChunk(uploadId: string, index: number): UploadSession | null {
  const list = readJson<UploadSession[]>(UPLOADS_FILE, []);
  const idx = list.findIndex((x) => x.uploadId === uploadId);
  if (idx < 0) return null;
  const s = list[idx];
  if (!s.receivedChunks.includes(index)) {
    s.receivedChunks = [...s.receivedChunks, index].sort((a, b) => a - b);
  }
  s.status = "uploading";
  s.updatedAt = now();
  list[idx] = s;
  writeJson(UPLOADS_FILE, list);
  return s;
}

export function updateUpload(uploadId: string, patch: Partial<UploadSession>): UploadSession | null {
  const list = readJson<UploadSession[]>(UPLOADS_FILE, []);
  const idx = list.findIndex((x) => x.uploadId === uploadId);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: now() };
  writeJson(UPLOADS_FILE, list);
  return list[idx];
}
