import { useCallback, useEffect, useRef, useState } from "react";
import { deviceApi, type DeviceRecord } from "../services/deviceApi";

interface UseDevicesResult {
  devices: DeviceRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Fetches the device fleet from /api/devices and auto-refreshes every
// `pollMs` (default 10s) to match the "Auto-refresh every 10s" hint in the UI.
export function useDevices(pollMs = 10_000): UseDevicesResult {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const list = await deviceApi.list();
      if (!alive.current) return;
      setDevices(list);
      setError(null);
    } catch (e: any) {
      if (!alive.current) return;
      setError(e?.message || "Failed to load devices");
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    refresh();
    const id = window.setInterval(refresh, pollMs);
    return () => {
      alive.current = false;
      window.clearInterval(id);
    };
  }, [refresh, pollMs]);

  return { devices, loading, error, refresh };
}
