export interface Activity {
  id: string;
  name: string;
  trade: string;
  baseline_duration_days: number;
  remaining_duration_days: number;
  actual_progress: number;
  assigned_labor: number;
  required_labor: number;
  start_date?: string;
  finish_date?: string;
  baseline_start_date?: string;
  baseline_finish_date?: string;

  // CPM Outputs
  early_start: number;
  early_finish: number;
  late_start: number;
  late_finish: number;
  total_float: number;
  free_float: number;
  is_critical_path: boolean;

  // Delay metrics
  delay_impact_days: number;
  slippage_days: number;
  status: "completed" | "active" | "delayed" | "pending";
}

export interface Relationship {
  predecessor_id: string;
  successor_id: string;
  type: string; // FS, SS, FF, SF
  lag_days: number;
}

export interface ScheduleProject {
  project_id: string;
  name: string;
  activities: Activity[];
  relationships: Relationship[];
  start_date?: string;
  end_date?: string;
  baseline_end_date?: string;
  critical_path_status: "ON_TRACK" | "DELAY_RISK_DETECTED" | "CRITICAL_DELAY";
  total_delay_variance_days: number;
  risk_score: number;
}

export interface MonteCarloResult {
  iteration_runs: number;
  mean_delay_days: number;
  p10_delay_days: number;
  p50_delay_days: number;
  p90_delay_days: number;
  risk_score: number;
  completion_probability_by_baseline: number;
  probability_distribution: { delay_days: number; frequency: number }[];
}

export class ScheduleDelayEngineTS {
  /**
   * Helper to extract text inside XML tags using regex, safely
   */
  private static getTagValue(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i");
    const match = xml.match(regex);
    return match ? match[1].trim() : "";
  }

  /**
   * Parse MS Project duration string (e.g. PT40H0M0S = 40 hours = 5 days)
   */
  private static parseMSPDuration(durStr: string): number {
    if (!durStr) return 0;
    try {
      const cleaned = durStr.replace("PT", "").replace("S", "");
      let hours = 0;
      if (cleaned.includes("H")) {
        const parts = cleaned.split("H");
        hours += parseFloat(parts[0]);
        const rem = parts[1] || "";
        if (rem.includes("M")) {
          hours += parseFloat(rem.split("M")[0]) / 60;
        }
      } else if (cleaned.includes("M")) {
        hours += parseFloat(cleaned.split("M")[0]) / 60;
      }
      // Standard MS Project working hours/day is 8
      return hours / 8;
    } catch (e) {
      return 5;
    }
  }

  /**
   * Parse Primavera P6 XML
   */
  public static parseP6XML(xmlContent: string): ScheduleProject {
    const activities: Activity[] = [];
    const relationships: Relationship[] = [];

    let projectName = "Primavera Project";
    let projectId = "P6-PROJ";

    // Extract Project Name & ID
    const projectMatch = xmlContent.match(/<Project[^>]*>([\s\S]*?)<\/Project>/i);
    if (projectMatch) {
      const projXml = projectMatch[1];
      projectId = this.getTagValue(projXml, "ObjectId") || this.getTagValue(projXml, "Id") || projectId;
      projectName = this.getTagValue(projXml, "Name") || projectName;
    }

    // Extract Activities
    const activityMatches = xmlContent.match(/<Activity[^>]*>([\s\S]*?)<\/Activity>/gi) || [];
    for (const actXml of activityMatches) {
      const id = this.getTagValue(actXml, "ObjectId") || this.getTagValue(actXml, "Id") || this.getTagValue(actXml, "ActivityId");
      if (!id) continue;

      const name = this.getTagValue(actXml, "Name") || this.getTagValue(actXml, "ActivityName") || `Activity ${id}`;
      
      // Determine trade based on name
      let trade = "Structural";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("mep") || nameLower.includes("plumb") || nameLower.includes("elect") || nameLower.includes("hvac") || nameLower.includes("fire") || nameLower.includes("wire")) {
        trade = "MEP";
      } else if (nameLower.includes("brick") || nameLower.includes("wall") || nameLower.includes("drywall") || nameLower.includes("paint") || nameLower.includes("finish")) {
        trade = "Finishes";
      } else if (nameLower.includes("glaz") || nameLower.includes("glass") || nameLower.includes("cladd") || nameLower.includes("exterior") || nameLower.includes("facade")) {
        trade = "Exterior";
      }

      const baselineDur = parseFloat(this.getTagValue(actXml, "PlannedDuration") || this.getTagValue(actXml, "OriginalDuration") || "5");
      const remDur = parseFloat(this.getTagValue(actXml, "RemainingDuration") || "5");
      const progress = parseFloat(this.getTagValue(actXml, "PercentComplete") || "0");

      const startDate = this.getTagValue(actXml, "StartDate") || this.getTagValue(actXml, "ActualStartDate") || this.getTagValue(actXml, "PlannedStartDate") || undefined;
      const finishDate = this.getTagValue(actXml, "EndDate") || this.getTagValue(actXml, "ActualFinishDate") || this.getTagValue(actXml, "PlannedFinishDate") || undefined;

      activities.push({
        id,
        name,
        trade,
        baseline_duration_days: isNaN(baselineDur) ? 5 : Math.max(0.1, baselineDur),
        remaining_duration_days: isNaN(remDur) ? 5 : Math.max(0, remDur),
        actual_progress: isNaN(progress) ? 0 : Math.max(0, Math.min(100, progress)),
        assigned_labor: progress < 100 ? Math.floor(Math.random() * 6) + 6 : 0,
        required_labor: progress < 100 ? Math.floor(Math.random() * 6) + 8 : 0,
        start_date: startDate,
        finish_date: finishDate,
        baseline_start_date: startDate,
        baseline_finish_date: finishDate,
        early_start: 0,
        early_finish: 0,
        late_start: 0,
        late_finish: 0,
        total_float: 0,
        free_float: 0,
        is_critical_path: false,
        delay_impact_days: 0,
        slippage_days: 0,
        status: "pending"
      });
    }

