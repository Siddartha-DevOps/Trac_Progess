# 360° Helmet Camera Ingestion

Feature: **P0 — Real chunked upload + device SDK/pairing + fleet management**.
Closes the gap identified in the Buildots audit for parity item #1 (360° helmet
capture ingestion).

The system has three parts:

1. **Device registry** — REST endpoints under `/api/devices/*` for pairing,
   listing, telemetry updates, and assignment. Fleet cards in
   `HardhatCameraFleetTelemetry` render this data live.
2. **Chunked upload** — REST endpoints under `/api/uploads/*` for large 360°
   capture files (400–2000 MB). Chunks land on disk under `.uploads/chunks/`
   and are assembled + SHA-256-verified on `complete`. Failed / interrupted
   uploads can resume from missing chunks.
3. **Device SDK contract** — a minimal set of endpoints a firmware/mobile SDK
   calls (`pair/complete`, `heartbeat`, `uploads/*`). The current MVP hits the
   same endpoints from the web UI; the SDK just re-uses them.

## Data model

JSON files under `data/helmet/` (gitignored). Wrapped by `server/helmet/store.ts`
so a single-file swap to Prisma/Postgres will preserve the API surface.

- `data/helmet/devices.json` — `DeviceRecord[]`
- `data/helmet/pairings.json` — `PairingCode[]` (10-min TTL, one-shot claim)
- `data/helmet/uploads.json` — `UploadSession[]`

Assembled captures land under `.uploads/captures/<deviceId>/<uploadId>__<name>`.

## Pairing flow

```
UI  ──POST /api/devices/pair─────────────►  server (issues 6-digit code)
UI  displays code
Device SDK ──POST /api/devices/pair/complete { code, model, serialNo } ─►  server
                                                                            │
                                                                            ▼
                                                              creates DeviceRecord
                                                              returns { device, token }
Device SDK stores token, uses it for future heartbeats/uploads.
```

## Chunked upload flow

```
Client  ──POST /api/uploads/init { deviceId, filename, totalBytes, chunkSize, sha256 }
        ◄──                             { session: { uploadId, totalChunks, ... } }

Client  ─(for each chunk i)─►  POST /api/uploads/:uploadId/chunk
                                Header X-Chunk-Index: i
                                Body   multipart/form-data field "chunk"
        ◄── { session, receivedIndex, progress }

Client  ──POST /api/uploads/:uploadId/complete
        ◄── { session { status: "completed", storagePath, checksumSha256 } }
```

Resume: if the client dies mid-upload, it can re-`GET /api/uploads/:uploadId`
to fetch `receivedChunks[]` and skip those on the retry.

## Endpoints (cheat-sheet)

| Method | Path | Purpose |
|---|---|---|
| GET    | `/api/devices` | list fleet |
| GET    | `/api/devices/:id` | detail |
| PATCH  | `/api/devices/:id` | assign walker/floor/project |
| POST   | `/api/devices/pair` | issue pairing code |
| POST   | `/api/devices/pair/complete` | device claims code, gets token |
| POST   | `/api/devices/:id/heartbeat` | device telemetry beat (Bearer token) |
| POST   | `/api/uploads/init` | open a chunked-upload session |
| POST   | `/api/uploads/:uploadId/chunk` | send one chunk (multipart) |
| POST   | `/api/uploads/:uploadId/complete` | assemble + verify |
| GET    | `/api/uploads/:uploadId` | resume state |
| GET    | `/api/uploads?deviceId=…` | list |
| DELETE | `/api/uploads/:uploadId` | abort |

## Future work (out of scope for this PR)

- Swap JSON store → Prisma + Postgres (schema in `backend/prisma`).
- Replace `.uploads/` disk store with S3 signed-URL direct upload; server only
  records the session/metadata.
- BullMQ worker that picks up completed uploads and hands off to the SLAM /
  CV pipeline (`enterprise_cv_platform`).
- WebSocket progress push (currently polling on the client).
- Device-token rotation + revocation UI.
- End-to-end tests for pair → upload → complete cycle.
