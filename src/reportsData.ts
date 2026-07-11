export interface DailyLog {
  id: string;
  date: string;
  shift: "Day" | "Night";
  block: "Block A" | "Block B" | "Block C";
  trade: "Concrete" | "MEP" | "Plumbing" | "HVAC" | "Drywall & Partition" | "Façade & Glazing";
  item: string;
  quantity: string;
  quantityVal: number; // numeric value for charts
  contractor: string;
  status: "Completed" | "In Progress" | "Delayed";
  variance: string;
  manpower: number;
}

export interface WeeklyMilestone {
  id: string;
  week: number;
  block: "Block A" | "Block B" | "Block C";
  milestone: string;
  weight: number;
  subcontractor: string;
  targetDate: string;
  actualDate: string;
  status: "Achieved" | "Active" | "Delayed" | "Not Started";
  criticalPath: boolean;
  varianceDays: number;
}

export interface MonthlyReraAudit {
  id: string;
  month: string;
  block: "Block A" | "Block B" | "Block C";
  clause: string;
  subject: string;
  auditor: string;
  score: number; // out of 100
  status: "Compliant" | "Action Required" | "Critical Variance";
  remediation: string;
}

export interface DelayIncident {
  id: string;
  code: string;
  date: string;
  block: "Block A" | "Block B" | "Block C";
  incident: string;
  category: "MEP Clash" | "Structural" | "Material" | "Weather" | "Labor";
  floatImpact: number; // in days
  status: "Mitigated" | "Active Remediation" | "Pending Analysis";
  subcontractor: string;
}

export interface TradePerformance {
  id: string;
  contractor: string;
  trade: string;
  activeCrew: number;
  plannedCrew: number;
  complianceRate: number; // percentage
  safetyRating: number; // out of 5
  auditScore: number; // out of 100
  status: "Optimal" | "Warning" | "Critical";
}

// 1. Daily Shift Logs
export const DAILY_LOGS: DailyLog[] = [
  { id: "DL-01", date: "2026-07-11", shift: "Day", block: "Block A", trade: "Concrete", item: "M35 Column Pouring C4-C8", quantity: "45.2 m³", quantityVal: 45.2, contractor: "Vajra Concrete Corp", status: "Completed", variance: "+2.2 m³ ahead", manpower: 18 },
  { id: "DL-02", date: "2026-07-11", shift: "Day", block: "Block A", trade: "MEP", item: "L1 Conduit containment installation", quantity: "110 meters", quantityVal: 110, contractor: "Sterling MEP", status: "In Progress", variance: "On Track", manpower: 12 },
  { id: "DL-03", date: "2026-07-11", shift: "Day", block: "Block B", trade: "Concrete", item: "Level 2 Slab Formwork & Rebar alignment", quantity: "18 tons steel", quantityVal: 18, contractor: "Vajra Concrete Corp", status: "Completed", variance: "On Track", manpower: 24 },
  { id: "DL-04", date: "2026-07-11", shift: "Day", block: "Block B", trade: "Plumbing", item: "Vertical drainage stack sleeve alignment", quantity: "12 sleeves", quantityVal: 12, contractor: "Sterling MEP", status: "Delayed", variance: "Spacial clash", manpower: 6 },
  { id: "DL-05", date: "2026-07-11", shift: "Night", block: "Block A", trade: "Concrete", item: "Basement 1 ramp curing check", quantity: "1 active zone", quantityVal: 1, contractor: "Vajra Concrete Corp", status: "Completed", variance: "On Track", manpower: 8 },
  { id: "DL-06", date: "2026-07-11", shift: "Night", block: "Block C", trade: "Concrete", item: "Foundation raft structural inspection", quantity: "24 rebar grids", quantityVal: 24, contractor: "L&T Infrastructure", status: "In Progress", variance: "Overtime needed", manpower: 15 },
  { id: "DL-07", date: "2026-07-10", shift: "Day", block: "Block A", trade: "Façade & Glazing", item: "South facade unitized glazing brackets", quantity: "14 anchor points", quantityVal: 14, contractor: "Falcon Facades", status: "Delayed", variance: "Wind delay", manpower: 10 },
  { id: "DL-08", date: "2026-07-10", shift: "Day", block: "Block B", trade: "HVAC", item: "Level 1 main branch duct hangers", quantity: "42 brackets", quantityVal: 42, contractor: "Sterling MEP", status: "Completed", variance: "+5 units ahead", manpower: 14 },
  { id: "DL-09", date: "2026-07-10", shift: "Night", block: "Block B", trade: "Drywall & Partition", item: "L1 interior apartment partition metal stud framing", quantity: "75 frames", quantityVal: 75, contractor: "Apex Finishes", status: "In Progress", variance: "On Track", manpower: 16 }
];

