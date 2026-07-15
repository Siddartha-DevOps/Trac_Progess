import { WorkerPPEState, Incident, NearMiss, Hazard, SafetyAudit, CameraStream, VideoEvent } from "./types";
import { 
  MOCK_WORKERS, 
  MOCK_INCIDENTS, 
  MOCK_NEAR_MISSES, 
  MOCK_HAZARDS, 
  MOCK_AUDITS, 
  MOCK_CAMERAS, 
  MOCK_VIDEO_EVENTS 
} from "./safetyMockData";

// In-memory persistent states for demo longevity
let workersStore = [...MOCK_WORKERS];
let incidentsStore = [...MOCK_INCIDENTS];
let nearMissesStore = [...MOCK_NEAR_MISSES];
let hazardsStore = [...MOCK_HAZARDS];
let auditsStore = [...MOCK_AUDITS];
let camerasStore = [...MOCK_CAMERAS];
let notificationsStore: Array<{
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  read: boolean;
}> = [
  {
    id: "ALR-001",
    type: "Missing PPE",
    title: "Critical PPE Deviation",
    message: "Worker Ananya Sen detected at Level 3 Facade without a safety harness connection.",
    timestamp: "10 minutes ago",
    severity: "Critical",
    read: false
  },
  {
    id: "ALR-002",
    type: "Critical Incident",
    title: "Slab Opening Unguarded",
    message: "Edge protection barriers removed near West Elevator Shaft Core.",
    timestamp: "1 hour ago",
    severity: "Critical",
    read: false
  },
  {
    id: "ALR-003",
    type: "Permit Expired",
    title: "Permit to Work Warning",
    message: "Hot-work welding permit #PTW-284 expired for Mechanical Room Level 2.",
    timestamp: "2 hours ago",
    severity: "Medium",
    read: false
  },
  {
    id: "ALR-004",
    type: "Audit Due",
    title: "Pending Site Audit",
    message: "Weekly Scaffold Structural Safety Audit is due for submission.",
    timestamp: "4 hours ago",
    severity: "Low",
    read: true
  }
];

/**
 * 1. PPEService
 * Handles worker safety states, PPE detections, compliance rollups
 */
export const PPEService = {
  getWorkers(): WorkerPPEState[] {
    return workersStore;
  },
  
  getWorkerById(id: string): WorkerPPEState | undefined {
    return workersStore.find(w => w.id === id);
  },
  
  getComplianceSummary() {
    const total = workersStore.length;
    const compliant = workersStore.filter(w => w.ppeStatus === "Compliant").length;
    const warning = workersStore.filter(w => w.ppeStatus === "Warning").length;
    const violated = workersStore.filter(w => w.ppeStatus === "Violated").length;
    
    const averageCompliance = parseFloat((workersStore.reduce((acc, w) => acc + w.compliancePct, 0) / total).toFixed(1));
    
    return {
      total,
      compliant,
      warning,
      violated,
      averageCompliance
    };
  },
  
  updateWorkerPPE(workerId: string, updates: Partial<WorkerPPEState>): WorkerPPEState {
    workersStore = workersStore.map(w => {
      if (w.id === workerId) {
        const updated = { ...w, ...updates };
        // Recalculate status based on main items
        let missingCount = 0;
        if (updated.helmet === "Missing") missingCount++;
        if (updated.vest === "Missing") missingCount++;
        if (updated.shoes === "Missing") missingCount++;
        if (updated.harness === "Missing") missingCount++;
        
        updated.violationCount = missingCount;
        updated.compliancePct = Math.max(0, 100 - (missingCount * 20));
        
        if (missingCount === 0) {
          updated.ppeStatus = "Compliant";
        } else if (missingCount === 1) {
          updated.ppeStatus = "Warning";
        } else {
          updated.ppeStatus = "Violated";
        }
        return updated;
      }
      return w;
    });
    return workersStore.find(w => w.id === workerId)!;
  }
};

/**
 * 2. IncidentService
 * Enterprise tracking, corrective actions, signoffs, and approval flow
 */
