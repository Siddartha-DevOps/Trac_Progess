import React, { useState } from "react";
import {
  Key,
  Folder,
  Building,
  Layers,
  Video,
  Image,
  Cpu,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Shield,
  Bell,
  Search,
  Play,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  ArrowRight,
  Lock,
  RefreshCw,
  FileCode,
  Trash2,
  Plus,
  X,
  ExternalLink,
  Sliders,
  Workflow,
  Sparkles,
  Info
} from "lucide-react";

// API Endpoint Definition Type
interface ApiEndpoint {
  id: string;
  category: "auth" | "projects" | "buildings" | "floors" | "rooms" | "videos" | "frames" | "ai" | "progress" | "schedules" | "reports" | "users" | "notifications";
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  parameters: {
    name: string;
    in: "header" | "query" | "path" | "body";
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
  }[];
  requestBodySchema?: string;
  successResponseSchema: string;
  errorResponses: {
    status: number;
    code: string;
    description: string;
    schema: string;
  }[];
  curlTemplate: string;
  mockResponseData: any;
  mockErrorData?: { [key: string]: any };
}

export default function RestApiDocumentation() {
  // Global States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("auth-login");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3ItOTgyIiwicm9sZSI6IkVudGVycHJpc2VBZG1pbiIsImVtYWlsIjoic2lkZHVjaGl0aWtpQGdtYWlsLmNvbSJ9.buildtrace_secret_signature_2026");
  
  // Try It Out States
  const [trialParams, setTrialParams] = useState<{ [key: string]: string }>({});
  const [trialBody, setTrialBody] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playLatency, setPlayLatency] = useState<number | null>(null);
  const [playResponseStatus, setPlayResponseStatus] = useState<number | null>(null);
  const [playResponseCode, setPlayResponseCode] = useState<string | null>(null);
  const [playResponseData, setPlayResponseData] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<"specs" | "try" | "schema">("specs");
  
  // Swagger RAW Output Tab state
  const [showRawSwagger, setShowRawSwagger] = useState(false);

  // Embedded Detailed Endpoint Specifications
  const endpoints: ApiEndpoint[] = [
    // --- 1. AUTHENTICATION ---
    {
      id: "auth-login",
      category: "auth",
      method: "POST",
      path: "/api/v1/auth/login",
      summary: "Exchange credentials for JWT tokens",
      description: "Authenticates an enterprise stakeholder or site operator. On success, returns an access token and a refresh token, along with RERA permission metadata.",
      requiresAuth: false,
      parameters: [
        { name: "email", in: "body", type: "string", required: true, description: "Enterprise user email address", defaultValue: "sidduchitiki@gmail.com" },
        { name: "password", in: "body", type: "string", required: true, description: "Secure credential key", defaultValue: "buildtrace2026" }
      ],
      requestBodySchema: `{
  "email": "sidduchitiki@gmail.com",
  "password": "buildtrace2026"
}`,
      successResponseSchema: `{
  "status": "success",
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr-982",
    "email": "sidduchitiki@gmail.com",
    "role": "EnterpriseAdmin",
    "assigned_projects": ["proj-blr-02"]
  }
}`,
      errorResponses: [
        { status: 401, code: "BT-1002", description: "Invalid credentials provided.", schema: `{"status":"error","code":"BT-1002","message":"Authentication credentials could not be verified."}` },
        { status: 422, code: "BT-1005", description: "Validation failed (Missing fields).", schema: `{"status":"error","code":"BT-1005","message":"Email and password must be non-empty parameters."}` }
      ],
      curlTemplate: `curl -X POST "https://fastapi.buildtrace.in/v1/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "sidduchitiki@gmail.com", "password": "buildtrace2026"}'`,
      mockResponseData: {
        status: "success",
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3ItOTgyIiwicm9sZSI6IkVudGVycHJpc2VBZG1pbiIsImVtYWlsIjoic2lkZHVjaGl0aWtpQGdtYWlsLmNvbSJ9.buildtrace_secret_signature_2026",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3ItOTgyIiwicmVmcmVzaCI6dHJ1ZX0.buildtrace_refresh_sig_2026",
        token_type: "Bearer",
        expires_in: 3600,
        user: {
          id: "usr-982",
          email: "sidduchitiki@gmail.com",
          role: "EnterpriseAdmin",
          assigned_projects: ["proj-blr-02"]
        }
      },
      mockErrorData: {
        "wrong": {
          status: 401,
          code: "BT-1002",
          data: { status: "error", code: "BT-1002", message: "Authentication credentials could not be verified." }
        }
      }
    },
    {
      id: "auth-me",
      category: "auth",
      method: "GET",
      path: "/api/v1/auth/me",
      summary: "Retrieve current session profile information",
      description: "Returns the authenticated user details derived from the provided Bearer JSON Web Token.",
      requiresAuth: true,
      parameters: [
        { name: "Authorization", in: "header", type: "string", required: true, description: "Bearer token sequence", defaultValue: "Bearer eyJhbGciOiJIUzI1NiIsIn..." }
      ],
      successResponseSchema: `{
  "id": "usr-982",
  "email": "sidduchitiki@gmail.com",
  "role": "EnterpriseAdmin",
  "organization": "BuildTrace India",
  "created_at": "2026-01-15T08:00:00Z"
}`,
      errorResponses: [
        { status: 401, code: "BT-1001", description: "Authorization token is missing or malformed.", schema: `{"status":"error","code":"BT-1001","message":"Signature verification failed. Token invalid."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/auth/me" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        id: "usr-982",
        email: "sidduchitiki@gmail.com",
        role: "EnterpriseAdmin",
        organization: "BuildTrace India",
        created_at: "2026-01-15T08:00:00Z",
        permissions: ["READ_ALL", "PROCESS_AI", "DEPLOY_REPORTS", "EDIT_SYSTEM_SETTINGS"]
      }
    },

    // --- 2. PROJECTS ---
    {
      id: "projects-list",
      category: "projects",
      method: "GET",
      path: "/api/v1/projects",
      summary: "List all monitored infrastructure projects",
      description: "Returns a high-level inventory of construction project suites allocated under the enterprise token scope.",
      requiresAuth: true,
      parameters: [
        { name: "limit", in: "query", type: "integer", required: false, description: "Maximum number of items to return", defaultValue: "10" },
        { name: "offset", in: "query", type: "integer", required: false, description: "Index offset for pagination", defaultValue: "0" }
      ],
      successResponseSchema: `{
  "total": 1,
  "projects": [
    {
      "id": "proj-blr-02",
      "name": "Bangalore Tech Park - Block B",
      "location": "Whitefield, Bengaluru, India",
      "rera_registration": "KA-RERA-2026-0389",
      "status": "Active",
      "creation_date": "2026-03-01T12:00:00Z"
    }
  ]
}`,
      errorResponses: [
        { status: 403, code: "BT-1003", description: "Insufficient permission scope.", schema: `{"status":"error","code":"BT-1003","message":"Access denied to scope resource inventory."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/projects?limit=10" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        total: 1,
        projects: [
          {
            id: "proj-blr-02",
            name: "Bangalore Tech Park - Block B",
            location: "Whitefield, Bengaluru, Karnataka, India",
            rera_registration: "KA-RERA-2026-0389",
            status: "Active",
            total_budget: "₹18.5 Crores",
            current_phase: "Volumetric Framing L2",
            creation_date: "2026-03-01T12:00:00Z"
          }
        ]
      }
    },

    // --- 3. BUILDINGS ---
    {
      id: "buildings-list",
      category: "buildings",
      method: "GET",
      path: "/api/v1/projects/{project_id}/buildings",
      summary: "List buildings associated with a specific project ID",
      description: "Retrieves structural blocks and high-level progress details belonging to the given parent project.",
      requiresAuth: true,
      parameters: [
        { name: "project_id", in: "path", type: "string", required: true, description: "ID of the target project", defaultValue: "proj-blr-02" }
      ],
      successResponseSchema: `{
  "project_id": "proj-blr-02",
  "buildings": [
    {
      "building_id": "bld-btp-b",
      "name": "Block B Core & Annex",
      "total_floors": 4,
      "footprint_area_sqm": 4200.0,
      "completion_percentage": 72.4
    }
  ]
}`,
      errorResponses: [
        { status: 404, code: "BT-2001", description: "Project ID not found in system storage.", schema: `{"status":"error","code":"BT-2001","message":"Requested project ID does not exist."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/projects/proj-blr-02/buildings" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        project_id: "proj-blr-02",
        buildings: [
          {
            building_id: "bld-btp-b",
            name: "Block B Core & Annex",
            total_floors: 4,
            footprint_area_sqm: 4200.0,
            completion_percentage: 72.4,
            estimated_handover: "2026-11-30"
          }
        ]
      }
    },

    // --- 4. FLOORS ---
    {
      id: "floors-list",
      category: "floors",
      method: "GET",
      path: "/api/v1/buildings/{building_id}/floors",
      summary: "List floors associated with a building block",
      description: "Retrieves levels of the target structure alongside physical concrete pours, and structural check statuses.",
      requiresAuth: true,
      parameters: [
        { name: "building_id", in: "path", type: "string", required: true, description: "ID of the target building", defaultValue: "bld-btp-b" }
      ],
      successResponseSchema: `{
  "building_id": "bld-btp-b",
  "floors": [
    { "floor_id": "flr-gnd", "level": 0, "name": "Ground Level", "status": "COMPLETED", "completion_percentage": 100 },
    { "floor_id": "flr-l1", "level": 1, "name": "Level 1", "status": "IN_PROGRESS", "completion_percentage": 85 },
    { "floor_id": "flr-l2", "level": 2, "name": "Level 2", "status": "IN_PROGRESS", "completion_percentage": 35 }
  ]
}`,
      errorResponses: [
        { status: 404, code: "BT-2002", description: "Building ID not found.", schema: `{"status":"error","code":"BT-2002","message":"Building identifier is invalid."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/buildings/bld-btp-b/floors" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        building_id: "bld-btp-b",
        floors: [
          { floor_id: "flr-gnd", level: 0, name: "Ground Level", status: "COMPLETED", completion_percentage: 100, handover_signoff: "2026-05-15" },
          { floor_id: "flr-l1", level: 1, name: "Level 1", status: "IN_PROGRESS", completion_percentage: 85, handover_signoff: null },
          { floor_id: "flr-l2", level: 2, name: "Level 2", status: "IN_PROGRESS", completion_percentage: 35, handover_signoff: null },
          { floor_id: "flr-l3", level: 3, name: "Level 3", status: "PENDING", completion_percentage: 0, handover_signoff: null }
        ]
      }
    },

    // --- 5. ROOMS ---
    {
      id: "rooms-list",
      category: "rooms",
      method: "GET",
      path: "/api/v1/floors/{floor_id}/rooms",
      summary: "List rooms or structural segments inside a floor",
      description: "Retrieves specific zones, columns clusters, or server wings inside a specific layout tier for detailed photogrammetric grouping.",
      requiresAuth: true,
      parameters: [
        { name: "floor_id", in: "path", type: "string", required: true, description: "ID of the target level floor", defaultValue: "flr-l1" }
      ],
      successResponseSchema: `{
  "floor_id": "flr-l1",
  "rooms": [
    { "room_id": "zone-c4-d8", "name": "Axis C4-D8 Wing", "use_case": "Main Datacenter Wing", "active_anomalies": 1 }
  ]
}`,
      errorResponses: [
        { status: 404, code: "BT-2003", description: "Floor ID not found.", schema: `{"status":"error","code":"BT-2003","message":"Floor tier level is not indexed."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/floors/flr-l1/rooms" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        floor_id: "flr-l1",
        rooms: [
          { room_id: "zone-c4-d8", name: "Axis C4-D8 Wing", use_case: "Main Datacenter Wing", active_anomalies: 1, volume_design: "450 m³" },
          { room_id: "zone-lift-core", name: "Shear Lift Core Alpha", use_case: "Vertical Core", active_anomalies: 0, volume_design: "120 m³" }
        ]
      }
    },

    // --- 6. VIDEOS ---
    {
      id: "videos-upload",
      category: "videos",
      method: "POST",
      path: "/api/v1/rooms/{room_id}/videos/upload",
      summary: "Upload drone photogrammetry or crane camera feed",
      description: "Accepts raw high-res MP4/MOV sequences of spatial surveys and schedules the Python background parsing workers.",
      requiresAuth: true,
      parameters: [
        { name: "room_id", in: "path", type: "string", required: true, description: "ID of target room/zone scope", defaultValue: "zone-c4-d8" },
        { name: "video_file", in: "body", type: "binary", required: true, description: "The raw survey stream", defaultValue: "drone_sweep_v104.mp4" }
      ],
      successResponseSchema: `{
  "status": "processing",
  "video_id": "vid-drone-5092",
  "original_name": "drone_sweep_v104.mp4",
  "queued_job_id": "job-ai-891",
  "estimated_time_seconds": 90
}`,
      errorResponses: [
        { status: 415, code: "BT-3001", description: "Unsupported video codec or size limit exceeded.", schema: `{"status":"error","code":"BT-3001","message":"Maximum upload size limit is 450MB."}` }
      ],
      curlTemplate: `curl -X POST "https://fastapi.buildtrace.in/v1/api/v1/rooms/zone-c4-d8/videos/upload" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -F "video_file=@drone_sweep_v104.mp4"`,
      mockResponseData: {
        status: "processing",
        video_id: "vid-drone-5092",
        original_name: "drone_sweep_v104.mp4",
        queued_job_id: "job-ai-891",
        estimated_time_seconds: 90,
        submission_time: "2026-07-09T08:00:00Z"
      }
    },

    // --- 7. FRAMES ---
    {
      id: "frames-list",
      category: "frames",
      method: "GET",
      path: "/api/v1/videos/{video_id}/frames",
      summary: "List parsed keyframes and visual drone snapshots",
      description: "Retrieves individual framed segments extracted from video survey streams, with overlay tag metadata.",
      requiresAuth: true,
      parameters: [
        { name: "video_id", in: "path", type: "string", required: true, description: "Identifier of the parsed survey video", defaultValue: "vid-drone-5092" }
      ],
      successResponseSchema: `{
  "video_id": "vid-drone-5092",
  "frames": [
    { "frame_id": "frm-1029", "timestamp_seconds": 12.5, "yolo_processed": true, "detected_annotations": ["Column C4", "Rebar Stirrups"] }
  ]
}`,
      errorResponses: [
        { status: 404, code: "BT-3002", description: "Video ID has not been compiled yet.", schema: `{"status":"error","code":"BT-3002","message":"Video frames not ready or currently compiling."}` }
      ],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/videos/vid-drone-5092/frames" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        video_id: "vid-drone-5092",
        frames: [
          { frame_id: "frm-1029", timestamp_seconds: 12.5, yolo_processed: true, detected_annotations: ["Column C4", "Rebar Stirrups"], confidence_mean: 0.94 },
          { frame_id: "frm-1035", timestamp_seconds: 18.2, yolo_processed: true, detected_annotations: ["Slab Deck Level 1", "Scaffolding Supports"], confidence_mean: 0.89 }
        ]
      }
    },

    // --- 8. AI PROCESSING ---
    {
      id: "ai-process",
      category: "ai",
      method: "POST",
      path: "/api/v1/ai/process-video",
      summary: "Trigger YOLO rebar segmentation or physical variance analysis",
      description: "Initiates deep neural networks to extract rebar density markers, stirrup spacing arrays, and concrete layer coordinates.",
      requiresAuth: true,
      parameters: [
        { name: "job_id", in: "body", type: "string", required: true, description: "A unique execution ID for tracking progress", defaultValue: "job-ai-891" },
        { name: "model_tier", in: "body", type: "string", required: false, description: "YOLO version model pipeline (YOLOv8x or custom PyTorch)", defaultValue: "YOLOv8x-Custom" }
      ],
      requestBodySchema: `{
  "video_id": "vid-drone-5092",
  "model_tier": "YOLOv8x-Custom",
  "confidence_threshold": 0.85
}`,
      successResponseSchema: `{
  "job_id": "job-ai-891",
  "status": "PROCESSING",
  "progress_percentage": 0,
  "started_at": "2026-07-09T08:05:00Z"
}`,
      errorResponses: [
        { status: 429, code: "BT-4001", description: "PyTorch queue limit exceeded.", schema: `{"status":"error","code":"BT-4001","message":"Engine node is fully utilizing local CUDA thread blocks. Please try again."}` }
      ],
      curlTemplate: `curl -X POST "https://fastapi.buildtrace.in/v1/api/v1/ai/process-video" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"video_id": "vid-drone-5092", "model_tier": "YOLOv8x-Custom"}'`,
      mockResponseData: {
        job_id: "job-ai-891",
        status: "PROCESSING",
        progress_percentage: 45,
        cuda_utilization: "89.2%",
        worker_node: "CUDA-Node-Bengaluru-East",
        started_at: "2026-07-09T08:05:00Z"
      }
    },

    // --- 9. PROGRESS ---
    {
      id: "progress-scurve",
      category: "progress",
      method: "GET",
      path: "/api/v1/progress/s-curve",
      summary: "Retrieve cumulative S-Curve coordinates",
      description: "Calculates mathematical S-Curve timeline data points spanning scheduled baseline design percentage vs photogrammetry measurements.",
      requiresAuth: true,
      parameters: [
        { name: "project_id", in: "query", type: "string", required: true, description: "Filter coordinates by project", defaultValue: "proj-blr-02" }
      ],
      successResponseSchema: `{
  "project_id": "proj-blr-02",
  "coordinates": [
    { "week": "Wk 1", "baseline_planned": 10.0, "actual_progress": 10.0 },
    { "week": "Wk 2", "baseline_planned": 20.0, "actual_progress": 19.0 }
  ]
}`,
      errorResponses: [],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/progress/s-curve?project_id=proj-blr-02" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        project_id: "proj-blr-02",
        coordinates: [
          { week: "Wk 1", baseline_planned: 10.0, actual_progress: 10.0 },
          { week: "Wk 2", baseline_planned: 20.0, actual_progress: 19.0 },
          { week: "Wk 3", baseline_planned: 30.0, actual_progress: 28.0 },
          { week: "Wk 4", baseline_planned: 38.0, actual_progress: 35.0 },
          { week: "Wk 12", baseline_planned: 81.0, actual_progress: 76.0 }
        ]
      }
    },

    // --- 10. SCHEDULES ---
    {
      id: "schedules-post",
      category: "schedules",
      method: "POST",
      path: "/api/v1/schedules",
      summary: "Schedule automatic daily or weekly RERA document distribution",
      description: "Registers active cron workers to auto-compile site reports and dispatch to investor emails.",
      requiresAuth: true,
      parameters: [
        { name: "report_type", in: "body", type: "string", required: true, description: "Name of report configuration", defaultValue: "Daily Progress Log" },
        { name: "frequency", in: "body", type: "string", required: true, description: "Daily, Weekly, or Monthly", defaultValue: "Daily" },
        { name: "recipient_email", in: "body", type: "string", required: true, description: "Email address to send files", defaultValue: "sidduchitiki@gmail.com" }
      ],
      requestBodySchema: `{
  "report_type": "Daily Progress Log",
  "frequency": "Daily",
  "recipient_email": "sidduchitiki@gmail.com",
  "format": "PDF",
  "time_of_day": "18:30"
}`,
      successResponseSchema: `{
  "status": "success",
  "schedule_id": "sch-9912",
  "message": "Cron worker registered on BuildTrace Server successfully."
}`,
      errorResponses: [
        { status: 400, code: "BT-1005", description: "Missing email address validation.", schema: `{"status":"error","code":"BT-1005","message":"The recipient email field is malformed."}` }
      ],
      curlTemplate: `curl -X POST "https://fastapi.buildtrace.in/v1/api/v1/schedules" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"report_type": "Daily Progress Log", "frequency": "Daily", "recipient_email": "sidduchitiki@gmail.com"}'`,
      mockResponseData: {
        status: "success",
        schedule_id: "sch-9912",
        message: "Cron worker registered on BuildTrace Server successfully.",
        next_run: "2026-07-09T18:30:00Z"
      }
    },

    // --- 11. REPORTS ---
    {
      id: "reports-compile",
      category: "reports",
      method: "POST",
      path: "/api/v1/reports/compile",
      summary: "Compile immediate PDF or Excel site audits",
      description: "Generates static immutable files capturing current project logs, safety certificates, and active RERA anomalies.",
      requiresAuth: true,
      parameters: [
        { name: "format", in: "body", type: "string", required: true, description: "PDF or EXCEL format choice", defaultValue: "PDF" }
      ],
      requestBodySchema: `{
  "project_id": "proj-blr-02",
  "format": "PDF",
  "include_photogrammetry_links": true
}`,
      successResponseSchema: `{
  "status": "compiled",
  "download_url": "https://fastapi.buildtrace.in/v1/static/exports/BTP_BlockB_Report_982.pdf",
  "pages_count": 8,
  "hash_signature": "sha256-ff7109a..."
}`,
      errorResponses: [],
      curlTemplate: `curl -X POST "https://fastapi.buildtrace.in/v1/api/v1/reports/compile" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"project_id": "proj-blr-02", "format": "PDF"}'`,
      mockResponseData: {
        status: "compiled",
        download_url: "https://fastapi.buildtrace.in/v1/static/exports/BTP_BlockB_Report_982.pdf",
        pages_count: 8,
        hash_signature: "sha256-ff7109a8ccf815ef98288339185a8a81765c9f515e098858e8a93aef4c1a293b",
        generated_at: "2026-07-09T08:05:47-07:00"
      }
    },

    // --- 12. USERS & PERMISSIONS ---
    {
      id: "users-permissions",
      category: "users",
      method: "PUT",
      path: "/api/v1/users/{user_id}/role",
      summary: "Update user roles and credential scopes",
      description: "Modifies permission boundaries. Requires high-level EnterpriseAdmin permissions.",
      requiresAuth: true,
      parameters: [
        { name: "user_id", in: "path", type: "string", required: true, description: "target user profile identifier", defaultValue: "usr-982" },
        { name: "new_role", in: "body", type: "string", required: true, description: "EnterpriseAdmin, Surveyor, Contractor, or Auditor", defaultValue: "EnterpriseAdmin" }
      ],
      requestBodySchema: `{
  "new_role": "EnterpriseAdmin",
  "allowed_scopes": ["proj-blr-02"]
}`,
      successResponseSchema: `{
  "status": "success",
  "user_id": "usr-982",
  "assigned_role": "EnterpriseAdmin",
  "updated_at": "2026-07-09T08:05:54Z"
}`,
      errorResponses: [
        { status: 403, code: "BT-1003", description: "Action is prohibited for the current token privileges.", schema: `{"status":"error","code":"BT-1003","message":"Only administrators are allowed to modify role configurations."}` }
      ],
      curlTemplate: `curl -X PUT "https://fastapi.buildtrace.in/v1/api/v1/users/usr-982/role" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"new_role": "EnterpriseAdmin"}'`,
      mockResponseData: {
        status: "success",
        user_id: "usr-982",
        assigned_role: "EnterpriseAdmin",
        updated_at: "2026-07-09T08:05:54Z"
      }
    },

    // --- 13. NOTIFICATIONS ---
    {
      id: "notifications-get",
      category: "notifications",
      method: "GET",
      path: "/api/v1/notifications",
      summary: "Fetch system telemetry alerts and RERA reports",
      description: "Returns unread system warning events, structural compliance updates, and photogrammetry anomalies.",
      requiresAuth: true,
      parameters: [
        { name: "include_read", in: "query", type: "boolean", required: false, description: "Whether to return already resolved alerts", defaultValue: "false" }
      ],
      successResponseSchema: `{
  "unread_count": 2,
  "notifications": [
    {
      "id": "not-2",
      "priority": "critical",
      "title": "Column C4 Stirrups Spacing Warning",
      "body": "Rebar stirrups are detected at 285mm intervals vs specified 200mm standard.",
      "timestamp": "2026-07-09 08:30 AM"
    }
  ]
}`,
      errorResponses: [],
      curlTemplate: `curl -X GET "https://fastapi.buildtrace.in/v1/api/v1/notifications?include_read=false" \\
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>"`,
      mockResponseData: {
        unread_count: 2,
        notifications: [
          {
            id: "not-2",
            priority: "critical",
            title: "Column C4 Stirrups Spacing Warning",
            body: "Rebar stirrups are detected at 285mm intervals vs specified 200mm standard. Initiating RERA mitigation step.",
            timestamp: "2026-07-09 08:30 AM"
          },
          {
            id: "not-3",
            priority: "high",
            title: "HVAC to Sprinkler spatial clash resolved in BIM",
            body: "Architectural drawings updated. Sprinkler coordinate offset has been shifted 18.5cm left.",
            timestamp: "2026-07-09 10:15 AM"
          }
        ]
      }
    }
  ];

  // Global Error Specs
  const errorSpecs = [
    { code: "BT-1001", status: 401, errorName: "UNAUTHORIZED_TOKEN", description: "Authorization token is missing, expired, or failed cryptographic verification." },
    { code: "BT-1002", status: 401, errorName: "INVALID_CREDENTIALS", description: "The email or password does not match any register in our enterprise directory." },
    { code: "BT-1003", status: 403, codeClass: "FORBIDDEN", errorName: "INSUFFICIENT_PRIVILEGES", description: "The requested resource requires permissions that your current user role does not possess." },
    { code: "BT-1005", status: 422, errorName: "VALIDATION_FAILED", description: "JSON validation failed. Required parameters were null or in the wrong datatype format." },
    { code: "BT-2001", status: 404, errorName: "PROJECT_NOT_FOUND", description: "The project identifier does not map to any database records." },
    { code: "BT-2002", status: 404, errorName: "BUILDING_NOT_FOUND", description: "The building ID specified does not exist within the given project namespace." },
    { code: "BT-2003", status: 404, errorName: "LEVEL_NOT_FOUND", description: "The target level/floor has not been mapped inside the model files." },
    { code: "BT-2004", status: 409, errorName: "BIM_ALIGNMENT_CLASH", description: "Uploaded photogrammetry coordinate anchors clash with standard IFC grid dimensions by more than 150cm." },
    { code: "BT-3001", status: 415, errorName: "UNSUPPORTED_SURVEY_FORMAT", description: "Video file upload is not an MP4, MOV, or is larger than the 450MB system ingestion ceiling." },
    { code: "BT-3050", status: 451, errorName: "RERA_REGULATORY_VIOLATION", description: "Structural spacing deviation is critical enough to trigger an automatic hold under active RERA rules." },
    { code: "BT-4001", status: 429, errorName: "CUDA_THREAD_THROTTLED", description: "High-density PyTorch queue overflow. Local CUDA processing cores are saturated with drone sweeps." }
  ];

  // Filtering Logic
  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch =
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run Try It Out Simulation
  const handleRunSimulation = () => {
    setIsPlaying(true);
    setPlayLatency(null);
    setPlayResponseStatus(null);
    setPlayResponseCode(null);
    setPlayResponseData(null);

    // Simulate Server Ingestion Latency
    setTimeout(() => {
      setIsPlaying(false);
      setPlayLatency(Math.floor(Math.random() * 120) + 40); // 40ms - 160ms latency
      
      // Custom Trial Body inputs trigger logical error states
      if (activeEndpoint.id === "auth-login") {
        try {
          const bodyObj = JSON.parse(trialBody || "{}");
          if (bodyObj.password === "wrong") {
            setPlayResponseStatus(401);
            setPlayResponseCode("BT-1002");
            setPlayResponseData(activeEndpoint.mockErrorData?.["wrong"]?.data);
            return;
          }
        } catch (e) {
          // Fall through
        }
      }

      // Default Success Simulator
      setPlayResponseStatus(200);
      setPlayResponseData(activeEndpoint.mockResponseData);
    }, 1200);
  };

  // Initialize try-out parameters default values
  React.useEffect(() => {
    const defaults: { [key: string]: string } = {};
    activeEndpoint.parameters.forEach(p => {
      if (p.defaultValue) {
        defaults[p.name] = p.defaultValue;
      }
    });
    setTrialParams(defaults);
    setTrialBody(activeEndpoint.requestBodySchema || "");
    
    // Clear simulation fields
    setPlayLatency(null);
    setPlayResponseStatus(null);
    setPlayResponseCode(null);
    setPlayResponseData(null);
  }, [selectedEndpointId]);

  // Construct Swagger JSON specification to display
  const swaggerSpecString = JSON.stringify({
    openapi: "3.0.3",
    info: {
      title: "BuildTrace Core Construction Audit API",
      description: "Enterprise FastAPI engine powering photogrammetric drone scans, RERA compliance checklists, and rebar stirrup density check trackers.",
      version: "1.0.0",
      contact: {
        email: "sidduchitiki@gmail.com"
      }
    },
    servers: [
      { url: "https://fastapi.buildtrace.in/v1", description: "Primary Enterprise Cloud Run cluster" }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths: endpoints.reduce((acc: any, curr) => {
      const formattedPath = curr.path;
      if (!acc[formattedPath]) acc[formattedPath] = {};
      
      acc[formattedPath][curr.method.toLowerCase()] = {
        summary: curr.summary,
        description: curr.description,
        security: curr.requiresAuth ? [{ BearerAuth: [] }] : [],
        parameters: curr.parameters.filter(p => p.in !== "body").map(p => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type }
        })),
        responses: {
          "200": {
            description: "Success schema",
            content: {
              "application/json": {
                schema: { type: "object" }
              }
            }
          }
        }
      };
      return acc;
    }, {})
  }, null, 2);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* SECTION HEADER */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[9px] rounded uppercase tracking-wider">
              interactive spec
            </span>
            <h2 className="text-lg font-black tracking-tight">Core REST API Swagger Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            BuildTrace REST API reference guide for automated drone sweeps, spatial BIM alignments, and RERA tracking routines.
          </p>
        </div>

        {/* Base URL & Global Token Manager */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-300 flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Base URL</span>
            <span>https://fastapi.buildtrace.in/v1</span>
          </div>

          <button
            onClick={() => setShowRawSwagger(!showRawSwagger)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1.5 transition shrink-0"
          >
            <FileCode className="w-3.5 h-3.5" />
            {showRawSwagger ? "Hide OpenAPI Specs" : "Show OpenAPI Specs"}
          </button>
        </div>
      </div>

      {/* SWAGGER OPENAPI SPEC RAW PREVIEW OVERLAY */}
      {showRawSwagger && (
        <div className="bg-slate-950 text-slate-200 border-b border-slate-800 p-6 flex flex-col gap-3 font-mono text-xs max-h-[400px] overflow-y-auto">
          <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <span className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
              <Workflow className="w-4 h-4" />
              OpenAPI 3.0.3 Spec Schema (Swagger compatible)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(swaggerSpecString, "raw-swagger")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-white flex items-center gap-1 transition"
              >
                {copiedId === "raw-swagger" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy Spec
              </button>
            </div>
          </div>
          <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto text-slate-300 text-[11px] leading-relaxed select-all">
            {swaggerSpecString}
          </pre>
        </div>
      )}

      {/* SECURITY CONTROLS BAR */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Lock className="w-4 h-4 text-indigo-500" />
          <span className="font-bold">Global Security Scope:</span>
          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-[10px]">
            oauth2/BearerToken
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">Authorization Token:</span>
          <div className="relative flex-1 sm:w-80">
            <Key className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Bearer Token"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg pl-8 pr-12 py-1.5 text-xs font-mono outline-none transition"
            />
            <span className="absolute right-2 top-2 text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest font-mono">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* MAIN SPEC COMPILER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        
        {/* SIDEBAR NAVIGATION: ENDPOINT INDEX (4 Columns) */}
        <div className="lg:col-span-4 bg-slate-50/50 border-r border-slate-200 p-4 flex flex-col gap-4">
          
          {/* Internal search filter */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints, paths, summary..."
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs outline-none transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Spec Blocks" },
              { id: "auth", label: "Auth" },
              { id: "projects", label: "Projects" },
              { id: "buildings", label: "Blocks" },
              { id: "ai", label: "AI Process" },
              { id: "progress", label: "S-Curve" },
              { id: "schedules", label: "Schedules" },
              { id: "reports", label: "Reports" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200/60 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Endpoints Inventory List */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[580px] pr-1.5">
            {filteredEndpoints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No matching endpoint paths found.
              </div>
            ) : (
              filteredEndpoints.map(endpoint => {
                const isSelected = endpoint.id === selectedEndpointId;
                
                // Color mapping for method badges
                const methodColors = {
                  GET: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", badge: "bg-emerald-600" },
                  POST: { bg: "bg-blue-50 text-blue-700 border-blue-200", badge: "bg-blue-600" },
                  PUT: { bg: "bg-amber-50 text-amber-700 border-amber-200", badge: "bg-amber-600" },
                  DELETE: { bg: "bg-rose-50 text-rose-700 border-rose-200", badge: "bg-rose-600" }
                };
                const color = methodColors[endpoint.method];

                return (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpointId(endpoint.id)}
                    className={`p-2.5 text-left rounded-lg border transition flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                        : "bg-white/40 hover:bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] border ${color.bg}`}>
                          {endpoint.method}
                        </span>
                        <span className="text-slate-800 truncate max-w-[160px] md:max-w-none">{endpoint.path}</span>
                      </div>
                      {endpoint.requiresAuth && (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {endpoint.summary}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Stats Summary Box */}
          <div className="mt-auto bg-slate-900 text-slate-300 p-3.5 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">RERA Validation Node Info</span>
            <div className="flex justify-between font-mono mb-1">
              <span>Endpoints Hosted:</span>
              <span className="font-bold text-white">{endpoints.length}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Mean Ingestion Delay:</span>
              <span className="font-bold text-emerald-400">82 ms</span>
            </div>
          </div>

        </div>

        {/* DETAILS STAGE & TRY-IT-OUT BENCH (8 Columns) */}
        <div className="lg:col-span-8 p-6 flex flex-col gap-6 overflow-y-auto max-h-[780px] bg-slate-50/20">
          
          {/* Selected Endpoint Card Base Header */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                activeEndpoint.method === "GET" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                activeEndpoint.method === "POST" ? "bg-blue-50 text-blue-700 border-blue-200" :
                activeEndpoint.method === "PUT" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                {activeEndpoint.method}
              </span>
              <span className="font-mono font-black text-sm text-slate-900 select-all">{activeEndpoint.path}</span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-800">{activeEndpoint.summary}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activeEndpoint.description}</p>
            </div>

            {/* Sub-Tabs: Specification Specs vs. Playgrounds */}
            <div className="flex border-b border-slate-100 mt-3 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveSubTab("specs")}
                className={`pb-2 border-b-2 transition ${
                  activeSubTab === "specs"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Specifications & Parameters
              </button>
              <button
                onClick={() => setActiveSubTab("try")}
                className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
                  activeSubTab === "try"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Play className="w-3 h-3 text-indigo-500 animate-pulse" />
                Try It Out (Simulated Live Runner)
              </button>
            </div>
          </div>

          {/* SUB-PANEL 1: SPECIFICATIONS & PARAMETERS */}
          {activeSubTab === "specs" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              
              {/* Parameters List Block */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Parameters Schema Definition
                </h4>
                {activeEndpoint.parameters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No parameters are requested for this endpoint.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase font-mono">
                          <th className="py-2">Name</th>
                          <th className="py-2">Location</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Required</th>
                          <th className="py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[11px]">
                        {activeEndpoint.parameters.map((param, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-2.5 text-slate-900 font-bold">{param.name}</td>
                            <td>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px]">
                                {param.in}
                              </span>
                            </td>
                            <td className="text-indigo-600">{param.type}</td>
                            <td>
                              <span className={`font-semibold ${param.required ? "text-rose-600" : "text-slate-400"}`}>
                                {param.required ? "true" : "false"}
                              </span>
                            </td>
                            <td className="font-sans text-xs text-slate-500 py-2.5">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* cURL Generation Copy Module */}
              <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono">
                <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-1.5">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">Example cURL Request</span>
                  <button
                    onClick={() => handleCopy(activeEndpoint.curlTemplate, "curl")}
                    className="hover:text-white flex items-center gap-1 text-slate-500"
                  >
                    {copiedId === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-slate-950/80 rounded-lg text-[11px] leading-relaxed overflow-x-auto text-slate-200 whitespace-pre-wrap select-all">
                  {activeEndpoint.curlTemplate}
                </pre>
              </div>

              {/* Success Response Spec Schema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Success response preview */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Success Response (200 OK)
                    </h5>
                    <button
                      onClick={() => handleCopy(activeEndpoint.successResponseSchema, "success")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedId === "success" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-50 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed text-slate-600 max-h-60">
                    {activeEndpoint.successResponseSchema}
                  </pre>
                </div>

                {/* Error responses reference */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                  <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Targeted Fault Signatures
                  </h5>
                  {activeEndpoint.errorResponses.length === 0 ? (
                    <p className="text-slate-400 italic">No specific errors defined for this structural route.</p>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-60 pr-1">
                      {activeEndpoint.errorResponses.map((err, idx) => (
                        <div key={idx} className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 flex flex-col gap-1.5">
                          <div className="flex justify-between items-center font-mono text-[10px]">
                            <span className="font-bold text-rose-800">Status {err.status}</span>
                            <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">{err.code}</span>
                          </div>
                          <span className="font-semibold text-slate-700 text-[11px]">{err.description}</span>
                          <pre className="p-2 bg-white rounded border border-rose-100 text-[9px] font-mono text-slate-500 overflow-x-auto">
                            {err.schema}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* SUB-PANEL 2: TRY IT OUT (PLAYGROUND) */}
          {activeSubTab === "try" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              
              {/* Param Input benches */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    Interactive Input Arguments
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Simulate state parameters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEndpoint.parameters.map((param, idx) => {
                    // Render string, integer or binary selectors
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>{param.name} ({param.in})</span>
                          {param.required && <span className="text-[9px] text-rose-500 font-bold font-mono">required</span>}
                        </label>
                        <input
                          type="text"
                          value={trialParams[param.name] || ""}
                          onChange={(e) => setTrialParams({ ...trialParams, [param.name]: e.target.value })}
                          className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs font-mono outline-none transition"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Request body text area (for POST/PUT requests) */}
                {activeEndpoint.requestBodySchema && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-[11px] font-semibold text-slate-700">JSON Request Body Payload:</span>
                    <textarea
                      rows={5}
                      value={trialBody}
                      onChange={(e) => setTrialBody(e.target.value)}
                      placeholder="{}"
                      className="w-full bg-slate-900 text-indigo-200 border border-slate-800 rounded-lg p-3.5 text-xs font-mono outline-none focus:border-indigo-500 transition leading-relaxed whitespace-pre"
                    />
                    <p className="text-[10px] text-slate-400 italic">Modify body fields to test alternative responses (e.g., set &quot;password&quot;: &quot;wrong&quot; to test unauthorized errors).</p>
                  </div>
                )}

                {/* Fire runner trigger button */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: fastapi.buildtrace.in{activeEndpoint.path}
                  </span>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isPlaying}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-black rounded-lg flex items-center gap-2 transition"
                  >
                    {isPlaying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Execute API Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Execution results viewer */}
              {(playResponseStatus || isPlaying) && (
                <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 flex flex-col gap-3 animate-fade-in font-mono">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-[10px]">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Server Execution Terminal Output
                    </span>
                    {playResponseStatus && (
                      <div className="flex gap-4">
                        <span className="text-slate-500">Latency: <strong className="text-white">{playLatency}ms</strong></span>
                        <span className={`font-bold ${playResponseStatus === 200 ? "text-emerald-400" : "text-rose-400"}`}>
                          Status {playResponseStatus}
                        </span>
                      </div>
                    )}
                  </div>

                  {isPlaying ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-400 animate-pulse font-bold">Awaiting handshakes from BuildTrace fastapi clusters...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Generated Response JSON</span>
                        <pre className="p-3 bg-slate-950/85 rounded-lg overflow-x-auto text-[11px] text-emerald-400 leading-relaxed max-h-72">
                          {JSON.stringify(playResponseData, null, 2)}
                        </pre>
                      </div>

                      {/* Header signature trace */}
                      <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800 flex justify-between text-[10px] text-slate-400">
                        <span>X-BuildTrace-Node: FastAPI-CloudRun-Worker-04</span>
                        <span>X-RERA-Sign: {activeEndpoint.category === "projects" || activeEndpoint.category === "buildings" ? "VERIFIED-OK" : "BYPASSED"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* GLOBAL FAULT REGISTRY SPEC (Always Visible at bottom of details) */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500" />
                Global RERA Error Code Signatures Registry
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                A complete matrix of all custom exception codes returned under the <code>code</code> field of fault responses.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-700 text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold font-mono text-[10px] uppercase">
                    <th className="py-2">Fault Code</th>
                    <th className="py-2">HTTP Status</th>
                    <th className="py-2">Exception Tag</th>
                    <th className="py-2">Handling Description</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px]">
                  {errorSpecs.map((err, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-2 text-rose-700 font-bold">{err.code}</td>
                      <td className="font-semibold text-slate-500">{err.status}</td>
                      <td className="text-indigo-600 font-bold">{err.errorName}</td>
                      <td className="font-sans text-xs text-slate-500 py-2">{err.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
