export interface DbField {
  name: string;
  type: string;
  constraint: string;
  desc: string;
  isIndexed: boolean;
  relation?: string;
}

export interface DbTableInfo {
  name: string;
  count: number;
  color: string;
  desc: string;
  fields: DbField[];
}

export const ENTERPRISE_DB_TABLES: DbTableInfo[] = [
  {
    name: "Organization",
    count: 7,
    color: "text-indigo-400",
    desc: "Multi-tenant corporate boundary containing developer profiles, billing logs, and system controls",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary key for multi-tenant isolation", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Legal corporate entity name (e.g., L&T Infra)", isIndexed: false },
      { name: "slug", type: "String", constraint: "@unique", desc: "URL-friendly string unique identifier", isIndexed: true },
      { name: "reraLicense", type: "String", constraint: "@unique NULL", desc: "Indian regulatory licensing certificate registry", isIndexed: true },
      { name: "createdAt", type: "Timestamp", constraint: "DEFAULT now()", desc: "Audit trace record creation timestamp", isIndexed: false },
      { name: "updatedAt", type: "Timestamp", constraint: "UPDATED_AT", desc: "Last modification tracking timestamp", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Timestamp index for Soft Delete filters", isIndexed: true }
    ]
  },
  {
    name: "User",
    count: 12,
    color: "text-indigo-400",
    desc: "Identity profiles, cryptographic credentials, and multi-tenant organization linkages",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "email", type: "String", constraint: "@unique", desc: "Authenticated corporate email address", isIndexed: true },
      { name: "passwordHash", type: "String", constraint: "NOT NULL", desc: "Argon2 cryptographic security hash", isIndexed: false },
      { name: "firstName", type: "String", constraint: "NOT NULL", desc: "Operator's legal given name", isIndexed: false },
      { name: "lastName", type: "String", constraint: "NOT NULL", desc: "Operator's legal surname", isIndexed: false },
      { name: "phone", type: "String", constraint: "NULL", desc: "RERA coordination contact mobile number", isIndexed: false },
      { name: "isActive", type: "Boolean", constraint: "DEFAULT true", desc: "Active flag to instantly revoke system access", isIndexed: false },
      { name: "organizationId", type: "UUID", constraint: "FOREIGN KEY", desc: "Refers to parent Organization", isIndexed: true, relation: "Organization.id" },
      { name: "createdAt", type: "Timestamp", constraint: "DEFAULT now()", desc: "Creation record timestamp", isIndexed: false },
      { name: "updatedAt", type: "Timestamp", constraint: "UPDATED_AT", desc: "Modification timestamp", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete visibility marker", isIndexed: true }
    ]
  },
  {
    name: "Role",
    count: 7,
    color: "text-indigo-400",
    desc: "Organizational security groups mapped with explicit access control permissions (RBAC)",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "UNIQUE(name, organizationId)", desc: "Group name (e.g. PLANNING_DIRECTOR)", isIndexed: true },
      { name: "description", type: "String", constraint: "NULL", desc: "Roles & corporate accountability definitions", isIndexed: false },
      { name: "organizationId", type: "UUID", constraint: "FOREIGN KEY", desc: "Multi-tenant boundary reference", isIndexed: true, relation: "Organization.id" },
      { name: "createdAt", type: "Timestamp", constraint: "DEFAULT now()", desc: "Creation marker", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete timestamp", isIndexed: true }
    ]
  },
  {
    name: "Permission",
    count: 3,
    color: "text-indigo-400",
    desc: "Atomic security tokens representing individual API actions (e.g. bim:write, ai:run)",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "action", type: "String", constraint: "@unique", desc: "System action namespace (e.g. report:approve)", isIndexed: true },
      { name: "description", type: "String", constraint: "NULL", desc: "Policy coverage scope explanation", isIndexed: false }
    ]
  },
  {
    name: "Project",
    count: 14,
    color: "text-indigo-400",
    desc: "High-scale engineering sites tracked with latitude locks, RERA IDs, and progress statistics",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Public construction project name", isIndexed: false },
      { name: "code", type: "String", constraint: "@unique", desc: "Internal accounting site ID code", isIndexed: true },
      { name: "reraId", type: "String", constraint: "@unique NULL", desc: "Official state regulatory registration code", isIndexed: true },
      { name: "latitude", type: "Float", constraint: "NULL", desc: "GIS latitude lock for drone alignment", isIndexed: false },
      { name: "longitude", type: "Float", constraint: "NULL", desc: "GIS longitude lock for drone alignment", isIndexed: false },
      { name: "address", type: "String", constraint: "NULL", desc: "Physical delivery address", isIndexed: false },
      { name: "city", type: "String", constraint: "NOT NULL", desc: "Project municipality center", isIndexed: false },
      { name: "organizationId", type: "UUID", constraint: "FOREIGN KEY", desc: "Multi-tenant owner link", isIndexed: true, relation: "Organization.id" },
      { name: "createdAt", type: "Timestamp", constraint: "DEFAULT now()", desc: "Baseline record timestamp", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete audit tag", isIndexed: true }
    ]
  },
  {
    name: "Building",
    count: 7,
    color: "text-indigo-400",
    desc: "Independent physical towers or infrastructure sectors on a single master site",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Tower identification (e.g. Tower B-Gold)", isIndexed: false },
      { name: "code", type: "String", constraint: "UNIQUE(code, projectId)", desc: "Unique local alphanumeric code (e.g. T-B)", isIndexed: true },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Site reference lock", isIndexed: true, relation: "Project.id" },
      { name: "createdAt", type: "Timestamp", constraint: "now()", desc: "Creation tracking", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete parameter", isIndexed: true }
    ]
  },
  {
    name: "Floor",
    count: 7,
    color: "text-emerald-400",
    desc: "Vertical levels within a building housing unique indoor structural grids",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Level designation (e.g. Ground Floor, L1)", isIndexed: false },
      { name: "levelNumber", type: "Int", constraint: "UNIQUE(levelNumber, buildingId)", desc: "Sorted vertical order index (e.g., -1 for basement, 0 for ground)", isIndexed: true },
      { name: "buildingId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Tower linkage parameter", isIndexed: true, relation: "Building.id" },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete checkpoint", isIndexed: true }
    ]
  },
  {
    name: "Room",
    count: 7,
    color: "text-emerald-400",
    desc: "Spatial coordinate sectors within a floor used for modular WBS activity targeting",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Room / zone label (e.g. Corridor Zone A)", isIndexed: false },
      { name: "code", type: "String", constraint: "NULL", desc: "Design grid code representation", isIndexed: false },
      { name: "floorId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Vertical level mapping lock", isIndexed: true, relation: "Floor.id" },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete capability", isIndexed: true }
    ]
  },
  {
    name: "Trade",
    count: 5,
    color: "text-emerald-400",
    desc: "Distinct engineering groups (e.g. Structural, Architectural, MEP)",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "@unique", desc: "Trade label (e.g., Mechanical Engineering Plumbing)", isIndexed: true },
      { name: "code", type: "String", constraint: "@unique", desc: "Acronym code (e.g., MEP)", isIndexed: true },
      { name: "description", type: "String", constraint: "NULL", desc: "Scope summary", isIndexed: false }
    ]
  },
  {
    name: "BimElement",
    count: 11,
    color: "text-emerald-400",
    desc: "Virtual 3D architectural model components linked with millimetric coordinates and GUIDs",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "guid", type: "String", constraint: "@unique", desc: "Industry Standard Revit/IFC GUID", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Descriptive label (e.g. Drywall studs L1W)", isIndexed: false },
      { name: "type", type: "String", constraint: "NOT NULL", desc: "IFC entity type (e.g. IfcWallStandardCase)", isIndexed: true },
      { name: "properties", type: "Json", constraint: "NULL", desc: "Extracted CAD metadata dictionary", isIndexed: false },
      { name: "boundingBox", type: "Json", constraint: "NULL", desc: "X/Y/Z theoretical boundary limits for 3D mapping", isIndexed: false },
      { name: "floorId", type: "UUID", constraint: "FOREIGN KEY", desc: "Level ownership assignment", isIndexed: true, relation: "Floor.id" },
      { name: "roomId", type: "UUID", constraint: "FOREIGN KEY NULL", desc: "Optional local room target boundary", isIndexed: true, relation: "Room.id" },
      { name: "tradeId", type: "UUID", constraint: "FOREIGN KEY", desc: "Discipline allocation link", isIndexed: true, relation: "Trade.id" },
      { name: "createdAt", type: "Timestamp", constraint: "now()", desc: "Record timestamp", isIndexed: false }
    ]
  },
  {
    name: "Schedule",
    count: 7,
    color: "text-emerald-400",
    desc: "Gantt chart baseline schedules against which site progress delays are calculated",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Schedule target label (e.g., Q2 RERA baseline)", isIndexed: false },
      { name: "isBaseline", type: "Boolean", constraint: "DEFAULT false", desc: "Flag indicating whether this is the legal RERA baseline target", isIndexed: true },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Associated project site reference", isIndexed: true, relation: "Project.id" },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete baseline support", isIndexed: true }
    ]
  },
  {
    name: "Activity",
    count: 12,
    color: "text-emerald-400",
    desc: "Standard Work Breakdown Structure (WBS) schedule timeline events",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "wbsCode", type: "String", constraint: "NOT NULL", desc: "Work Breakdown structure code hierarchy (e.g. 1.2.3.1)", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Task label (e.g. Column Reinforcement Pour)", isIndexed: false },
      { name: "plannedStart", type: "Timestamp", constraint: "NOT NULL", desc: "Scheduled baseline commencement date", isIndexed: false },
      { name: "plannedEnd", type: "Timestamp", constraint: "NOT NULL", desc: "Scheduled baseline target completion date", isIndexed: false },
      { name: "actualStart", type: "Timestamp", constraint: "NULL", desc: "Actual physical commencement logged on site", isIndexed: false },
      { name: "actualEnd", type: "Timestamp", constraint: "NULL", desc: "Actual progress verification closure logged", isIndexed: false },
      { name: "status", type: "String", constraint: "NOT NULL", desc: "Timeline status (NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED)", isIndexed: true },
      { name: "progressValue", type: "Float", constraint: "DEFAULT 0.0", desc: "Computed activity progress percentage (0.0 to 100.0)", isIndexed: false },
      { name: "scheduleId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Parent baseline schedule link", isIndexed: true, relation: "Schedule.id" },
      { name: "tradeId", type: "UUID", constraint: "FOREIGN KEY", desc: "Trade division constraint", isIndexed: true, relation: "Trade.id" }
    ]
  },
  {
    name: "Video",
    count: 11,
    color: "text-amber-400",
    desc: "Ingested video captures uploaded from drone scans or coordinate-mapped 360-degree helmet rigs",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "fileName", type: "String", constraint: "NOT NULL", desc: "S3 storage file name target", isIndexed: false },
      { name: "fileUrl", type: "String", constraint: "NOT NULL", desc: "Secure HTTPS AWS S3 static link", isIndexed: false },
      { name: "captureType", type: "String", constraint: "NOT NULL", desc: "Source type: DRONE_ORTHOMOSAIC or HELMET_360_WALK", isIndexed: true },
      { name: "status", type: "String", constraint: "NOT NULL", desc: "BullMQ progress status (PENDING, PROCESSING, COMPLETED, FAILED)", isIndexed: true },
      { name: "captureDate", type: "Timestamp", constraint: "NOT NULL", desc: "Date camera capture was executed on site", isIndexed: true },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Target project sector link", isIndexed: true, relation: "Project.id" },
      { name: "uploaderId", type: "UUID", constraint: "FOREIGN KEY", desc: "Operator profile link", isIndexed: true, relation: "User.id" }
    ]
  },
  {
    name: "Frame",
    count: 7,
    color: "text-amber-400",
    desc: "High-resolution video keyframes captured at specific temporal offsets for YOLO inference",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "frameNumber", type: "Int", constraint: "NOT NULL", desc: "Frame offset counter (e.g. 154)", isIndexed: false },
      { name: "timestamp", type: "Float", constraint: "NOT NULL", desc: "Video playback offset in decimal seconds (e.g. 15.4s)", isIndexed: false },
      { name: "imageUrl", type: "String", constraint: "NOT NULL", desc: "Extracted image block S3 storage location link", isIndexed: false },
      { name: "cameraExtrinsics", type: "Json", constraint: "NULL", desc: "Stored projection matrix metadata mapping coordinates back to IFC", isIndexed: false },
      { name: "videoId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Source video reference", isIndexed: true, relation: "Video.id" }
    ]
  },
  {
    name: "AIPrediction",
    count: 10,
    color: "text-amber-400",
    desc: "Computer vision inference results detailing detected classes, locations, and confidence levels",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "confidence", type: "Float", constraint: "NOT NULL", desc: "Probability coefficient from deep neural networks (e.g. 0.945)", isIndexed: false },
      { name: "classLabel", type: "String", constraint: "NOT NULL", desc: "CV model class (e.g., CPVC_PIPE, STEEL_REBAR)", isIndexed: true },
      { name: "boundingBox", type: "Json", constraint: "NOT NULL", desc: "2D image-space coordinates [ymin, xmin, ymax, xmax]", isIndexed: false },
      { name: "segmentationMaskUrl", type: "String", constraint: "NULL", desc: "Link to visual pixel overlay mask png", isIndexed: false },
      { name: "spatialCoords", type: "Json", constraint: "NULL", desc: "Derived real-world coordinates [X,Y,Z] relative to BIM alignment", isIndexed: false },
      { name: "status", type: "String", constraint: "NOT NULL", desc: "Operator review state (UNREVIEWED, VERIFIED, REJECTED)", isIndexed: true },
      { name: "frameId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Associated frame", isIndexed: true, relation: "Frame.id" },
      { name: "bimElementId", type: "UUID", constraint: "FOREIGN KEY NULL", desc: "Closest correlated 3D virtual BIM element GUID link", isIndexed: true, relation: "BimElement.id" }
    ]
  },
  {
    name: "Progress",
    count: 8,
    color: "text-emerald-400",
    desc: "Historical progress events storing measured volumetric data and audit details",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "value", type: "Float", constraint: "NOT NULL", desc: "Observed progress value (0.0 to 100.0)", isIndexed: false },
      { name: "volumeObserved", type: "Float", constraint: "NULL", desc: "Observed raw physical volume (e.g. concrete m³)", isIndexed: false },
      { name: "measuredAt", type: "Timestamp", constraint: "NOT NULL", desc: "Audit date time of tracking verification", isIndexed: true },
      { name: "method", type: "String", constraint: "NOT NULL", desc: "Inference tracking origin: AI_CV_INFERENCE or MANUAL_CORRECTED", isIndexed: false },
      { name: "activityId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Parent schedule timeline task", isIndexed: true, relation: "Activity.id" },
      { name: "bimElementId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Associated virtual geometry component", isIndexed: true, relation: "BimElement.id" }
    ]
  },
  {
    name: "Issue",
    count: 13,
    color: "text-red-400",
    desc: "Detected site schedule overruns, coordination clashes, and structural misalignments",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "code", type: "String", constraint: "@unique", desc: "India-wide indexed clash log code (e.g., CLSH-2026-0042)", isIndexed: true },
      { name: "type", type: "String", constraint: "NOT NULL", desc: "Discrepancy category: CLASH, MISSING_ELEMENT, ALIGNMENT_ERROR, DELAY", isIndexed: true },
      { name: "severity", type: "String", constraint: "NOT NULL", desc: "Timeline risk: CRITICAL, HIGH, MEDIUM, LOW", isIndexed: true },
      { name: "status", type: "String", constraint: "NOT NULL", desc: "Remediation state: OPEN, IN_PROGRESS, RESOLVED, EXEMPTED", isIndexed: true },
      { name: "title", type: "String", constraint: "NOT NULL", desc: "Short descriptive problem summary", isIndexed: false },
      { name: "description", type: "String", constraint: "NOT NULL", desc: "Detailed breakdown of the spatial displacement", isIndexed: false },
      { name: "deviationAmount", type: "Float", constraint: "NULL", desc: "Measured distance displacement in millimeters (e.g., 24.5mm)", isIndexed: false },
      { name: "remediationPlan", type: "String", constraint: "NULL", desc: "Gemini-suggested corrective construction WBS tasks", isIndexed: false },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Target project sector", isIndexed: true, relation: "Project.id" },
      { name: "tradeId", type: "UUID", constraint: "FOREIGN KEY", desc: "Faulty trade allocation", isIndexed: true, relation: "Trade.id" }
    ]
  },
  {
    name: "Comment",
    count: 7,
    color: "text-red-400",
    desc: "Coordination messaging threads linked directly to open site issues and coordination tasks",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "text", type: "String", constraint: "NOT NULL", desc: "Operator feedback message body", isIndexed: false },
      { name: "authorId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "User identity block", isIndexed: true, relation: "User.id" },
      { name: "issueId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Target issue mapping", isIndexed: true, relation: "Issue.id" },
      { name: "createdAt", type: "Timestamp", constraint: "now()", desc: "Creation date timestamp", isIndexed: false },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete flag", isIndexed: true }
    ]
  },
  {
    name: "File",
    count: 8,
    color: "text-red-400",
    desc: "CAD designs, 3D point cloud scans, and PDF documents loaded for manual audits",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "name", type: "String", constraint: "NOT NULL", desc: "Display filename", isIndexed: false },
      { name: "fileUrl", type: "String", constraint: "NOT NULL", desc: "S3 object identifier path link", isIndexed: false },
      { name: "fileType", type: "String", constraint: "NOT NULL", desc: "Formats: IFC, POINT_CLOUD, PDF, PNG, JSON", isIndexed: true },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Project mapping", isIndexed: true, relation: "Project.id" },
      { name: "deletedAt", type: "Timestamp", constraint: "NULL", desc: "Soft-delete timestamp", isIndexed: true }
    ]
  },
  {
    name: "Report",
    count: 11,
    color: "text-red-400",
    desc: "State regulatory RERA audit timelines and engineering clash aggregate KPIs",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "code", type: "String", constraint: "@unique", desc: "Unique regulatory document ID (e.g. RERA-AUD-2026-W12)", isIndexed: true },
      { name: "title", type: "String", constraint: "NOT NULL", desc: "Document title header", isIndexed: false },
      { name: "type", type: "String", constraint: "NOT NULL", desc: "RERA_AUDIT, DAILY_PROGRESS, or CLASH_SUMMARY", isIndexed: true },
      { name: "status", type: "String", constraint: "NOT NULL", desc: "Document flow state: DRAFT, SUBMITTED, APPROVED", isIndexed: true },
      { name: "url", type: "String", constraint: "NULL", desc: "PDF S3 document archive link", isIndexed: false },
      { name: "metadataSummary", type: "Json", constraint: "NULL", desc: "Aggregated quantitative percentage parameters", isIndexed: false },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Project target link", isIndexed: true, relation: "Project.id" },
      { name: "authorId", type: "UUID", constraint: "FOREIGN KEY", desc: "Author profile", isIndexed: true, relation: "User.id" }
    ]
  },
  {
    name: "Notification",
    count: 6,
    color: "text-red-400",
    desc: "Timeline slipping notifications and critical structural displacement warning relays",
    fields: [
      { name: "id", type: "UUID", constraint: "@id", desc: "Primary Key", isIndexed: true },
      { name: "title", type: "String", constraint: "NOT NULL", desc: "Header summary", isIndexed: false },
      { name: "body", type: "String", constraint: "NOT NULL", desc: "Notification description details", isIndexed: false },
      { name: "type", type: "String", constraint: "NOT NULL", desc: "Alert categorization: CRITICAL_ANOMALY, TIMELINE_SLIP, REPORT_READY", isIndexed: true },
      { name: "isRead", type: "Boolean", constraint: "DEFAULT false", desc: "Read checkpoint state", isIndexed: true },
      { name: "userId", type: "UUID", constraint: "FOREIGN KEY ON DELETE CASCADE", desc: "Targeted recipient link", isIndexed: true, relation: "User.id" }
    ]
  },
  {
    name: "AuditLog",
    count: 11,
    color: "text-red-400",
    desc: "Transactional data changes tracking historical versions, soft deletes, and user action trails",
    fields: [
      { name: "id", type: "UUID", constraint: "@id @default(uuid())", desc: "Primary Key", isIndexed: true },
      { name: "action", type: "String", constraint: "NOT NULL", desc: "Trigger action: INSERT, UPDATE, DELETE, RESTORE, CV_INFERENCE", isIndexed: true },
      { name: "tableName", type: "String", constraint: "NOT NULL", desc: "Manipulated database table", isIndexed: true },
      { name: "recordId", type: "String", constraint: "NOT NULL", desc: "GUID of target record being audited", isIndexed: true },
      { name: "oldValues", type: "Json", constraint: "NULL", desc: "Before modification snapshot state (for historical restore)", isIndexed: false },
      { name: "newValues", type: "Json", constraint: "NULL", desc: "After modification snapshot state", isIndexed: false },
      { name: "userId", type: "UUID", constraint: "FOREIGN KEY NULL", desc: "User actor, NULL indicates system trigger", isIndexed: true, relation: "User.id" },
      { name: "projectId", type: "UUID", constraint: "FOREIGN KEY NULL", desc: "Target project site context link", isIndexed: true, relation: "Project.id" },
      { name: "createdAt", type: "Timestamp", constraint: "DEFAULT now()", desc: "Audit timestamp", isIndexed: true }
    ]
  }
];

