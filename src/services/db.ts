import { PROJECTS_WORKSPACE_DATA, PROJECTS_WORKSPACE_DATA as masterData, DailyLog } from "../data";
import { 
  Project, Building, Floor, Room, Trade, Schedule, 
  Issue, Document, Photo, Camera, Inspection, Worker, 
  Notification, Analytics, User, Permission, Organization 
} from "../models/domain";

// In-Memory Enterprise Database
class InMemoryDB {
  private organizations: Organization[] = [
    {
      id: "org-tracprogress",
      name: "TracProgress® Enterprises Ltd.",
      type: "Developer/General Contractor",
      licenseNo: "LC-2026-89472",
      domain: "tracprogress.com",
      establishedDate: "2024-01-15",
      headquarters: "Bengaluru, India"
    }
  ];

  private projects: Project[] = [];
  private buildings: Building[] = [];
  private floors: Floor[] = [];
  private rooms: Room[] = [];
  private trades: Trade[] = [
    { id: "trade-con", name: "Concrete Structural Work", code: "CON", activeWorkers: 42, contractor: "L&T Construction", headCount: 50 },
    { id: "trade-mep", name: "Mechanical & Electrical Plinth", code: "MEP", activeWorkers: 28, contractor: "Sterling & Wilson", headCount: 35 },
    { id: "trade-plu", name: "Plumbing Infrastructure", code: "PLU", activeWorkers: 15, contractor: "Blue Star Ltd.", headCount: 20 },
    { id: "trade-hvac", name: "HVAC Installation", code: "HVAC", activeWorkers: 19, contractor: "Carrier Enterprise", headCount: 25 },
    { id: "trade-dry", name: "Drywall & Partitions", code: "DRY", activeWorkers: 24, contractor: "Gyproc India", headCount: 30 }
  ];
  private schedules: Schedule[] = [];
  private issues: Issue[] = [];
  private documents: Document[] = [];
  private photos: Photo[] = [];
  private cameras: Camera[] = [
    { id: "cam-01", name: "North Craneway Cam", location: "Block B Phase 1", status: "active" },
    { id: "cam-02", name: "Ground Level Entrance PTZ", location: "Main Access Gate", status: "active" },
    { id: "cam-03", name: "MEP Floor Overview Static", location: "Floor 1 Mechanical Room", status: "inactive" }
  ];
  private inspections: Inspection[] = [];
  private workers: Worker[] = [];
  private notifications: Notification[] = [
    { id: "not-01", title: "CV Variance Found", message: "MEP duct clash detected on ground level by AI scan engine.", timestamp: "2 hours ago", type: "alert", read: false },
    { id: "not-02", title: "Schedule Slip Warning", message: "Concrete works are currently trending 4 days behind baseline.", timestamp: "5 hours ago", type: "warning", read: false },
    { id: "not-03", title: "Daily Report Signed", message: "Staff Operator verified Week 3 photogrammetry scan compliance.", timestamp: "1 day ago", type: "info", read: true }
  ];
  private analytics: Analytics[] = [];
  private users: User[] = [
    { id: "usr-01", name: "Staff Operator (You)", email: "operator@tracprogress.com", role: "Principal Project Engineer", status: "active" },
    { id: "usr-02", name: "Anand Sen", email: "anand.sen@constructions.in", role: "Lead MEP Quality Inspector", status: "active" },
    { id: "usr-03", name: "Priya Rao", email: "priya.rao@civilcon.co", role: "Structural Engineering Lead", status: "active" }
  ];
  private permissions: Permission[] = [
    { id: "perm-01", role: "Principal Project Engineer", resource: "projects", actions: ["create", "read", "update", "delete"] },
    { id: "perm-02", role: "Principal Project Engineer", resource: "issues", actions: ["create", "read", "update", "delete"] }
  ];

  private listeners: (() => void)[] = [];

  constructor() {
    this.initializeFromMasterData();
  }

