import { db } from "./db";
import { BaseService } from "./base";
import { 
  Organization, Project, Building, Floor, Room, Trade, Schedule, 
  Issue, Document, Photo, Camera, Inspection, Worker, 
  Notification, Analytics, User, Permission 
} from "../models/domain";

// 1. Organization Service
export class OrganizationServiceClass extends BaseService<Organization> {
  constructor() {
    super(() => db.getOrganizations());
  }
}
export const OrganizationService = new OrganizationServiceClass();

// 2. Project Service
export class ProjectServiceClass extends BaseService<Project> {
  constructor() {
    super(
      () => db.getProjects(),
      undefined,
      (id, item) => db.updateProject(id, item),
      (item) => db.addProject(item)
    );
  }

  async getProjectByReraId(reraId: string): Promise<Project | null> {
    const projects = await this.getAll();
    return projects.find(p => p.reraId === reraId) || null;
  }
}
export const ProjectService = new ProjectServiceClass();

// 3. Building Service
export class BuildingServiceClass extends BaseService<Building> {
  constructor() {
    super(() => db.getBuildings());
  }

  async getByProjectId(projectId: string): Promise<Building[]> {
    return this.filter(b => b.projectId === projectId);
  }
}
export const BuildingService = new BuildingServiceClass();

// 4. Floor Service
export class FloorServiceClass extends BaseService<Floor> {
  constructor() {
    super(() => db.getFloors());
  }

  async getByBuildingId(buildingId: string): Promise<Floor[]> {
    const floors = await this.getAll();
    return floors
      .filter(f => f.buildingId === buildingId)
      .sort((a, b) => a.sequence - b.sequence);
  }
}
export const FloorService = new FloorServiceClass();

// 5. Room Service
export class RoomServiceClass extends BaseService<Room> {
  constructor() {
    super(() => db.getRooms());
  }

  async getByFloorId(floorId: string): Promise<Room[]> {
    return this.filter(r => r.floorId === floorId);
  }
}
export const RoomService = new RoomServiceClass();

// 6. Trade Service
export class TradeServiceClass extends BaseService<Trade> {
  constructor() {
    super(() => db.getTrades());
  }
}
export const TradeService = new TradeServiceClass();

// 7. Schedule Service
export class ScheduleServiceClass extends BaseService<Schedule> {
  constructor() {
    super(
      () => db.getSchedules(),
      undefined,
      (id, item) => db.updateSchedule(id, item),
      (item) => db.addSchedule(item)
    );
  }

  async getCriticalPath(): Promise<Schedule[]> {
    return this.filter(s => s.criticalPath);
  }
}
export const ScheduleService = new ScheduleServiceClass();

// 8. Issue Service (Remediation anomalies and site issues)
export class IssueServiceClass extends BaseService<Issue> {
  constructor() {
    super(
      () => db.getIssues(),
      undefined,
      (id, item) => db.updateIssue(id, item),
      (item) => db.addIssue(item)
    );
  }

  async getOpenIssues(): Promise<Issue[]> {
    return this.filter(i => i.status === "open");
  }

  async getByLevel(level: "low" | "medium" | "high" | "critical"): Promise<Issue[]> {
    return this.filter(i => i.level === level);
  }
}
export const IssueService = new IssueServiceClass();

// 9. Document Service
export class DocumentServiceClass extends BaseService<Document> {
  constructor() {
    super(
      () => db.getDocuments(),
      undefined,
      (id, item) => db.updateDocument(id, item),
      (item) => db.addDocument(item)
    );
  }

  async getByType(type: "video" | "laser" | "cad" | "report"): Promise<Document[]> {
    return this.filter(d => d.type === type);
  }
}
export const DocumentService = new DocumentServiceClass();

// 10. Photo Service
export class PhotoServiceClass extends BaseService<Photo> {
  constructor() {
    super(() => db.getPhotos());
  }

  async getByProjectId(projectId: string): Promise<Photo[]> {
    return this.filter(p => p.projectId === projectId);
  }
}
export const PhotoService = new PhotoServiceClass();