// 2. Weekly Milestones
export const WEEKLY_MILESTONES: WeeklyMilestone[] = [
  { id: "WM-01", week: 12, block: "Block A", milestone: "Level 1 slab pour (Zone A & B)", weight: 15, subcontractor: "Vajra Concrete Corp", targetDate: "2026-07-09", actualDate: "2026-07-08", status: "Achieved", criticalPath: true, varianceDays: -1 },
  { id: "WM-02", week: 12, block: "Block A", milestone: "MEP main riser containment shaft handover", weight: 8, subcontractor: "Sterling MEP", targetDate: "2026-07-10", actualDate: "2026-07-11", status: "Achieved", criticalPath: false, varianceDays: 1 },
  { id: "WM-03", week: 12, block: "Block B", milestone: "Level 2 structural column casting", weight: 12, subcontractor: "Vajra Concrete Corp", targetDate: "2026-07-12", actualDate: "", status: "Active", criticalPath: true, varianceDays: 0 },
  { id: "WM-04", week: 11, block: "Block B", milestone: "Level 1 shear wall photogrammetry audit", weight: 5, subcontractor: "BuildTrace Core", targetDate: "2026-07-04", actualDate: "2026-07-04", status: "Achieved", criticalPath: false, varianceDays: 0 },
  { id: "WM-05", week: 11, block: "Block A", milestone: "West facade unitized brackets (Weeks 10-11)", weight: 10, subcontractor: "Falcon Facades", targetDate: "2026-07-05", actualDate: "", status: "Delayed", criticalPath: false, varianceDays: 6 },
  { id: "WM-06", week: 10, block: "Block A", milestone: "Ground floor structural frame release", weight: 20, subcontractor: "Vajra Concrete Corp", targetDate: "2026-06-28", actualDate: "2026-06-29", status: "Achieved", criticalPath: true, varianceDays: 1 },
  { id: "WM-07", week: 13, block: "Block A", milestone: "Level 2 concrete slab formwork staging", weight: 10, subcontractor: "Vajra Concrete Corp", targetDate: "2026-07-18", actualDate: "", status: "Not Started", criticalPath: true, varianceDays: 0 },
  { id: "WM-08", week: 13, block: "Block B", milestone: "Level 1 fire protection piping conduit layout", weight: 6, subcontractor: "Sterling MEP", targetDate: "2026-07-20", actualDate: "", status: "Not Started", criticalPath: false, varianceDays: 0 }
];

// 3. Monthly RERA Audits
export const MONTHLY_RERA_AUDITS: MonthlyReraAudit[] = [
  { id: "RERA-01", month: "July 2026", block: "Block A", clause: "Section 4(2)(l)(D)", subject: "Slab structure alignment vs approved RERA plan", auditor: "KA-RERA Inspector Panel", score: 96, status: "Compliant", remediation: "None. Drone orthomosaics match design perfectly." },
  { id: "RERA-02", month: "July 2026", block: "Block B", clause: "Section 15", subject: "Fire and plumbing casing sleeve installations", auditor: "Internal QC Lead", score: 82, status: "Action Required", remediation: "Sprinkler pipe deviation detected at L1 Column 4. Relocation scheduled." },
  { id: "RERA-03", month: "June 2026", block: "Block A", clause: "Section 4(2)(l)(C)", subject: "Quarterly progress percentage declaration", auditor: "RERA Chartered Engineer", score: 98, status: "Compliant", remediation: "Photogrammetry reports submitted directly to KA-RERA portal." },
  { id: "RERA-04", month: "June 2026", block: "Block B", clause: "Section 11(3)", subject: "Steel rebar grade Fe 550D metallurgy tests", auditor: "Bureau Veritas India", score: 95, status: "Compliant", remediation: "Certificates verified. No chemical discrepancies." },
  { id: "RERA-05", month: "May 2026", block: "Block C", clause: "Section 4(2)(l)(A)", subject: "Excavation depth boundary vs survey coordinates", auditor: "BBMP Survey Division", score: 71, status: "Critical Variance", remediation: "Excavation exceeded south boundary by 0.4m. Earth filling & retaining wall reinforcement added." }
];

