import { useCallback, useRef, useState } from "react";
import {
  startUpload,
  abortUpload,
  type UploadSessionInfo,
} from "../services/chunkedUpload";

interface UseChunkedUploadResult {
  progress: number;                    // 0..1
  session: UploadSessionInfo | null;
  error: string | null;
  busy: boolean;
  upload: (input: { deviceId: string; file: File; projectId?: string }) => Promise<UploadSessionInfo | null>;
  abort: () => Promise<void>;
  reset: () => void;
}

export function useChunkedUpload(): UseChunkedUploadResult {
  const [progress, setProgress] = useState(0);
  const [session, setSession] = useState<UploadSessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const upload = useCallback<UseChunkedUploadResult["upload"]>(async (input) => {
    setBusy(true);
    setError(null);
    setProgress(0);
    setSession(null);
    controllerRef.current = new AbortController();
    try {
      const s = await startUpload({
        deviceId: input.deviceId,
        file: input.file,
        projectId: input.projectId,
        signal: controllerRef.current.signal,
        onProgress: (p) => {
          setProgress(p.ratio);
          setSession(p.session);
        },
      });
      setSession(s);
      setProgress(1);
      return s;
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      return null;
    } finally {
      setBusy(false);
      controllerRef.current = null;
    }
  }, []);

  const abort = useCallback(async () => {
    if (controllerRef.current) controllerRef.current.abort();
    if (session) await abortUpload(session.uploadId).catch(() => undefined);
  }, [session]);

  const reset = useCallback(() => {
    setProgress(0);
    setSession(null);
    setError(null);
    setBusy(false);
  }, []);

  return { progress, session, error, busy, upload, abort, reset };
}
