// REST client for the 360° helmet-camera device registry.

export interface DeviceRecord {
  id: string;
  model: string;
  serialNo: string;
  batteryPercent: number;
  sdCardUsedPercent: number;
  bluetoothStatus: "Connected" | "Disconnected" | "Pairing";
  assignedWalker: string;
  assignedFloor: string;
  gpsSlamQuality: number;
  status:
    | "Active Capture"
    | "Charging / Idle"
    | "Low Battery Warning"
    | "Offline"
    | "Unpaired";
  lastSyncTime: string;
  lastSeenAt: string;
  projectId?: string;
}

export interface PairingCodeResponse {
  code: string;
  expiresAt: string;
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return (await res.json()) as T;
}

export const deviceApi = {
  list: () => req<{ devices: DeviceRecord[] }>("/api/devices").then((r) => r.devices),
  get: (id: string) => req<{ device: DeviceRecord }>(`/api/devices/${id}`).then((r) => r.device),
  update: (id: string, patch: Partial<Pick<DeviceRecord, "assignedWalker" | "assignedFloor" | "projectId">>) =>
    req<{ device: DeviceRecord }>(`/api/devices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.device),
  createPairing: () => req<PairingCodeResponse>("/api/devices/pair", { method: "POST" }),
};