// 4. Delay Incidents
export const DELAY_INCIDENTS: DelayIncident[] = [
  { id: "INC-01", code: "INC-REBAR-04", date: "2026-07-08", block: "Block B", incident: "Level 2 column rebar spacing displacement", category: "Structural", floatImpact: 2.5, status: "Mitigated", subcontractor: "Vajra Concrete Corp" },
  { id: "INC-02", code: "INC-MEP-09", date: "2026-07-06", block: "Block A", incident: "HVAC conduit main duct collision with sprinkler line", category: "MEP Clash", floatImpact: 1.5, status: "Mitigated", subcontractor: "Sterling MEP" },
  { id: "INC-03", code: "INC-WTH-02", date: "2026-07-05", block: "Block A", incident: "Severe monsoon wind and lightning safety lockout", category: "Weather", floatImpact: 4.0, status: "Pending Analysis", subcontractor: "Falcon Facades" },
  { id: "INC-04", code: "INC-MAT-12", date: "2026-07-02", block: "Block C", incident: "Fe 550D reinforcement steel supply logistics delay", category: "Material", floatImpact: 3.5, status: "Active Remediation", subcontractor: "L&T Infrastructure" },
  { id: "INC-05", code: "INC-LAB-01", date: "2026-06-25", block: "Block B", incident: "Scaffolding carpenters crew local transport strike", category: "Labor", floatImpact: 1.0, status: "Mitigated", subcontractor: "Vajra Concrete Corp" }
];

// 5. Trade Contractors
export const TRADE_CONTRACTORS: TradePerformance[] = [
  { id: "CON-01", contractor: "Vajra Concrete Corp", trade: "Concrete & Structure", activeCrew: 42, plannedCrew: 45, complianceRate: 94, safetyRating: 4.8, auditScore: 95, status: "Optimal" },
  { id: "CON-02", contractor: "Sterling MEP Projects", trade: "MEP, Fire & HVAC", activeCrew: 26, plannedCrew: 28, complianceRate: 91, safetyRating: 4.9, auditScore: 92, status: "Optimal" },
  { id: "CON-03", contractor: "Falcon Facades & Glazing", trade: "Façade & Curtain Walls", activeCrew: 10, plannedCrew: 15, complianceRate: 64, safetyRating: 4.5, auditScore: 78, status: "Warning" },
  { id: "CON-04", contractor: "Apex Finishes & Drywalls", trade: "Plaster & Partitioning", activeCrew: 18, plannedCrew: 20, complianceRate: 88, safetyRating: 4.7, auditScore: 85, status: "Optimal" },
  { id: "CON-05", contractor: "L&T Infrastructure", trade: "Excavation & Foundations", activeCrew: 15, plannedCrew: 25, complianceRate: 52, safetyRating: 4.2, auditScore: 68, status: "Critical" }
];

// S-Curve progress history for charts
export const WEEKLY_PROGRESS_SCURVE = [
  { week: "Week 1", "Scheduled BIM %": 5, "Actual Drone %": 5 },
  { week: "Week 2", "Scheduled BIM %": 12, "Actual Drone %": 11.5 },
  { week: "Week 3", "Scheduled BIM %": 18, "Actual Drone %": 17 },
  { week: "Week 4", "Scheduled BIM %": 25, "Actual Drone %": 24 },
  { week: "Week 5", "Scheduled BIM %": 32, "Actual Drone %": 31.8 },
  { week: "Week 6", "Scheduled BIM %": 39, "Actual Drone %": 37.5 },
  { week: "Week 7", "Scheduled BIM %": 46, "Actual Drone %": 44.2 },
  { week: "Week 8", "Scheduled BIM %": 54, "Actual Drone %": 51.0 },
  { week: "Week 9", "Scheduled BIM %": 62, "Actual Drone %": 58.5 },
  { week: "Week 10", "Scheduled BIM %": 68, "Actual Drone %": 66.0 },
  { week: "Week 11", "Scheduled BIM %": 74, "Actual Drone %": 71.4 },
  { week: "Week 12", "Scheduled BIM %": 81, "Actual Drone %": 78.6 }
];

// Cashflow and billing drawdown history for charts
export const MONTHLY_CASHFLOW_HISTORY = [
  { month: "Jan 2026", "Planned (Crores)": 0.8, "Actual (Crores)": 0.8, "RERA Index": 98 },
  { month: "Feb 2026", "Planned (Crores)": 1.9, "Actual (Crores)": 1.85, "RERA Index": 98 },
  { month: "Mar 2026", "Planned (Crores)": 3.4, "Actual (Crores)": 3.2, "RERA Index": 97 },
  { month: "Apr 2026", "Planned (Crores)": 5.2, "Actual (Crores)": 4.9, "RERA Index": 96 },
  { month: "May 2026", "Planned (Crores)": 7.5, "Actual (Crores)": 7.1, "RERA Index": 95 },
  { month: "Jun 2026", "Planned (Crores)": 10.2, "Actual (Crores)": 9.75, "RERA Index": 95 },
  { month: "Jul 2026", "Planned (Crores)": 13.3, "Actual (Crores)": 12.8, "RERA Index": 96 }
];

// Function to convert array to CSV downloadable link
export function triggerCsvDownload(data: Array<any>, filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => 
    Object.values(row).map(val => {
      const strVal = String(val).replace(/"/g, '""');
      return strVal.includes(",") || strVal.includes("\n") ? `"${strVal}"` : strVal;
    }).join(",")
  );
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