    // Extract Relationships
    const relMatches = xmlContent.match(/<Relationship[^>]*>([\s\S]*?)<\/Relationship>/gi) || [];
    for (const relXml of relMatches) {
      const predecessor_id = this.getTagValue(relXml, "PredecessorActivityObjectId") || this.getTagValue(relXml, "PredecessorObjectId") || this.getTagValue(relXml, "PredecessorId");
      const successor_id = this.getTagValue(relXml, "SuccessorActivityObjectId") || this.getTagValue(relXml, "SuccessorObjectId") || this.getTagValue(relXml, "SuccessorId");
      
      if (predecessor_id && successor_id) {
        const type = this.getTagValue(relXml, "PredecessorType") || this.getTagValue(relXml, "Type") || "FS";
        const lagText = this.getTagValue(relXml, "Lag") || "0";
        const lag_days = parseFloat(lagText) || 0;

        relationships.push({
          predecessor_id,
          successor_id,
          type,
          lag_days
        });
      }
    }

    // Default connection if empty
    if (relationships.length === 0 && activities.length > 1) {
      for (let i = 0; i < activities.length - 1; i++) {
        relationships.push({
          predecessor_id: activities[i].id,
          successor_id: activities[i+1].id,
          type: "FS",
          lag_days: 0
        });
      }
    }