// 11. BIM Models Service
export interface BIMModel {
  id: string;
  projectId: string;
  version: string;
  fileSize: string;
  createdAt: string;
  createdBy: string;
  active: boolean;
}
export class BIMModelServiceClass extends BaseService<BIMModel> {
  private mockBimModels: BIMModel[] = [
    { id: "bim-01", projectId: "btp-block-b", version: "v4.2-IFC", fileSize: "128 MB", createdAt: "2026-06-12", createdBy: "BIM Coordinator", active: true },
    { id: "bim-02", projectId: "hyderabad-it-hub", version: "v3.1-IFC", fileSize: "95 MB", createdAt: "2026-05-18", createdBy: "BIM Architect", active: true }
  ];
  constructor() {
    super(() => this.mockBimModels, (items) => { this.mockBimModels = items; });
  }
}
export const BIMModelService = new BIMModelServiceClass();

// 12. AI Analysis Service
export interface AIAnalysisResult {
  id: string;
  elementId: string;
  confidenceScore: number;
  anomalyDetected: boolean;
  notes: string;
  suggestedAction: string;
}
export class AiAnalysisServiceClass extends BaseService<AIAnalysisResult> {
  private mockAnalysis: AIAnalysisResult[] = [
    { id: "ai-01", elementId: "col_c4", confidenceScore: 94.6, anomalyDetected: true, notes: "Structural concrete compaction variance detected at grid B4.", suggestedAction: "Core drilling or ultrasound testing suggested." }
  ];
  constructor() {
    super(() => this.mockAnalysis, (items) => { this.mockAnalysis = items; });
  }

  async analyzeSiteWalkPhoto(fileUrl: string): Promise<AIAnalysisResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `ai-${Date.now()}`,
          elementId: "gen-ele",
          confidenceScore: 98.2,
          anomalyDetected: false,
          notes: "CV completed with 0 variances found relative to reference coordinate framework.",
          suggestedAction: "Mark status as verified in BIM workspace."
        });
      }, 1000);
    });
  }
}
export const AiAnalysisService = new AiAnalysisServiceClass();

// 13. Notification Service
export class NotificationServiceClass extends BaseService<Notification> {
  constructor() {
    super(
      () => db.getNotifications(),
      undefined,
      undefined,
      (item) => db.addNotification(item)
    );
  }

  async getUnread(): Promise<Notification[]> {
    return this.filter(n => !n.read);
  }

  async markAsRead(id: string): Promise<boolean> {
    db.markNotificationRead(id);
    return true;
  }
}
export const NotificationService = new NotificationServiceClass();

// 14. Report Service
export interface PerformanceReport {
  id: string;
  name: string;
  type: string;
  format: "PDF" | "CSV" | "XLSX";
  generatedAt: string;
  url: string;
}
export class ReportServiceClass extends BaseService<PerformanceReport> {
  private mockReports: PerformanceReport[] = [
    { id: "rep-01", name: "Structural Integrity Audit Report Week 3", type: "CV Verification Report", format: "PDF", generatedAt: "2026-07-12", url: "#" }
  ];
  constructor() {
    super(() => this.mockReports, (items) => { this.mockReports = items; });
  }
}
export const ReportService = new ReportServiceClass();

// 15. User Service
export class UserServiceClass extends BaseService<User> {
  constructor() {
    super(() => db.getUsers());
  }
}
export const UserService = new UserServiceClass();

// 16. Permission Service
export class PermissionServiceClass extends BaseService<Permission> {
  constructor() {
    super(() => db.getPermissions());
  }

  async checkPermission(role: string, resource: string, action: "create" | "read" | "update" | "delete"): Promise<boolean> {
    const perms = await this.getAll();
    const found = perms.find(p => p.role === role && p.resource === resource);
    return found ? found.actions.includes(action) : false;
  }
}
export const PermissionService = new PermissionServiceClass();
