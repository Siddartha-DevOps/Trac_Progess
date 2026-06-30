export interface BIMElement {
  id: string;
  name: string;
  category: "Structure" | "MEP" | "Arch"; // Structural column/slab, MEP duct/pipe, Architectural wall
  type: "Column" | "Slab" | "Duct" | "Wall" | "Pipe";
  progress: number; // 0 to 100
  status: "completed" | "in_progress" | "delayed" | "not_started";
  position: [number, number, number];
  size: [number, number, number];
  material?: string;
  installationDate?: string;
  anomalyId?: string;
  costEstimate?: number;
}

export interface Anomaly {
  id: string;
  elementId: string;
  elementName: string;
  category: "Reinforcement" | "MEP Collision" | "Geometric Shift" | "Missing Part";
  title: string;
  description: string;
  level: "low" | "medium" | "high" | "critical";
  deviation: string; // e.g. "Rebar density 15% under", "32cm alignment offset"
  possibleCause: string;
  status: "open" | "resolved" | "monitoring";
  detectedAt: string;
}

export interface ProjectStats {
  name: string;
  location: string;
  overallProgress: number;
  totalCost: string;
  constructionArea: string;
  targetDate: string;
  reraId: string;
}

export interface PipelineStep {
  step: string;
  status: "Completed" | "In Progress" | "Pending";
  log: string;
  progress: number;
}