    return {
      project_id: projectId,
      name: projectName,
      activities,
      relationships,
      critical_path_status: "ON_TRACK",
      total_delay_variance_days: 0,
      risk_score: 0
    };
  }

  /**
   * Parse MS Project XML
   */
  public static parseMSPXML(xmlContent: string): ScheduleProject {
    const activities: Activity[] = [];
    const relationships: Relationship[] = [];

    let projectName = "Microsoft Project Export";
    let projectId = "MSP-PROJ";

    // Extract Title
    const nameMatch = xmlContent.match(/<Title[^>]*>([\s\S]*?)<\/Title>/i) || xmlContent.match(/<Name[^>]*>([\s\S]*?)<\/Name>/i);
    if (nameMatch) {
      projectName = nameMatch[1].trim();
    }

    // Extract Tasks
    const taskMatches = xmlContent.match(/<Task[^>]*>([\s\S]*?)<\/Task>/gi) || [];
    for (const taskXml of taskMatches) {
      const uid = this.getTagValue(taskXml, "UID");
      if (!uid) continue;

      // Skip summary tasks
      const isSummary = this.getTagValue(taskXml, "Summary") === "1";
      if (isSummary) continue;

      const name = this.getTagValue(taskXml, "Name") || `Task ${uid}`;
      
      // Determine trade
      let trade = "Structural";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("mep") || nameLower.includes("plumb") || nameLower.includes("elect") || nameLower.includes("hvac") || nameLower.includes("fire")) {
        trade = "MEP";
      } else if (nameLower.includes("brick") || nameLower.includes("wall") || nameLower.includes("drywall") || nameLower.includes("finish") || nameLower.includes("paint")) {
        trade = "Finishes";
      } else if (nameLower.includes("glaz") || nameLower.includes("glass") || nameLower.includes("cladd") || nameLower.includes("exterior") || nameLower.includes("facade")) {
        trade = "Exterior";
      }

      let baselineDur = this.parseMSPDuration(this.getTagValue(taskXml, "Duration"));
      if (baselineDur <= 0) {
        baselineDur = this.parseMSPDuration(this.getTagValue(taskXml, "RemainingDuration")) || 1;
      }

      let remDur = this.parseMSPDuration(this.getTagValue(taskXml, "RemainingDuration"));
      const pctComplete = parseFloat(this.getTagValue(taskXml, "PercentComplete") || "0");
      
      if (remDur === 0 && pctComplete === 100) {
        remDur = 0;
      } else if (remDur === 0) {
        remDur = baselineDur;
      }

      const startDate = this.getTagValue(taskXml, "Start") || undefined;
      const finishDate = this.getTagValue(taskXml, "Finish") || undefined;

      activities.push({
        id: uid,
        name,
        trade,
        baseline_duration_days: Math.max(0.1, baselineDur),
        remaining_duration_days: Math.max(0, remDur),
        actual_progress: isNaN(pctComplete) ? 0 : Math.max(0, Math.min(100, pctComplete)),
        assigned_labor: pctComplete < 100 ? Math.floor(Math.random() * 6) + 5 : 0,
        required_labor: pctComplete < 100 ? Math.floor(Math.random() * 6) + 7 : 0,
        start_date: startDate,
        finish_date: finishDate,
        baseline_start_date: startDate,
        baseline_finish_date: finishDate,
        early_start: 0,
        early_finish: 0,
        late_start: 0,
        late_finish: 0,
        total_float: 0,
        free_float: 0,
        is_critical_path: false,
        delay_impact_days: 0,
        slippage_days: 0,
        status: "pending"
      });

      // Predecessor Links
      const predMatches = taskXml.match(/<PredecessorLink[^>]*>([\s\S]*?)<\/PredecessorLink>/gi) || [];
      for (const predXml of predMatches) {
        const predUid = this.getTagValue(predXml, "PredecessorUID");
        if (predUid) {
          const typeCode = this.getTagValue(predXml, "Type") || "1";
          const typeMap: Record<string, string> = { "0": "FF", "1": "FS", "2": "SS", "3": "SF" };
          const relType = typeMap[typeCode] || "FS";

          const lagVal = parseFloat(this.getTagValue(predXml, "LinkLag")) || 0;
          // LinkLag inside MS Project is in tenths of a minute (e.g., 4800 = 8 hours = 1 day)
          const lag_days = Math.abs(lagVal) > 10 ? lagVal / 4800 : 0;

          relationships.push({
            predecessor_id: predUid,
            successor_id: uid,
            type: relType,
            lag_days
          });
        }
      }
    }

    if (relationships.length === 0 && activities.length > 1) {
      for (let i = 0; i < activities.length - 1; i++) {
        relationships.push({
          predecessor_id: activities[i].id,
          successor_id: activities[i+1].id,
          type: "FS",
          lag_days: 0
        });
      }
    }

    return {
      project_id: projectId,
      name: projectName,
      activities,
      relationships,
      critical_path_status: "ON_TRACK",
      total_delay_variance_days: 0,
      risk_score: 0
    };
  }

  /**
   * Run Critical Path Method (CPM)
   */
  public static calculateCPM(project: ScheduleProject): ScheduleProject {
    const activitiesMap = new Map<string, Activity>();
    for (const act of project.activities) {
      activitiesMap.set(act.id, act);
    }

    // Build Graph and calculate in-degree
    const adjList = new Map<string, { succId: string; rel: Relationship }[]>();
    const revAdjList = new Map<string, { predId: string; rel: Relationship }[]>();
    const inDegrees = new Map<string, number>();

    for (const act of project.activities) {
      adjList.set(act.id, []);
      revAdjList.set(act.id, []);
      inDegrees.set(act.id, 0);
    }

    for (const rel of project.relationships) {
      if (activitiesMap.has(rel.predecessor_id) && activitiesMap.has(rel.successor_id)) {
        adjList.get(rel.predecessor_id)!.push({ succId: rel.successor_id, rel });
        revAdjList.get(rel.successor_id)!.push({ predId: rel.predecessor_id, rel });
        inDegrees.set(rel.successor_id, inDegrees.get(rel.successor_id)! + 1);
      }
    }

    // Topological Sort (Kahn's Algorithm) with Cycle breaking
    const queue: string[] = [];
    for (const [id, deg] of inDegrees.entries()) {
      if (deg === 0) queue.push(id);
    }

    const orderedNodes: string[] = [];
    const tempInDegrees = new Map(inDegrees);

    while (queue.length > 0) {
      const u = queue.shift()!;
      orderedNodes.push(u);

      for (const edge of adjList.get(u)!) {
        const v = edge.succId;
        tempInDegrees.set(v, tempInDegrees.get(v)! - 1);
        if (tempInDegrees.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    // Cycle handling: if cyclic, break cycle
    if (orderedNodes.length < project.activities.length) {
      const missing = project.activities.filter(a => !orderedNodes.includes(a.id)).map(a => a.id);
      // Fallback topological order to ensure compilation doesn't crash
      for (const id of missing) {
        orderedNodes.push(id);
      }
    }

    // 1. FORWARD PASS: ES & EF
    for (const node of orderedNodes) {
      const act = activitiesMap.get(node)!;
      const preds = revAdjList.get(node)!;

      if (preds.length === 0) {
        act.early_start = 0;
      } else {
        let maxEf = 0;
        for (const predEdge of preds) {
          const predAct = activitiesMap.get(predEdge.predId)!;
          const rel = predEdge.rel;
          const lag = rel.lag_days;
          
          let val = 0;
          if (rel.type === "FS") {
            val = predAct.early_finish + lag;
          } else if (rel.type === "SS") {
            val = predAct.early_start + lag;
          } else if (rel.type === "FF") {
            val = predAct.early_finish - act.baseline_duration_days + lag;
          } else { // SF
            val = predAct.early_start - act.baseline_duration_days + lag;
          }
          if (val > maxEf) maxEf = val;
        }
        act.early_start = maxEf;
      }

      const effDur = act.actual_progress < 100 ? act.remaining_duration_days : 0;
      act.early_finish = act.early_start + effDur;
    }

    const totalDuration = Math.max(0, ...project.activities.map(a => a.early_finish));

    // 2. BACKWARD PASS: LF & LS
    for (let i = orderedNodes.length - 1; i >= 0; i--) {
      const node = orderedNodes[i];
      const act = activitiesMap.get(node)!;
      const succs = adjList.get(node)!;

      if (succs.length === 0) {
        act.late_finish = totalDuration;
      } else {
        let minLs = totalDuration;
        for (const succEdge of succs) {
          const succAct = activitiesMap.get(succEdge.succId)!;
          const rel = succEdge.rel;
          const lag = rel.lag_days;

          let val = 0;
          if (rel.type === "FS") {
            val = succAct.late_start - lag;
          } else if (rel.type === "SS") {
            val = succAct.late_start - lag + act.baseline_duration_days;
          } else if (rel.type === "FF") {
            val = succAct.late_finish - lag;
          } else { // SF
            val = succAct.late_finish - lag + act.baseline_duration_days;
          }
          if (val < minLs) minLs = val;
        }
        act.late_finish = minLs;
      }

      const effDur = act.actual_progress < 100 ? act.remaining_duration_days : 0;
      act.late_start = act.late_finish - effDur;
    }

    // 3. FLOATS & STATUSES
    for (const act of project.activities) {
      act.total_float = Math.max(0, parseFloat((act.late_finish - act.early_finish).toFixed(2)));
      
      const succs = adjList.get(act.id)!;
      if (succs.length === 0) {
        act.free_float = Math.max(0, parseFloat((totalDuration - act.early_finish).toFixed(2)));
      } else {
        let minSuccEs = Infinity;
        for (const succEdge of succs) {
          const succAct = activitiesMap.get(succEdge.succId)!;
          const rel = succEdge.rel;
          const lag = rel.lag_days;

          let val = 0;
          if (rel.type === "FS") {
            val = succAct.early_start - lag;
          } else if (rel.type === "SS") {
            val = succAct.early_start - lag + act.baseline_duration_days;
          } else if (rel.type === "FF") {
            val = succAct.early_finish - lag;
          } else {
            val = succAct.early_finish - lag + act.baseline_duration_days;
          }
          if (val < minSuccEs) minSuccEs = val;
        }
        act.free_float = Math.max(0, parseFloat((minSuccEs - act.early_finish).toFixed(2)));
      }

      act.is_critical_path = act.total_float <= 0.1 && act.actual_progress < 100;

      // Status updates
      if (act.actual_progress === 100) {
        act.status = "completed";
      } else if (act.actual_progress > 0) {
        act.status = act.is_critical_path ? "delayed" : "active";
      } else {
        act.status = "pending";
      }
    }

    const baselineSum = project.activities
      .filter(a => a.is_critical_path)
      .reduce((sum, a) => sum + a.baseline_duration_days, 0);

    project.total_delay_variance_days = Math.max(0, totalDuration - baselineSum);
    if (project.total_delay_variance_days > 15) {
      project.critical_path_status = "CRITICAL_DELAY";
    } else if (project.total_delay_variance_days > 5) {
      project.critical_path_status = "DELAY_RISK_DETECTED";
    } else {
      project.critical_path_status = "ON_TRACK";
    }

    return project;
  }

  /**
   * Run Monte Carlo Simulation
   */
  public static runMonteCarlo(
    project: ScheduleProject,
    iterations = 500,
    weatherSeverity = 1.0,
    laborShortageFactor = 1.0
  ): MonteCarloResult {
    const activitiesMap = new Map<string, Activity>();
    for (const act of project.activities) {
      activitiesMap.set(act.id, act);
    }

    // Build DAG adjacency lists
    const adjList = new Map<string, { succId: string; rel: Relationship }[]>();
    const revAdjList = new Map<string, { predId: string; rel: Relationship }[]>();
    for (const act of project.activities) {
      adjList.set(act.id, []);
      revAdjList.set(act.id, []);
    }
    for (const rel of project.relationships) {
      if (activitiesMap.has(rel.predecessor_id) && activitiesMap.has(rel.successor_id)) {
        adjList.get(rel.predecessor_id)!.push({ succId: rel.successor_id, rel });
        revAdjList.get(rel.successor_id)!.push({ predId: rel.predecessor_id, rel });
      }
    }

    // Topological order
    const orderedNodes: string[] = [];
    const inDegrees = new Map<string, number>();
    for (const act of project.activities) {
      inDegrees.set(act.id, revAdjList.get(act.id)!.length);
    }
    const queue: string[] = [];
    for (const [id, deg] of inDegrees.entries()) {
      if (deg === 0) queue.push(id);
    }
    while (queue.length > 0) {
      const u = queue.shift()!;
      orderedNodes.push(u);
      for (const edge of adjList.get(u)!) {
        const v = edge.succId;
        inDegrees.set(v, inDegrees.get(v)! - 1);
        if (inDegrees.get(v) === 0) queue.push(v);
      }
    }
    if (orderedNodes.length < project.activities.length) {
      // cycles present, append missing
      const missing = project.activities.filter(a => !orderedNodes.includes(a.id)).map(a => a.id);
      orderedNodes.push(...missing);
    }

    // Baseline project finish
    const baselineDurations = new Map<string, number>();
    for (const act of project.activities) {
      baselineDurations.set(act.id, act.baseline_duration_days);
    }
    const baselineFinish = this.runSingleCPMPass(orderedNodes, revAdjList, baselineDurations);

    const simulatedDurations: number[] = [];

    // Helper to draw from a triangular distribution
    const sampleTriangular = (min: number, max: number, mode: number): number => {
      const u = Math.random();
      const F = (mode - min) / (max - min);
      if (u < F) {
        return min + Math.sqrt(u * (max - min) * (mode - min));
      } else {
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      }
    };

    for (let iter = 0; iter < iterations; iter++) {
      const sampledDurations = new Map<string, number>();

      for (const act of project.activities) {
        if (act.actual_progress === 100) {
          sampledDurations.set(act.id, 0);
          continue;
        }

        const a = act.baseline_duration_days * 0.85;
        let m = act.baseline_duration_days;
        let b = act.baseline_duration_days * 1.5;

        // Apply labor ratios
        const laborRatio = act.assigned_labor / Math.max(1, act.required_labor);
        const laborPenalty = laborRatio >= 1.0 ? 1.0 : (1.0 + (1.0 - laborRatio) * 1.5);

        // Apply weather risk
        let weatherMultiplier = 1.0;
        if (weatherSeverity > 1.2) {
          if (act.trade === "Structural" || act.trade === "Exterior") {
            weatherMultiplier = weatherSeverity;
          } else {
            weatherMultiplier = 1.0 + (weatherSeverity - 1.0) * 0.3;
          }
        }

        b = b * laborPenalty * weatherMultiplier * laborShortageFactor;
        m = m * (1.0 + (weatherMultiplier - 1.0) * 0.4);

        // Standard sample
        const sampledDur = sampleTriangular(a, Math.max(a + 0.1, b), m);
        const remainingPct = 1.0 - (act.actual_progress / 100);
        sampledDurations.set(act.id, Math.max(0, sampledDur * remainingPct));
      }

      const projFinish = this.runSingleCPMPass(orderedNodes, revAdjList, sampledDurations);
      simulatedDurations.push(projFinish);
    }

    const delays = simulatedDurations.map(dur => Math.max(0, parseFloat((dur - baselineFinish).toFixed(1))));
    delays.sort((a, b) => a - b);

    const p10 = delays[Math.floor(delays.length * 0.10)];
    const p50 = delays[Math.floor(delays.length * 0.50)];
    const p90 = delays[Math.floor(delays.length * 0.90)];
    const meanDelay = delays.reduce((sum, d) => sum + d, 0) / delays.length;

    const onTimeRuns = delays.filter(d => d <= 0.5).length;
    const completionProb = onTimeRuns / delays.length;

    // Build Frequency Distribution
    const freqMap = new Map<number, number>();
    for (const d of delays) {
      const rounded = Math.round(d);
      freqMap.set(rounded, (freqMap.get(rounded) || 0) + 1);
    }

    const probabilityDistribution = Array.from(freqMap.entries())
      .map(([delay_days, frequency]) => ({ delay_days, frequency }))
      .sort((a, b) => a.delay_days - b.delay_days);

    const riskScore = Math.min(100, Math.max(0, (meanDelay * 3.0) + (p90 - p50) * 1.5 + (1.0 - completionProb) * 40.0));

    return {
      iteration_runs: iterations,
      mean_delay_days: parseFloat(meanDelay.toFixed(1)),
      p10_delay_days: p10,
      p50_delay_days: p50,
      p90_delay_days: p90,
      risk_score: parseFloat(riskScore.toFixed(1)),
      completion_probability_by_baseline: parseFloat((completionProb * 100).toFixed(1)),
      probability_distribution: probabilityDistribution
    };
  }

  private static runSingleCPMPass(
    orderedNodes: string[],
    revAdjList: Map<string, { predId: string; rel: Relationship }[]>,
    durations: Map<string, number>
  ): number {
    const earliestFinish = new Map<string, number>();

    for (const node of orderedNodes) {
      const preds = revAdjList.get(node)!;
      let es = 0;

      if (preds.length > 0) {
        let maxEf = 0;
        for (const predEdge of preds) {
          const predId = predEdge.predId;
          const rel = predEdge.rel;
          const lag = rel.lag_days;

          let val = 0;
          if (rel.type === "FS") {
            val = (earliestFinish.get(predId) || 0) + lag;
          } else if (rel.type === "SS") {
            val = ((earliestFinish.get(predId) || 0) - (durations.get(predId) || 0)) + lag;
          } else if (rel.type === "FF") {
            val = (earliestFinish.get(predId) || 0) - (durations.get(node) || 0) + lag;
          } else { // SF
            val = ((earliestFinish.get(predId) || 0) - (durations.get(predId) || 0)) - (durations.get(node) || 0) + lag;
          }
          if (val > maxEf) maxEf = val;
        }
        es = maxEf;
      }

      earliestFinish.set(node, es + (durations.get(node) || 0));
    }

    return earliestFinish.size > 0 ? Math.max(...Array.from(earliestFinish.values())) : 0;
  }
}