  private initializeFromMasterData() {
    // Populate projects, schedules, issues, documents, daily logs, and analytics from masterData
    Object.entries(masterData).forEach(([projectId, workspace]) => {
      // 1. Project
      this.projects.push({
        id: projectId,
        name: workspace.stats.name,
        location: workspace.stats.location,
        totalCost: workspace.stats.totalCost,
        reraId: workspace.stats.reraId,
        constructionArea: workspace.stats.constructionArea,
        targetDate: workspace.stats.targetDate,
        overallProgress: workspace.stats.overallProgress,
        status: workspace.stats.status as any || "active"
      });

      // 2. Buildings (Generate mock building per project)
      const bldId = `bld-${projectId}`;
      this.buildings.push({
        id: bldId,
        projectId,
        name: `${workspace.stats.name} - Phase 1 Tower`,
        totalFloors: 5,
        status: "under_construction",
        footprintArea: workspace.stats.constructionArea
      });

      // Floors
      const floorNames = ["Ground Floor", "First Floor", "Second Floor", "Third Floor", "Fourth Floor"];
      floorNames.forEach((name, idx) => {
        this.floors.push({
          id: `floor-${projectId}-${idx}`,
          buildingId: bldId,
          name,
          status: idx === 0 ? "completed" : idx <= 2 ? "in_progress" : "not_started",
          completionPercentage: idx === 0 ? 100 : idx === 1 ? 60 : idx === 2 ? 30 : 0,
          sequence: idx
        });
      });

      // 3. Schedules (From constructionPhases)
      workspace.constructionPhases.forEach((phase) => {
        this.schedules.push({
          id: phase.id,
          name: phase.name,
          startDate: phase.startDate,
          endDate: phase.endDate,
          progress: phase.progress,
          status: phase.status === "completed" ? "completed" : phase.status === "active" ? "in_progress" : phase.status === "delayed" ? "delayed" : "not_started",
          criticalPath: phase.isCriticalPath,
          assignedTradeId: this.trades.find(t => t.name.toLowerCase().includes(phase.subcontractor.toLowerCase()))?.id || "trade-con",
          dependsOn: phase.predecessors
        });
      });

      // 4. Issues (From siteAnomalies + dashboardIssues)
      workspace.siteAnomalies.forEach((anom) => {
        this.issues.push({
          id: anom.id,
          elementId: anom.elementId,
          elementName: anom.elementName,
          category: anom.category,
          title: anom.title,
          description: anom.description,
          level: anom.level,
          deviation: anom.deviation,
          possibleCause: anom.possibleCause,
          status: anom.status,
          detectedAt: anom.detectedAt,
          assignedTradeId: "trade-mep"
        });
      });

      // 5. Documents (From recentUploads)
      workspace.recentUploads.forEach((doc) => {
        this.documents.push({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          date: doc.date,
          uploader: doc.uploader,
          status: doc.status
        });
      });

      // 6. Workers (Generate mock workers)
      this.workers.push(
        { id: `w-${projectId}-01`, name: "Rajesh Kumar", tradeId: "trade-con", role: "Mason", contact: "+91 98765 43210", status: "active" },
        { id: `w-${projectId}-02`, name: "Amit Sharma", tradeId: "trade-mep", role: "Electrician", contact: "+91 98765 43211", status: "active" },
        { id: `w-${projectId}-03`, name: "Suresh Patil", tradeId: "trade-plu", role: "Plumber", contact: "+91 98765 43212", status: "active" }
      );

      // 7. Photos
      this.photos.push({
        id: `photo-${projectId}-01`,
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
        capturedAt: "Week 3",
        caption: "Orthomosaic Drone Map Layer Ground Level",
        tag: "orthomosaic",
        projectId
      });
    });
  }

  // Subscribe to changes (Zustand style)
  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Setters/Getters
  public getOrganizations() { return this.organizations; }
  public getProjects() { return this.projects; }
  public getBuildings() { return this.buildings; }
  public getFloors() { return this.floors; }
  public getRooms() { return this.rooms; }
  public getTrades() { return this.trades; }
  public getSchedules() { return this.schedules; }
  public getIssues() { return this.issues; }
  public getDocuments() { return this.documents; }
  public getPhotos() { return this.photos; }
  public getCameras() { return this.cameras; }
  public getInspections() { return this.inspections; }
  public getWorkers() { return this.workers; }
  public getNotifications() { return this.notifications; }
  public getAnalytics() { return this.analytics; }
  public getUsers() { return this.users; }
  public getPermissions() { return this.permissions; }

  // Mutators with notification triggers
  public updateProject(id: string, updates: Partial<Project>) {
    this.projects = this.projects.map(p => p.id === id ? { ...p, ...updates } : p);
    this.notify();
  }

  public addProject(p: Project) {
    this.projects.push(p);
    this.notify();
  }

  public addIssue(issue: Issue) {
    this.issues.unshift(issue);
    this.notify();
  }

  public updateIssue(id: string, updates: Partial<Issue>) {
    this.issues = this.issues.map(i => i.id === id ? { ...i, ...updates } : i);
    this.notify();
  }

  public addSchedule(sch: Schedule) {
    this.schedules.push(sch);
    this.notify();
  }

  public updateSchedule(id: string, updates: Partial<Schedule>) {
    this.schedules = this.schedules.map(s => s.id === id ? { ...s, ...updates } : s);
    this.notify();
  }

  public addDocument(doc: Document) {
    this.documents.unshift(doc);
    this.notify();
  }

  public updateDocument(id: string, updates: Partial<Document>) {
    this.documents = this.documents.map(d => d.id === id ? { ...d, ...updates } : d);
    this.notify();
  }

  public addNotification(notif: Notification) {
    this.notifications.unshift(notif);
    this.notify();
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.notify();
  }
}

export const db = new InMemoryDB();
