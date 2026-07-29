// Shared types for the 360° helmet-camera ingestion module.
// Kept UI-friendly so the same shape can be sent to the client without adapters.

export type DeviceStatus =
  | "Active Capture"
  | "Charging / Idle"
  | "Low Battery Warning"
  | "Offline"
  | "Unpaired";

export type BluetoothStatus = "Connected" | "Disconnected" | "Pairing";

export interface DeviceRecord {
  id: string;                // e.g. "CAM-01"
  model: string;             // e.g. "Insta360 Pro 2 SLAM Edition"
  serialNo: string;
  batteryPercent: number;
  sdCardUsedPercent: number;
  bluetoothStatus: BluetoothStatus;
  assignedWalker: string;    // free-form for now; later -> userId
  assignedFloor: string;
  gpsSlamQuality: number;
  status: DeviceStatus;
  lastSyncTime: string;      // ISO or "n mins ago" (kept for UI parity)
  lastSeenAt: string;        // ISO — authoritative timestamp
  projectId?: string;
  token?: string;            // opaque device token (only returned once at pairing)
  createdAt: string;
  updatedAt: string;
}

export interface PairingCode {
  code: string;              // 6-digit human-readable
  createdAt: string;
  expiresAt: string;
  claimed: boolean;
  deviceId?: string;
}

export type UploadStatus =
  | "initialized"
  | "uploading"
  | "assembling"
  | "completed"
  | "aborted"
  | "failed";

export interface UploadSession {
  uploadId: string;
  deviceId: string;
  projectId?: string;
  filename: string;
  totalBytes: number;
  chunkSize: number;
  totalChunks: number;
  receivedChunks: number[]; // sorted indices
  status: UploadStatus;
  checksumSha256?: string;  // optional client-provided full-file hash
  captureStartedAt?: string;
  captureEndedAt?: string;
  storagePath?: string;     // final assembled path (relative to uploads root)
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface DeviceHeartbeatInput {
  batteryPercent?: number;
  sdCardUsedPercent?: number;
  bluetoothStatus?: BluetoothStatus;
  gpsSlamQuality?: number;
  status?: DeviceStatus;
  assignedFloor?: string;
  assignedWalker?: string;
}