export const IncidentService = {
  getIncidents(): Incident[] {
    return incidentsStore;
  },
  
  createIncident(incident: Omit<Incident, "id" | "history">): Incident {
    const newIncident: Incident = {
      ...incident,
      id: `INC-2026-00${incidentsStore.length + 1}`,
      history: [
        {
          status: "Open",
          updatedBy: "System Operator",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
          comment: "Incident reported and registered in Enterprise safety system."
        }
      ]
    };
    incidentsStore = [newIncident, ...incidentsStore];
    return newIncident;
  },
  
  updateIncidentStatus(id: string, status: Incident["status"], updatedBy: string, comment: string): Incident | undefined {
    incidentsStore = incidentsStore.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status,
          history: [
            ...inc.history,
            {
              status,
              updatedBy,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
              comment
            }
          ]
        };
      }
      return inc;
    });
    return incidentsStore.find(inc => inc.id === id);
  },
  
  approveIncidentAction(id: string, reviewerName: string, approve: boolean): Incident | undefined {
    incidentsStore = incidentsStore.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          approval: {
            status: approve ? "Approved" : "Rejected",
            by: reviewerName,
            date: new Date().toISOString().replace("T", " ").slice(0, 10)
          },
          status: approve ? "Closed" : "Investigating",
          history: [
            ...inc.history,
            {
              status: approve ? "Closed" : "Investigating",
              updatedBy: reviewerName,
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
              comment: approve 
                ? "Corrective & Preventive action closure certified by HSE Principal."
                : "Mitigation plan rejected. Requires revision."
            }
          ]
        };
      }
      return inc;
    });
    return incidentsStore.find(inc => inc.id === id);
  }
};

/**
 * 3. HazardService
 * Critical risk registers, hazard types, probabilities, mitigations
 */
export const HazardService = {
  getHazards(): Hazard[] {
    return hazardsStore;
  },
  
  createHazard(hazard: Omit<Hazard, "id">): Hazard {
    const newHazard: Hazard = {
      ...hazard,
      id: `HAZ-00${hazardsStore.length + 1}`
    };
    hazardsStore = [newHazard, ...hazardsStore];
    return newHazard;
  },
  
  mitigateHazard(id: string, updatedBy: string): Hazard | undefined {
    hazardsStore = hazardsStore.map(haz => {
      if (haz.id === id) {
        return {
          ...haz,
          status: "Resolved"
        };
      }
      return haz;
    });
    return hazardsStore.find(haz => haz.id === id);
  }
};

/**
 * 4. AuditService
 * Form builders, digital ISO checklists, signatures, compliance scores
 */
export const AuditService = {
  getAudits(): SafetyAudit[] {
    return auditsStore;
  },
  
  createAudit(audit: Omit<SafetyAudit, "id">): SafetyAudit {
    const newAudit: SafetyAudit = {
      ...audit,
      id: `AUD-00${auditsStore.length + 1}`
    };
    auditsStore = [newAudit, ...auditsStore];
    return newAudit;
  }
};

/**
 * 5. VideoService
 * Video timelines, bookmarking, and bounding boxes
 */
export const VideoService = {
  getCameraStreams(): CameraStream[] {
    return camerasStore;
  },
  
  getVideoEvents(): VideoEvent[] {
    return MOCK_VIDEO_EVENTS;
  }
};

/**
 * 6. NotificationService
 * Alerts management
 */
export const NotificationService = {
  getNotifications() {
    return notificationsStore;
  },
  
  markAsRead(id: string) {
    notificationsStore = notificationsStore.map(n => n.id === id ? { ...n, read: true } : n);
    return notificationsStore;
  },
  
  triggerMockAlert(alert: Omit<typeof notificationsStore[0], "id" | "read" | "timestamp">) {
    const newAlert = {
      ...alert,
      id: `ALR-00${notificationsStore.length + 1}`,
      timestamp: "Just now",
      read: false
    };
    notificationsStore = [newAlert, ...notificationsStore];
    return notificationsStore;
  }
};

/**
 * 7. SafetyService
 * Aggregate high-level indexes for dashboard visualization
 */