export const PRISMA_SCHEMA_CODE = `// ==========================================
// BuildTrace India: Enterprise PostgreSQL Schema
// Powered by Prisma v5 - Conforms to RERA Site Audits
// ==========================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------
// 1. IDENTITY & MULTI-TENANCY GOVERNANCE
// ------------------------------------------

model Organization {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  reraLicense   String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // Soft Delete support

  users         User[]
  projects      Project[]
  roles         Role[]

  @@index([slug])
  @@index([deletedAt])
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?      // Soft Delete support

  organizationId  String
  organization    Organization   @relation(fields: [organizationId], references: [id])

  userRoles       UserRole[]
  comments        Comment[]
  notifications   Notification[]
  auditLogs       AuditLog[]
  reportsCreated  Report[]       @relation("ReportAuthor")
  videosUploaded  Video[]        @relation("VideoUploader")

  @@index([email])
  @@index([organizationId])
  @@index([deletedAt])
}

model Role {
  id              String           @id @default(uuid())
  name            String
  description     String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  deletedAt       DateTime?

  organizationId  String
  organization    Organization     @relation(fields: [organizationId], references: [id])

  permissions     RolePermission[]
  userRoles       UserRole[]

  @@unique([name, organizationId])
  @@index([organizationId])
}

model Permission {
  id          String           @id @default(uuid())
  action      String           @unique // e.g., "project:write", "bim:view", "ai:run"
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model UserRole {
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  projectId String?  // Scope of permission (NULL indicates global Organization scope)
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([userId])
  @@index([roleId])
}

// ------------------------------------------
// 2. PHYSICAL & SPATIAL INFRASTRUCTURE
// ------------------------------------------

model Project {
  id              String        @id @default(uuid())
  name            String
  code            String        @unique
  reraId          String?       @unique // State RERA audit code reference
  latitude        Float?
  longitude       Float?
  address         String?
  city            String?
  state           String?
  postalCode      String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id])

  buildings       Building[]
  schedules       Schedule[]
  videos          Video[]
  issues          Issue[]
  reports         Report[]
  files           File[]
  userRoles       UserRole[]
  auditLogs       AuditLog[]

  @@index([organizationId])
  @@index([deletedAt])
}

model Building {
  id          String    @id @default(uuid())
  name        String
  code        String    // e.g., "TOWER-A"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  floors      Floor[]

  @@unique([code, projectId])
  @@index([projectId])
}

model Floor {
  id          String    @id @default(uuid())
  name        String    // e.g., "First Floor"
  levelNumber Int       // e.g., 1 (for ordering)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  buildingId  String
  building    Building  @relation(fields: [buildingId], references: [id], onDelete: Cascade)

  rooms       Room[]
  bimElements BimElement[]

  @@unique([levelNumber, buildingId])
  @@index([buildingId])
}

model Room {
  id          String    @id @default(uuid())
  name        String    // e.g., "Electrical Hub Room"
  code        String?   // Coordinate grid sector
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  floorId     String
  floor       Floor     @relation(fields: [floorId], references: [id], onDelete: Cascade)

  bimElements BimElement[]

  @@index([floorId])
}

// ------------------------------------------
// 3. BIM GEOMETRY & TRADES DISCIPLINE
// ------------------------------------------

model Trade {
  id          String    @id @default(uuid())
  name        String    @unique // e.g., "Structural", "MEP", "Architectural"
  code        String    @unique // e.g., "STR", "MEP", "ARC"
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  activities  Activity[]
  bimElements BimElement[]
  issues      Issue[]
}

model BimElement {
  id            String    @id @default(uuid())
  guid          String    @unique // CAD Standard IFC GUID
  name          String
  type          String    // e.g., "IfcWallStandardCase"
  properties    Json?     // IFC structural metadata values
  boundingBox   Json?     // Bounding coordinate limits [xmin, ymin, zmin, xmax, ymax, zmax]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  floorId       String
  floor         Floor     @relation(fields: [floorId], references: [id])
  roomId        String?
  room          Room?     @relation(fields: [roomId], references: [id])
  tradeId       String
  trade         Trade     @relation(fields: [tradeId], references: [id])

  progressRecords Progress[]
  aiPredictions   AIPrediction[]
  issues          IssueBimElement[]

  @@index([floorId])
  @@index([tradeId])
  @@index([guid])
}

// ------------------------------------------
// 4. TIMELINE SCHEDULING BASELINES
// ------------------------------------------

model Schedule {
  id            String     @id @default(uuid())
  name          String     // e.g., "RERA Baseline Target"
  isBaseline    Boolean    @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?

  projectId     String
  project       Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  activities    Activity[]

  @@index([projectId])
}

model Activity {
  id            String     @id @default(uuid())
  wbsCode       String     // Work Breakdown Structure path
  name          String     // e.g., "Reinforcement Slab Pouring"
  plannedStart  DateTime
  plannedEnd    DateTime
  actualStart   DateTime?
  actualEnd     DateTime?
  status        String     // NOT_STARTED | IN_PROGRESS | COMPLETED | DELAYED
  progressValue Float      @default(0.0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  deletedAt     DateTime?

  scheduleId    String
  schedule      Schedule   @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  tradeId       String
  trade         Trade      @relation(fields: [tradeId], references: [id])

  progressRecords Progress[]

  @@index([scheduleId])
  @@index([tradeId])
}

// ------------------------------------------
// 5. VIDEO INGESTION & CV INFERENCE PIPELINE
// ------------------------------------------

model Video {
  id            String         @id @default(uuid())
  fileName      String
  fileUrl       String
  captureType   String         // DRONE_ORTHOMOSAIC | HELMET_360_WALK
  status        String         // PENDING | PROCESSING | COMPLETED | FAILED (BullMQ trace)
  captureDate   DateTime
  duration      Int?
  fileSize      BigInt?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?

  projectId     String
  project       Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploaderId    String
  uploader      User           @relation("VideoUploader", fields: [uploaderId], references: [id])

  frames        Frame[]
  issues        Issue[]

  @@index([projectId])
  @@index([status])
}

model Frame {
  id              String         @id @default(uuid())
  frameNumber     Int
  timestamp       Float          // Offset offset in video seconds
  imageUrl        String
  cameraExtrinsics Json?         // Coordinate projection vectors for 3D mapping
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  videoId         String
  video           Video          @relation(fields: [videoId], references: [id], onDelete: Cascade)

  aiPredictions   AIPrediction[]

  @@index([videoId])
}

model AIPrediction {
  id                  String     @id @default(uuid())
  confidence          Float      // Inference certainty (0.0 to 1.0)
  classLabel          String     // YOLO category: e.g., CPVC_PIPE, REBAR_CONCRETE
  boundingBox         Json       // ymin, xmin, ymax, xmax coordinates
  segmentationMaskUrl String?
  spatialCoords       Json?      // Calibrated world coordinate lock [X,Y,Z]
  status              String     // UNREVIEWED | VERIFIED | REJECTED
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  frameId             String
  frame               Frame      @relation(fields: [frameId], references: [id], onDelete: Cascade)
  bimElementId        String?
  bimElement          BimElement? @relation(fields: [bimElementId], references: [id])

  @@index([frameId])
  @@index([bimElementId])
}

model Progress {
  id              String     @id @default(uuid())
  value           Float      // Calibrated element progress completion %
  volumeObserved  Float?     // Material measurement tracking (e.g. m³)
  measuredAt      DateTime
  method          String     // AI_CV_INFERENCE | MANUAL_CORRECTED
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  activityId      String
  activity        Activity   @relation(fields: [activityId], references: [id], onDelete: Cascade)
  bimElementId    String
  bimElement      BimElement @relation(fields: [bimElementId], references: [id], onDelete: Cascade)

  @@index([activityId])
  @@index([bimElementId])
  @@index([measuredAt])
}

// ------------------------------------------
// 6. SITE DISCREPANCIES & AUDIT TRAILS
// ------------------------------------------

model Issue {
  id              String             @id @default(uuid())
  code            String             @unique // e.g., CLSH-2026-0042
  type            String             // CLASH | MISSING_ELEMENT | ALIGNMENT_ERROR | DELAY
  severity        String             // CRITICAL | HIGH | MEDIUM | LOW
  status          String             // OPEN | IN_PROGRESS | RESOLVED | EXEMPTED
  title           String
  description     String
  deviationAmount Float?             // Deviation measurement error in millimeters
  remediationPlan String?            // AI-remediated workflow tasks suggestion
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  deletedAt       DateTime?

  projectId       String
  project         Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tradeId         String
  trade           Trade              @relation(fields: [tradeId], references: [id])
  videoId         String?
  video           Video?             @relation(fields: [videoId], references: [id])

  elements        IssueBimElement[]
  comments        Comment[]
  files           File[]

  @@index([projectId])
  @@index([status])
  @@index([severity])
}

model IssueBimElement {
  issueId      String
  issue        Issue      @relation(fields: [issueId], references: [id], onDelete: Cascade)
  bimElementId String
  bimElement   BimElement @relation(fields: [bimElementId], references: [id], onDelete: Cascade)

  @@id([issueId, bimElementId])
}

model Comment {
  id          String    @id @default(uuid())
  text        String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  issueId     String
  issue       Issue     @relation(fields: [issueId], references: [id], onDelete: Cascade)

  @@index([issueId])
}

model File {
  id          String    @id @default(uuid())
  name        String
  fileUrl     String
  fileType    String    // IFC | POINT_CLOUD | PDF | PNG | JSON
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  issueId     String?
  issue       Issue?    @relation(fields: [issueId], references: [id])

  @@index([projectId])
}

model Report {
  id              String    @id @default(uuid())
  code            String    @unique // e.g. RERA-AUD-2026-WK12
  title           String
  type            String    // RERA_AUDIT | DAILY_PROGRESS | CLASH_SUMMARY
  status          String    // DRAFT | SUBMITTED | APPROVED
  url             String?
  metadataSummary Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  projectId       String
  project         Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  authorId        String
  author          User      @relation("ReportAuthor", fields: [authorId], references: [id])

  @@index([projectId])
}

model Notification {
  id          String    @id @default(uuid())
  title       String
  body        String
  type        String    // CRITICAL_ANOMALY | TIMELINE_SLIP | REPORT_READY
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
}

// ------------------------------------------
// 7. SYSTEM TRANSACTION AUDITING
// ------------------------------------------

model AuditLog {
  id          String    @id @default(uuid())
  action      String    // INSERT | UPDATE | DELETE | RESTORE | CV_INFERENCE
  tableName   String    // target table namespace
  recordId    String    // Primary GUID of target record
  oldValues   Json?     // Snapshot state BEFORE edit
  newValues   Json?     // Snapshot state AFTER edit
  createdAt   DateTime  @default(now())

  userId      String?   // NULL indicates machine system account
  user        User?     @relation(fields: [userId], references: [id])
  projectId   String?
  project     Project?  @relation(fields: [projectId], references: [id])

  @@index([tableName, recordId])
  @@index([userId])
  @@index([projectId])
  @@index([createdAt])
}
`;
