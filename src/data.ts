import { ProjectStats, Anomaly } from "./types";

// Project Master Stats conforming to RERA
export const PROJECT_STATS: ProjectStats = {
  name: "Bangalore Tech Park - Block B",
  location: "Whitefield, Bengaluru, India",
  overallProgress: 72,
  totalCost: "₹18.5 Crores",
  constructionArea: "45,000 sq ft",
  targetDate: "Nov 2026",
  reraId: "KA-RERA-2026-0389"
};

// Site Anomalies aligned with physical drone photogrammetry and 3D BIM assets
export const SITE_ANOMALIES: Anomaly[] = [
  {
    id: "anom_rebar_density",
    elementId: "col_c4",
    elementName: "Column C4",
    category: "Reinforcement",
    title: "Slab Reinforcement Spacing Discrepancy",
    description: "YOLO-v8 analysis of high-res drone image identifies 15% under-reinforcement density in structural Column C4. Stirrups spacing exceeds IFC design parameters by 85mm.",
    level: "critical",
    deviation: "Spacing deviation of +85mm vs. IFC4 standard",
    possibleCause: "Sub-contractor drawing misinterpretation or rebar shortage",
    status: "open",
    detectedAt: "Week 2 - Photo Scan ID #88"
  },
  {
    id: "anom_duct_clash",
    elementId: "mep_duct_branch",
    elementName: "Branch HVAC Duct C4",
    category: "MEP Collision",
    title: "HVAC Duct to Fire Sprinkler Piping Collision",
    description: "3D Spatial clash solver flags L1 branch duct colliding directly with the CPVC sprinkler line. Restricts architectural drywall partition erection in L1 Zone B.",
    level: "high",
    deviation: "18.5cm volumetric structural collision",
    possibleCause: "Central coordination error between MEP and HVAC draftsmen",
    status: "open",
    detectedAt: "Week 4 - Drone Scan ID #92"
  }
];

// Helper dictionary for BIM Element metadata mapping
export const BIM_ELEMENTS_LOOKUP = [
  { id: "col_c4", name: "Structural Column C4", anomalyId: "anom_rebar_density" },
  { id: "mep_duct_branch", name: "HVAC Branch Duct C4", anomalyId: "anom_duct_clash" }
] as any[];
