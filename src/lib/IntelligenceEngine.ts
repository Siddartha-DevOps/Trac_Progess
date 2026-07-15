/**
 * TracProgress® Enterprise Construction Intelligence Engine
 * 
 * Powered by Gemini AI & Real-time Site IoT/CV Event Bus.
 * Connects Projects, BIM, Schedules, Quality, Safety, and Commercials.
 */

// --- TYPES ---

export type IntelligenceCategory =
  | "Schedule"
  | "Quality"
  | "Safety"
  | "Budget"
  | "Material"
  | "Equipment"
  | "Weather"
  | "Labor"
  | "Document"
  | "Operations";

export type AlertLevel = "critical" | "warning" | "info" | "success";

export interface IntelligenceRule {
  id: string;
  name: string;
  category: IntelligenceCategory;
  condition: string;
  isTriggered: boolean;
  message: string;
  alertLevel: AlertLevel;
  severity: "High" | "Medium" | "Low";
  priority: "P0" | "P1" | "P2" | "P3";
  prediction: string;
  suggestedAction: string;
}

export interface EnterpriseRecommendation {
  id: string;
  title: string;
  category: IntelligenceCategory;
  impact: string;
  costImpact: string;
  timeSaving: string;
  description: string;
  actionableStep: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "pending" | "approved" | "applied";
}

export interface ExecutiveSummaryReport {
  projectSummary: string;
  dailySummary: string;
  weeklySummary: string;
  monthlySummary: string;
  executiveSummary: string;
  riskSummary: string;
  budgetSummary: string;
  qualitySummary: string;
  safetySummary: string;
  commercialSummary: string;
  delaySummary: string;
}

export interface ProjectHealthMetrics {
  overallHealth: number; // 0 - 100
  scheduleScore: number;
  budgetScore: number;
  qualityScore: number;
  safetyScore: number;
  commercialScore: number;
  progressScore: number;
  documentationScore: number;
  inspectionScore: number;
  aiConfidenceScore: number;
}

export interface RiskForecast {
  scheduleDelayRisk: number; // Percentage
  budgetOverrunRisk: number;
  qualityFailureRisk: number;
  safetyRisk: number;
  materialDelayRisk: number;
  equipmentFailureRisk: number;
  weatherDelayRisk: number;
  tradeUnderperformanceRisk: number;
  inspectionFailureRisk: number;
  cashFlowRisk: number;
}

export interface TimelineForecastPoint {
  date: string;
  plannedProgress: number;
  actualProgress: number;
  forecastedProgress: number;
  plannedCost: number;
  actualCost: number;
  forecastedCost: number;
}

// --- EVENT BUS INTERFACES ---

export interface EnterpriseEvent {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  payload: any;
  description: string;
}

type EventCallback = (event: EnterpriseEvent) => void;

// --- CLASS IMPLEMENTATION ---

class EnterpriseConstructionIntelligenceEngine {
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private eventHistory: EnterpriseEvent[] = [];
  private maxHistorySize = 100;

  // Static/Mock-ready Data for rules, health, risks
  private activeRules: IntelligenceRule[] = [];
  private recommendations: EnterpriseRecommendation[] = [];
  private healthMetrics: ProjectHealthMetrics = {
    overallHealth: 82,
    scheduleScore: 76,
    budgetScore: 88,
    qualityScore: 84,
    safetyScore: 95,
    commercialScore: 90,
    progressScore: 78,
    documentationScore: 85,
    inspectionScore: 82,
    aiConfidenceScore: 94,
  };