export const SafetyService = {
  getExecutiveKPIs() {
    const ppe = PPEService.getComplianceSummary();
    const incidents = incidentsStore;
    const hazards = hazardsStore;
    
    const openIncidentsCount = incidents.filter(i => i.status !== "Closed" && i.status !== "Approved").length;
    const resolvedIncidentsCount = incidents.filter(i => i.status === "Closed" || i.status === "Approved").length;
    const criticalIncidentsCount = incidents.filter(i => i.severity === "Critical" && i.status !== "Closed" && i.status !== "Approved").length;
    
    const openHazardsCount = hazards.filter(h => h.status !== "Resolved").length;
    const closedHazardsCount = hazards.filter(h => h.status === "Resolved").length;
    
    const activeSubcontractors = Array.from(new Set(workersStore.map(w => w.contractor))).length;
    
    // Safety score calculation logic
    // Perfect score: 100
    // Deducts 12 per open critical incident, 5 per open hazard, 3 per critical ppe violation
    const ppeViolationsCount = workersStore.filter(w => w.ppeStatus === "Violated").length;
    const penalty = (criticalIncidentsCount * 12) + (openIncidentsCount * 5) + (openHazardsCount * 3) + (ppeViolationsCount * 2);
    const overallSafetyScore = Math.max(45, 100 - penalty);

    const totalWorkers = workersStore.length;
    const workersWearingPPE = workersStore.filter(w => w.ppeStatus === "Compliant").length;
    const workersWithoutHelmet = workersStore.filter(w => w.helmet === "Missing").length;
    const workersWithoutVest = workersStore.filter(w => w.vest === "Missing").length;
    const workersWithoutHarness = workersStore.filter(w => w.harness === "Missing").length;
    
    const activeViolations = workersStore.filter(w => w.ppeStatus === "Violated" || w.ppeStatus === "Warning").length;
    const criticalRisks = criticalIncidentsCount + hazards.filter(h => h.riskLevel === "Critical" && h.status !== "Resolved").length;
    const nearMissesToday = nearMissesStore.filter(m => m.date === "2026-07-15" || m.date === "2026-07-14").length;
    
    return {
      overallSafetyScore,
      todaysSafetyScore: overallSafetyScore,
      openIncidents: openIncidentsCount,
      resolvedIncidents: resolvedIncidentsCount,
      nearMisses: nearMissesStore.length,
      nearMissesToday,
      unsafeActs: ppe.violated,
      unsafeConditions: openHazardsCount,
      ppeCompliancePct: ppe.averageCompliance,
      openHazards: openHazardsCount,
      closedHazards: closedHazardsCount,
      workersOnSite: totalWorkers,
      totalWorkers,
      workersWearingPPE,
      workersWithoutHelmet,
      workersWithoutVest,
      workersWithoutHarness,
      activeViolations,
      criticalRisks,
      highRiskZonesCount: hazards.filter(h => h.riskLevel === "Critical" || h.riskLevel === "High").length,
      activeSubcontractors
    };
  },
  
  getWeeklyComplianceTrends() {
    return [
      { week: "Wk 1", rate: 94.2 },
      { week: "Wk 2", rate: 95.8 },
      { week: "Wk 3", rate: 92.4 },
      { week: "Wk 4", rate: 94.6 },
      { week: "Wk 5", rate: 97.2 },
      { week: "Wk 6", rate: 96.8 }
    ];
  },
  
  getTradeRiskDistribution() {
    const counts: Record<string, number> = {};
    workersStore.forEach(w => {
      if (w.ppeStatus !== "Compliant") {
        counts[w.trade] = (counts[w.trade] || 0) + w.violationCount + 1;
      }
    });
    return Object.entries(counts).map(([trade, violations]) => ({
      name: trade,
      violations
    }));
  },
  
  getAIInsights() {
    return {
      summary: "Site safety compliance remains high at 96.8% overall. However, active scaffolding on Level 3 Facade presents a persistent fall hazard due to isolated contractor PPE violations.",
      commonViolations: [
        { type: "Missing Harness at Height", count: 3, level: "Critical", contractor: "L&T Construction" },
        { type: "Missing Safety Gloves", count: 2, level: "Low", contractor: "Sterling & Wilson" },
        { id: "v3", type: "Missing Safety Vests", count: 1, level: "Medium", contractor: "Tata Projects" }
      ],
      highestRiskTrade: "Scaffolders (L&T Construction)",
      highestRiskContractor: "L&T Construction (Score: 78%)",
      recommendations: [
        "Enforce automated gate shutdowns on Level 3 loading platforms unless harness hook triggers are verified.",
        "Perform a mandatory afternoon toolbox safety briefing on temporary RCCB bypass hazards.",
        "Deploy drone patrol at 15:30 to inspect external scaffolding guardrail consistency."
      ],
      riskForecast: "Low-to-Medium risk forecast for upcoming concrete pour sequence, provided crane wind limits are respected."
    };
  }
};