  private riskForecast: RiskForecast = {
    scheduleDelayRisk: 68,
    budgetOverrunRisk: 35,
    qualityFailureRisk: 42,
    safetyRisk: 15,
    materialDelayRisk: 55,
    equipmentFailureRisk: 28,
    weatherDelayRisk: 40,
    tradeUnderperformanceRisk: 48,
    inspectionFailureRisk: 32,
    cashFlowRisk: 22,
  };

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    this.initializeRules();
    this.initializeRecommendations();
    this.seedInitialEvents();
  }

  // --- STEP 10: EVENT BUS ---

  public subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(eventType);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  public publish(type: string, source: string, payload: any, description: string): EnterpriseEvent {
    const event: EnterpriseEvent = {
      id: `ev-${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString(),
      type,
      source,
      payload,
      description,
    };

    // Store in history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Trigger exact matches
    const exactSubs = this.subscribers.get(type);
    if (exactSubs) {
      exactSubs.forEach((callback) => {
        try {
          callback(event);
        } catch (err) {
          console.error(`Error in event callback for type ${type}:`, err);
        }
      });
    }

    // Trigger wildcards
    const wildcardSubs = this.subscribers.get("*");
    if (wildcardSubs) {
      wildcardSubs.forEach((callback) => {
        try {
          callback(event);
        } catch (err) {
          console.error(`Error in wildcard event callback:`, err);
        }
      });
    }

    // --- STEP 9: CROSS MODULE INTELLIGENCE SYNC ---
    this.processCrossModuleIntelligence(event);

    return event;
  }

  public getEventHistory(): EnterpriseEvent[] {
    return this.eventHistory;
  }

  public clearEventHistory() {
    this.eventHistory = [];
  }

  private seedInitialEvents() {
    const initialEvents = [
      { type: "BIM_UPDATED", source: "DesignOffice", payload: { model: "IFC_v4.2" }, desc: "BIM federated model updated to structural revision IFC_v4.2 (Level 3 additions)." },
      { type: "INSPECTION_FAILED", source: "DroneCVModule", payload: { anomalyId: "anom-01" }, desc: "Drone photogrammetry scan flagged a rebar spacing deviation on Level 3 East Slab." },
      { type: "DELAY_INCREASED", source: "ScheduleEngine", payload: { task: "L3 Pouring", delayDays: 8 }, desc: "Structural pouring baseline schedule slipped by 8 working days due to rebar inspection failure." },
      { type: "BUDGET_UPDATED", source: "CommercialDept", payload: { costCode: "CONC-04", deltaCost: 450000 }, desc: "Variance detected: Additional steel fabrication re-work cost of ₹4,50,000 allocated." },
      { type: "DOCUMENT_APPROVED", source: "PMC_Manager", payload: { docId: "dwg-302" }, desc: "Shop drawing 'B-L3-REBAR-02A.dwg' approved with structural modifications." },
    ];

    initialEvents.forEach((ev, idx) => {
      const timeOffset = (idx + 1) * 30 * 60 * 1000; // minutes ago
      this.eventHistory.push({
        id: `ev-seed-${idx}`,
        timestamp: new Date(Date.now() - timeOffset).toISOString(),
        type: ev.type,
        source: ev.source,
        payload: ev.payload,
        description: ev.desc,
      });
    });
  }

  // --- STEP 9: CROSS MODULE INTELLIGENCE ROUTER ---

  private processCrossModuleIntelligence(event: EnterpriseEvent) {
    // If Quality/CV detects failure
    if (event.type === "QUALITY_FAILURE" || event.type === "INSPECTION_FAILED") {
      const anomalyId = event.payload?.anomalyId || "anom-cv-09";
      
      // 1. Notify Issues System
      this.publish(
        "ISSUE_CREATED",
        "AI_Brain_CrossModule",
        { anomalyId, issueId: `issue-gen-${anomalyId}`, category: "Quality" },
        `Cross-Module: Auto-escalated quality failure ${anomalyId} to high-priority site Issue.`
      );

      // 2. Notify Schedule System (mark potential milestone risk)
      this.publish(
        "SCHEDULE_RISK_FLAGGED",
        "AI_Brain_CrossModule",
        { impactedMilestone: "Slab Pouring Level 3", anticipatedDelayDays: 12 },
        `Cross-Module: Quality discrepancy on Level 3 rebar flagged as a 12-day milestone risk for pouring.`
      );

      // 3. Update active risk metrics
      this.riskForecast.qualityFailureRisk = Math.min(95, this.riskForecast.qualityFailureRisk + 15);
      this.riskForecast.scheduleDelayRisk = Math.min(95, this.riskForecast.scheduleDelayRisk + 12);
      this.healthMetrics.qualityScore = Math.max(50, this.healthMetrics.qualityScore - 8);
      this.healthMetrics.scheduleScore = Math.max(50, this.healthMetrics.scheduleScore - 6);
      this.recalculateOverallHealth();

      // 4. Update Rule engine status
      const rule = this.activeRules.find((r) => r.category === "Quality" && r.name.includes("Rebar"));
      if (rule) {
        rule.isTriggered = true;
        rule.alertLevel = "critical";
      }
    }

    if (event.type === "ISSUE_RESOLVED" || event.type === "INSPECTION_PASSED") {
      this.riskForecast.qualityFailureRisk = Math.max(20, this.riskForecast.qualityFailureRisk - 18);
      this.healthMetrics.qualityScore = Math.min(100, this.healthMetrics.qualityScore + 10);
      this.recalculateOverallHealth();
      this.publish(
        "DASHBOARD_UPDATED",
        "AI_Brain_CrossModule",
        { refresh: true },
        "Cross-Module: System scores and risk factors updated successfully."
      );
    }
  }

  private recalculateOverallHealth() {
    const h = this.healthMetrics;
    const avg = (h.scheduleScore + h.budgetScore + h.qualityScore + h.safetyScore + h.commercialScore + h.progressScore + h.documentationScore + h.inspectionScore) / 8;
    this.healthMetrics.overallHealth = Math.round(avg);
  }

  // --- STEP 3: RULE ENGINE ---

  private initializeRules() {
    this.activeRules = [
      {
        id: "rule-01",
        name: "L3 Structural Schedule Deviation",
        category: "Schedule",
        condition: "Slab pouring delay > 5 days & CV status !== 'Completed'",
        isTriggered: true,
        message: "Level 3 Slab Pour is currently delayed by 8 days due to structural misalignment.",
        alertLevel: "critical",
        severity: "High",
        priority: "P0",
        prediction: "If delayed 4 more days, critical path shifts, delaying HVAC ducts by 2.5 weeks.",
        suggestedAction: "Direct structural trade crew to apply micro-sequencing on columns and approve rebar deviation by Q4.",
      },
      {
        id: "rule-02",
        name: "Concrete Rebar Under-Density Audit",
        category: "Quality",
        condition: "CV density reading < 90% specified rebar steel spacing",
        isTriggered: true,
        message: "Instance-segmentation algorithm detected 15% fewer reinforcement bars on Zone B West section.",
        alertLevel: "critical",
        severity: "High",
        priority: "P0",
        prediction: "Failure to verify structural steel grade will trigger RERA audit penalty and concrete pour block.",
        suggestedAction: "Halt pour, mandate localized manual re-layout, and schedule an immediate 3D drone photogrammetry pass.",
      },
      {
        id: "rule-03",
        name: "Unhelmeted Personnel CV Warning",
        category: "Safety",
        condition: "Drone 360 Video feeds helmet-detection score < 0.95",
        isTriggered: true,
        message: "Safety visual model flagged 2 sub-contractor workers in Zone B Level 3 without standard PPE helmets.",
        alertLevel: "warning",
        severity: "Medium",
        priority: "P1",
        prediction: "Continuous compliance slips will compromise OSHA audit status and trigger site insurance warnings.",
        suggestedAction: "Broadcast spatial speaker alert to Level 3 foreman and dispatch digital SMS safety reminder to subcontractor.",
      },
      {
        id: "rule-04",
        name: "Commercial Budget Slip Variance",
        category: "Budget",
        condition: "CPI (Cost Performance Index) < 0.90",
        isTriggered: false,
        message: "Cumulative budget variance is within healthy tolerance. Under-run achieved on steel buy-back.",
        alertLevel: "success",
        severity: "Low",
        priority: "P3",
        prediction: "No high-risk budget overruns predicted for Q3 structural codes.",
        suggestedAction: "Maintain standard cost auditing protocols and release scheduled contractor milestones.",
      },
      {
        id: "rule-05",
        name: "Concrete Curing Hydration Monitor",
        category: "Operations",
        condition: "Maturity index temperature sensor delta > 15°C",
        isTriggered: false,
        message: "Concrete curing core temperatures are stable. Solid compressive strength index attained.",
        alertLevel: "success",
        severity: "Low",
        priority: "P2",
        prediction: "Compresive strength predicted to reach full 35 MPa grade target within 48 hours.",
        suggestedAction: "Prepare architectural formwork removal crews for rapid early stripping.",
      },
      {
        id: "rule-06",
        name: "IFC Shop Drawing Document Delay",
        category: "Document",
        condition: "Approval workflow cycle time > 14 days",
        isTriggered: true,
        message: "Standard electrical spatial schematic 'B-L3-ELEC-04' pending consultant signature for 16 days.",
        alertLevel: "warning",
        severity: "Medium",
        priority: "P2",
        prediction: "Delayed approval risks spatial clash with upcoming drywall framing starting in 10 days.",
        suggestedAction: "Auto-escalate approval request to lead engineering consultant with urgent priority tag.",
      },
      {
        id: "rule-07",
        name: "Monsoon Heavy Rain Forecast",
        category: "Weather",
        condition: "Regional weather API rainfall forecast > 25mm/hr",
        isTriggered: true,
        message: "Monsoon storm warning: Severe rainfall predicted on Whitefield area on Wednesday afternoon.",
        alertLevel: "warning",
        severity: "Medium",
        priority: "P1",
        prediction: "Outdoor foundation concrete pours will face severe wash-out risks and water logging.",
        suggestedAction: "Reschedule concrete pour calendar from Wednesday to Tuesday morning; activate sub-grade storm pumps.",
      }
    ];
  }

  public getRules(): IntelligenceRule[] {
    return this.activeRules;
  }

  public triggerRule(ruleId: string, trigger: boolean) {
    const rule = this.activeRules.find((r) => r.id === ruleId);
    if (rule) {
      rule.isTriggered = trigger;
      rule.alertLevel = trigger ? "critical" : "success";
      this.publish(
        "RULE_EVALUATED",
        "AI_Rule_Engine",
        { ruleId, triggered: trigger },
        `Rule '${rule.name}' state changed to ${trigger ? "TRIGGERED (Active)" : "RESOLVED (Clear)"}.`
      );
    }
  }

  // --- STEP 4: RECOMMENDATION ENGINE ---

  private initializeRecommendations() {
    this.recommendations = [
      {
        id: "rec-01",
        title: "Deploy 12-Man Column Structural Reinforcement Crew",
        category: "Labor",
        impact: "Accelerate L3 column vertical framework by 4 days.",
        costImpact: "₹1,25,000 (Overtime)",
        timeSaving: "4 Working Days Saved",
        description: "Direct reinforcement trade partner to augment their active shift with 12 senior structural steel fitters.",
        actionableStep: "Assign 'Abhinav Steel Contractors' to double shift hours. Release mobilizing fund from commercial buffer.",
        priority: "Critical",
        status: "pending",
      },
      {
        id: "rec-02",
        title: "Re-order Fe550D TMT Reinforcement Steel",
        category: "Material",
        impact: "Safeguard against regional supply shortfalls.",
        costImpact: "₹3,40,000 (Immediate Procurement)",
        timeSaving: "Prevents 2-Week Stockout Delay",
        description: "BIM forecasting models indicate a potential steel stockout in 18 days if current pouring speed increases.",
        actionableStep: "Place advance Purchase Order for 45 Tons of premium 24mm Fe550D rebar rods with secondary certified distributor.",
        priority: "High",
        status: "pending",
      },
      {
        id: "rec-03",
        title: "Overlap MEP Conduit Installation",
        category: "Schedule",
        impact: "Recovers 5 days of cumulative schedule slippage.",
        costImpact: "₹45,000 (Coordination Meeting Costs)",
        timeSaving: "5 Days Recovery",
        description: "Modify sequencing logic so MEP subcontractors start conduit mapping immediately following rebar inspection, without waiting for the complete floor sign-off.",
        actionableStep: "Adjust Gantt dependencies in the Schedules View. Invite MEP Foreman to daily alignment huddle.",
        priority: "High",
        status: "pending",
      },
      {
        id: "rec-04",
        title: "Tower Crane Spatial Proximity Sensor Deployment",
        category: "Safety",
        impact: "Zero crane collision hazard / complete safety assurance.",
        costImpact: "₹85,000 (Hardware lease)",
        timeSaving: "Prevents Work-Stoppage Risk",
        description: "Drone telemetry indicates high tower crane swing overlay with the Block C active roof framing crew zone.",
        actionableStep: "Install immediate anti-collision proximity alert radars on Crane Hook #2 and configure warning buzzer.",
        priority: "Medium",
        status: "pending",
      },
      {
        id: "rec-05",
        title: "Ultrasonic Core Compressive Testing",
        category: "Quality",
        impact: "Verify curing integrity of structural columns.",
        costImpact: "₹30,000 (Third-party lab audit)",
        timeSaving: "Unlocks early formwork stripping safety",
        description: "Although curing progress indexes are within limits, visual micro-fracturing was identified near joint grid 12.",
        actionableStep: "Issue work order to Bangalore Quality Testing Ltd to conduct ultrasonic velocity pulse checks on 4 major core columns.",
        priority: "Medium",
        status: "pending",
      },
    ];
  }

  public getRecommendations(): EnterpriseRecommendation[] {
    return this.recommendations;
  }

  public applyRecommendation(id: string): boolean {
    const rec = this.recommendations.find((r) => r.id === id);
    if (rec) {
      rec.status = "applied";
      this.publish(
        "RECOMMENDATION_APPLIED",
        "AI_Recommendation_Engine",
        { recId: id, title: rec.title },
        `Recommendation Applied: ${rec.title}. Cost Impact: ${rec.costImpact}.`
      );

      // Trigger cross module effects
      if (rec.id === "rec-01") {
        this.healthMetrics.scheduleScore = Math.min(100, this.healthMetrics.scheduleScore + 8);
        this.riskForecast.scheduleDelayRisk = Math.max(20, this.riskForecast.scheduleDelayRisk - 15);
        this.recalculateOverallHealth();
      } else if (rec.id === "rec-05") {
        this.healthMetrics.qualityScore = Math.min(100, this.healthMetrics.qualityScore + 10);
        this.riskForecast.qualityFailureRisk = Math.max(15, this.riskForecast.qualityFailureRisk - 12);
        this.recalculateOverallHealth();
      }

      return true;
    }
    return false;
  }

  // --- STEP 5: EXECUTIVE INSIGHTS ---

  public getExecutiveInsights(): ExecutiveSummaryReport {
    return {
      projectSummary: `Bangalore Tech Park - Block B is currently at **${this.healthMetrics.overallHealth}% Overall Health** (evaluated on Week ${3}). While structural steelworks and MEP conduit routing represent major progress pillars, recent 3D drone photogrammetry audits have logged structural alignment deviations on Level 3 East Slab, inducing a localized delay. Remediation strategies have been calculated to secure our planned RERA target.`,
      
      dailySummary: `**Daily Site Brief (July 14, 2026):**
* **Drone Flight #42 Completed:** 360-degree high-res ortho-imaging successfully processed in 8 minutes. Identified rebar deviation under-density on Level 3 Zone B.
* **Concrete Maturity Sensors:** Logged peak hydration temperature at 52°C, verifying solid early column strength on Block B cores.
* **Labor Punch-In:** 142 total skilled operators logged on-site. Trade partner steel crew active with overtime shifts.`,
      
      weeklySummary: `**Weekly Progress Audit (Week 3, Q3 2026):**
* **Actual Progress Achieved:** 2.45% physical progress mapped vs 2.80% planned baseline target.
* **Earned Value Index (SPI):** Currently lagging at **0.81** due to inspection delays on structural joists.
* **Critical Milestones:** Formwork stripping on Level 2 verified. Level 3 column reinforcement steel layout reaches 85% completion.`,
      
      monthlySummary: `**Monthly Performance Ledger (June 15 - July 14, 2026):**
* **Cumulative Work Volume:** 1,840 m³ of concrete structural elements successfully poured and model-verified.
* **Procurement Sourcing:** Acquired 110 Tons of premium structural steel rods from approved vendor, locking bulk discounts.
* **RERA Compliance Status:** Baseline project schedule has been flagged as **Medium Compliance Hazard** but is restorable via targeted labor allocation.`,
      
      executiveSummary: `### Executive Leadership Status Report
* **Portfolio Name:** Bangalore Tech Park Expansion - Block B (Karnataka, India)
* **Capital Commitment:** ₹18.5 Crores Total Cost • Cumulative Spent: ₹13.4 Crores
* **Core Health Rating:** **${this.healthMetrics.overallHealth}/100 (At Risk)**
* **Principal Action Recommended:** Authorize overtime budget for Abhinav Steel Contractors to expedite Level 3 reinforcement spacing correction and avoid critical path HVAC spatial clash.`,
      
      riskSummary: `**Multi-Disciplinary Risk Mapping:**
* **Schedule Slippage:** Highly critical (68% prediction score). Localized structural rework on Level 3 is holding up the next major floor pouring milestone.
* **Supply Chain Delay:** Moderate risk (55% prediction). Structural steel supplies in Whitefield face local logistical friction.
* **Safety Observation:** Low risk (15%). Overall PPE compliance is solid at 98.2%. Proximity crane alert recommended.`,
      
      budgetSummary: `**Enterprise Financial S-Curve Summary:**
* **Cost Performance Index (CPI):** Stable at **0.95** (₹18.5 Cr baseline budget, ₹13.4 Cr actual commitment).
* **Earned Value (EV) Mapped:** ₹12.8 Crores equivalent work volume verified by AI drone inspection.
* **Cost Variance:** Out-of-pocket structural rework estimated at only ₹4,50,000, easily absorbed by the 5% project contingency fund.`,
      
      qualitySummary: `**ISO-9001 Structural Quality Ledger:**
* **BIM Geometrical Discrepancies:** 2 active anomalies detected by computer vision.
* **Rebar Spacing Mismatch:** Spacing density deviation of -15% flagged on Level 3 Zone B West.
* **Action Status:** Corrective Action Plan formulated. Ultrasonic column verification scheduled with Bangalore Lab.`,
      
      safetySummary: `**OSHA-18001 Daily Safety Inspection Brief:**
* **PPE Visual Compliance:** AI camera detected two workers in Zone B neglecting safety helmets on scaffolding. Resolved in real-time by speaker announcement.
* **Crane Spatial Intersection:** Hook swing overlay detected. Active radar sensor deployment recommended to eliminate structural rigging hazards.`,
      
      commercialSummary: `**Commercial Progress Claim Status:**
* **RERA Milestone Invoicing:** Progress claim for Level 2 concrete slabs (₹1.8 Crores) verified and approved by lead architect.
* **L3 Retainage Sourcing:** Commercial retainage release scheduled for next Friday following AI verification of Level 3 structural layout.`,
      
      delaySummary: `**Critical Delay Path Assessment:**
* **Predicted Slippage:** **8 working days** deviation.
* **Bottleneck Trade:** Structural steel reinforcement framing.
* **Schedule Recovery Path:** Restructure floor plan pipeline to overlap MEP conduit mapping. Immediate compression of drywall sub-task by 3 days.`
    };
  }

  // --- STEP 6: PROJECT HEALTH ENGINE ---

  public getHealthMetrics(): ProjectHealthMetrics {
    return this.healthMetrics;
  }

  // --- STEP 7: AI RISK ENGINE ---

  public getRiskForecast(): RiskForecast {
    return this.riskForecast;
  }

  // --- STEP 8: AI TIMELINE ENGINE ---

  public getTimelineForecast(): TimelineForecastPoint[] {
    const points: TimelineForecastPoint[] = [];
    const baseProgress = [0, 15, 30, 48, 58, 68, 78, 88, 95, 100];
    const baseCost = [0, 2.5, 5.2, 8.1, 10.5, 12.8, 14.5, 16.2, 17.8, 18.5];

    for (let i = 1; i <= 10; i++) {
      const isPast = i <= 3;
      const progressActual = isPast ? baseProgress[i - 1] * 1.05 : 0;
      const costActual = isPast ? baseCost[i - 1] * 1.02 : 0;

      // AI Forecast modeling with 8-day delay factor integrated
      const delayFactorProgress = isPast ? progressActual : Math.max(0, baseProgress[i - 1] - 4);
      const delayFactorCost = isPast ? costActual : baseCost[i - 1] * 1.04;

      points.push({
        date: `Week ${i}`,
        plannedProgress: baseProgress[i - 1],
        actualProgress: isPast ? progressActual : 0,
        forecastedProgress: isPast ? progressActual : delayFactorProgress,
        plannedCost: baseCost[i - 1],
        actualCost: isPast ? costActual : 0,
        forecastedCost: isPast ? costActual : delayFactorCost,
      });
    }

    return points;
  }
}

export const IntelligenceEngine = new EnterpriseConstructionIntelligenceEngine();
export default IntelligenceEngine;
