/**
 * TracProgress® Enterprise Workflow & Automation Engine
 * 
 * Orchestrates multi-disciplinary approvals, automation rules, task delegation, 
 * SLA tracking, and audit trails across BIM, Schedules, QMS, and Commercials.
 * Synchronized with the TracProgress event-driven architecture.
 */

import { IntelligenceEngine, EnterpriseEvent } from "./IntelligenceEngine";

// --- CORE TYPES ---

export type WorkflowStatus = "draft" | "active" | "suspended" | "completed" | "overdue";

export type StageType = "initiation" | "review" | "approval" | "action" | "verification" | "closure";

export type ApprovalType = "single" | "sequential" | "parallel" | "conditional";

export interface WorkflowStage {
  id: string;
  name: string;
  type: StageType;
  status: "pending" | "in_progress" | "approved" | "rejected" | "skipped";
  assignedRole: string;
  assignedUser: string;
  approvalType?: ApprovalType;
  requiredApprovers?: string[]; // roles or usernames
  approvalsCountNeeded?: number;
  completedApprovals?: Array<{
    user: string;
    role: string;
    status: "approved" | "rejected";
    timestamp: string;
    comment: string;
    signature?: string;
  }>;
  deadlineHours: number;
  actualDurationHours?: number;
  startedAt?: string;
  completedAt?: string;
  slaBreached?: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "Quality" | "Inspection" | "Safety" | "Document" | "Commercial" | "Operations";
  stages: WorkflowStage[];
  slaTargetHours: number;
  canDuplicate: boolean;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  currentStageId: string;
  stages: WorkflowStage[];
  category: string;
  linkedEntity?: {
    type: "BIM" | "Issue" | "Document" | "Schedule" | "Project" | "Commercial";
    id: string;
    name: string;
  };
  initiatedBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  slaTargetHours: number;
  totalDurationHours?: number;
  slaBreached: boolean;
}

// --- AUTOMATION RULES ENGINE TYPES ---

export type RuleTrigger = 
  | "INSPECTION_FAILED"
  | "QUALITY_FAILURE"
  | "ISSUE_CREATED"
  | "DOCUMENT_APPROVED"
  | "DELAY_INCREASED"
  | "SCHEDULE_RISK_FLAGGED"
  | "MANUAL";

export type RuleActionType = 
  | "TRIGGER_WORKFLOW"
  | "CREATE_TASK"
  | "SEND_NOTIFICATION"
  | "UPDATE_DASHBOARD_SCORE"
  | "ESCALATE_SLA"
  | "POST_WEBHOOK";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: RuleTrigger;
  conditions: Array<{
    field: string;
    operator: "equals" | "greater_than" | "less_than" | "contains";
    value: string;
  }>;
  actions: Array<{
    type: RuleActionType;
    params: Record<string, any>;
  }>;
  isEnabled: boolean;
  timesTriggered: number;
  lastTriggeredAt?: string;
}

// --- TASK MANAGEMENT TYPES ---

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskStatus = "pending" | "in_progress" | "blocked" | "completed";

export interface AutomatedTask {
  id: string;
  workflowInstanceId?: string;
  stageId?: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[]; // task IDs
  attachments: string[];
  linkedProject: string;
  linkedRoom?: string;
  linkedBimElement?: string;
  linkedIssue?: string;
  reminderSent: boolean;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly";
}

// --- AUDIT TRAIL TYPES ---

export interface WorkflowAuditLog {
  id: string;
  workflowInstanceId: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  previousState: string;
  newState: string;
  reason: string;
  comments: string;
  signature?: string;
}

// --- SLA MONITORING TYPES ---

export interface SLAMetrics {
  totalWorkflows: number;
  completedOnTime: number;
  overdueCount: number;
  averageResponseTimeHours: number;
  slaCompliancePercentage: number;
  bottlenecks: Array<{
    stageName: string;
    category: string;
    avgDelayHours: number;
    count: number;
  }>;
}

// --- NOTIFICATION AUTOMATION TYPES ---

export interface AutomatedNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  channel: "in-app" | "email" | "sms" | "push" | "webhook";
  status: "delivered" | "failed" | "queued";
  recipient: string;
  deliveryLog: string;
}

// --- CLASS IMPLEMENTATION ---

class EnterpriseWorkflowAutomationEngine {
  private templates: WorkflowTemplate[] = [];
  private workflows: WorkflowInstance[] = [];
  private rules: AutomationRule[] = [];
  private tasks: AutomatedTask[] = [];
  private auditLogs: WorkflowAuditLog[] = [];
  private notifications: AutomatedNotification[] = [];
  
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.initializeEngine();
    this.setupEventBusSubscribers();
  }

  private initializeEngine() {
    this.seedTemplates();
    this.seedRules();
    this.seedWorkflows();
    this.seedTasks();
    this.seedAuditLogs();
    this.seedNotifications();
  }

  // Allow views to subscribe to state updates
  public subscribeToChanges(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error("Error notifying subscriber in WorkflowEngine:", err);
      }
    });
  }

  // --- STEP 10: INTEGRATE WITH EVENT BUS ---
  private setupEventBusSubscribers() {
    // Listen to ALL events on the site event bus
    IntelligenceEngine.subscribe("*", (event: EnterpriseEvent) => {
      this.processEventRules(event);
    });
  }

  // --- STEP 4: AUTOMATION RULES PROCESSOR ---
  private processEventRules(event: EnterpriseEvent) {
    const activeRules = this.rules.filter((r) => r.isEnabled && r.trigger === event.type);
    
    activeRules.forEach((rule) => {
      // Check conditions
      let conditionsMet = true;
      for (const cond of rule.conditions) {
        let fieldVal = "";
        
        if (cond.field === "source") fieldVal = event.source;
        else if (cond.field === "category") fieldVal = event.payload?.category || "";
        else if (cond.field === "delayDays") fieldVal = String(event.payload?.delayDays || "");
        else if (cond.field === "level" || cond.field === "severity") fieldVal = event.payload?.level || event.payload?.severity || "";

        if (cond.operator === "equals" && fieldVal !== cond.value) {
          conditionsMet = false;
          break;
        }
        if (cond.operator === "greater_than" && Number(fieldVal) <= Number(cond.value)) {
          conditionsMet = false;
          break;
        }
        if (cond.operator === "contains" && !fieldVal.includes(cond.value)) {
          conditionsMet = false;
          break;
        }
      }

      if (conditionsMet) {
        this.executeRuleActions(rule, event);
      }
    });
  }

  private executeRuleActions(rule: AutomationRule, event: EnterpriseEvent) {
    rule.timesTriggered += 1;
    rule.lastTriggeredAt = new Date().toISOString();

    rule.actions.forEach((action) => {
      switch (action.type) {
        case "TRIGGER_WORKFLOW": {
          const templateId = action.params.templateId;
          const name = action.params.namePrefix ? `${action.params.namePrefix} - ${event.source}` : `Auto WF [${rule.name}]`;
          this.triggerWorkflowFromTemplate(templateId, name, {
            type: "Issue",
            id: event.payload?.issueId || event.payload?.anomalyId || "gen-101",
            name: event.description
          });
          break;
        }
        case "CREATE_TASK": {
          this.createTask({
            title: action.params.title || `Automated Task: Verify ${event.type}`,
            description: action.params.description || `Sourced from event: ${event.description}`,
            owner: action.params.owner || "QA Lead",
            dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split("T")[0],
            priority: action.params.priority || "high",
            linkedProject: "proj-01",
            linkedIssue: event.payload?.issueId || event.payload?.anomalyId,
            dependencies: [],
            attachments: [],
            isRecurring: false,
            status: "pending"
          });
          break;
        }
        case "SEND_NOTIFICATION": {
          this.sendAutomatedNotification(
            action.params.title || "TracProgress Security Escalation",
            action.params.message || `Automation Rule ${rule.name} triggered.`,
            action.params.recipient || "pm@tracprogress.com",
            action.params.channel || "email"
          );
          break;
        }
        case "UPDATE_DASHBOARD_SCORE": {
          // Send notification payload back to event bus so dashboard can read or reflect
          IntelligenceEngine.publish(
            "METRIC_MUTATED",
            "AutomationEngine",
            { delta: action.params.delta, metric: action.params.metric },
            `Automation Rule [${rule.name}] adjusted dashboard score: ${action.params.metric} by ${action.params.delta}.`
          );
          break;
        }
        case "ESCALATE_SLA": {
          this.sendAutomatedNotification(
            "CRITICAL SLA BREACH EXTREME",
            `Escalating critical SLA on ongoing workflows: ${event.description}`,
            "director@tracprogress.com",
            "push"
          );
          break;
        }
        case "POST_WEBHOOK": {
          this.sendAutomatedNotification(
            "WEBHOOK OUTBOUND SENT",
            `Triggered endpoint: ${action.params.endpoint} with payload.`,
            action.params.endpoint,
            "webhook"
          );
          break;
        }
      }
    });

    this.notifySubscribers();
  }

  // --- CORE GETTERS / MUTATORS ---

  public getTemplates(): WorkflowTemplate[] {
    return this.templates;
  }

  public getWorkflows(): WorkflowInstance[] {
    return this.workflows;
  }

  public getRules(): AutomationRule[] {
    return this.rules;
  }

  public getTasks(): AutomatedTask[] {
    return this.tasks;
  }

  public getAuditLogs(workflowId?: string): WorkflowAuditLog[] {
    if (workflowId) {
      return this.auditLogs.filter((l) => l.workflowInstanceId === workflowId);
    }
    return this.auditLogs;
  }

  public getNotifications(): AutomatedNotification[] {
    return this.notifications;
  }

  // --- STEP 2: WORKFLOW DESIGNER SERVICES ---

  public createTemplate(template: Omit<WorkflowTemplate, "canDuplicate">): WorkflowTemplate {
    const newTpl: WorkflowTemplate = {
      ...template,
      canDuplicate: true,
    };
    this.templates.push(newTpl);
    this.notifySubscribers();
    return newTpl;
  }

  public duplicateTemplate(templateId: string): WorkflowTemplate | null {
    const original = this.templates.find((t) => t.id === templateId);
    if (!original) return null;

    const copy: WorkflowTemplate = {
      ...original,
      id: `tpl-${Math.floor(Math.random() * 1000000)}`,
      name: `${original.name} (Copy)`,
      canDuplicate: true,
    };
    this.templates.push(copy);
    this.notifySubscribers();
    return copy;
  }

  public triggerWorkflowFromTemplate(
    templateId: string, 
    name: string, 
    linkedEntity?: WorkflowInstance["linkedEntity"]
  ): WorkflowInstance | null {
    const tpl = this.templates.find((t) => t.id === templateId);
    if (!tpl) return null;

    // Deep copy stages
    const clonedStages: WorkflowStage[] = tpl.stages.map((stg, idx) => ({
      ...stg,
      status: idx === 0 ? "in_progress" : "pending",
      startedAt: idx === 0 ? new Date().toISOString() : undefined,
    }));

    const newWf: WorkflowInstance = {
      id: `wf-${Math.floor(Math.random() * 1000000)}`,
      templateId,
      name,
      description: tpl.description,
      status: "active",
      currentStageId: clonedStages[0]?.id || "",
      stages: clonedStages,
      category: tpl.category,
      linkedEntity,
      initiatedBy: "System Automation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaTargetHours: tpl.slaTargetHours,
      slaBreached: false,
    };

    this.workflows.unshift(newWf);
    
    // Generate tasks for the first stage
    this.generateStageTasks(newWf, clonedStages[0]);

    this.logWorkflowAction(
      newWf.id,
      "System Automation",
      "System Bot",
      "Initiated Workflow",
      "None",
      "active",
      `Workflow triggered from template '${tpl.name}'`
    );

    // Notify Event Bus
    IntelligenceEngine.publish(
      "WORKFLOW_INITIATED",
      "WorkflowEngine",
      { workflowId: newWf.id, templateId },
      `Autonomous Workflow Initiated: '${newWf.name}' for category ${newWf.category}.`
    );

    this.notifySubscribers();
    return newWf;
  }

  // --- STEP 3: APPROVAL ENGINE SERVICES ---

  public submitApproval(
    workflowId: string,
    stageId: string,
    user: string,
    role: string,
    status: "approved" | "rejected",
    comment: string,
    signature?: string
  ): boolean {
    const wf = this.workflows.find((w) => w.id === workflowId);
    if (!wf) return false;

    const stageIndex = wf.stages.findIndex((s) => s.id === stageId);
    if (stageIndex === -1) return false;

    const stage = wf.stages[stageIndex];
    if (stage.status !== "in_progress") return false;

    // Register this approval
    if (!stage.completedApprovals) {
      stage.completedApprovals = [];
    }

    stage.completedApprovals.push({
      user,
      role,
      status,
      timestamp: new Date().toISOString(),
      comment,
      signature
    });

    const isSequential = stage.approvalType === "sequential";
    const isParallel = stage.approvalType === "parallel";
    
    let isStageFullyApproved = false;
    let isStageRejected = status === "rejected";

    if (isStageRejected) {
      stage.status = "rejected";
    } else {
      // Determine if criteria met
      if (isParallel && stage.requiredApprovers) {
        // Parallel: Check if all required roles have approved
        const approvedRoles = stage.completedApprovals
          .filter((a) => a.status === "approved")
          .map((a) => a.role);
        isStageFullyApproved = stage.requiredApprovers.every((r) => approvedRoles.includes(r));
      } else if (stage.approvalsCountNeeded) {
        // Parallel/Threshold: check counts
        const approvedCount = stage.completedApprovals.filter((a) => a.status === "approved").length;
        isStageFullyApproved = approvedCount >= stage.approvalsCountNeeded;
      } else {
        // Single approval standard
        isStageFullyApproved = true;
      }
    }

    if (isStageFullyApproved) {
      stage.status = "approved";
      stage.completedAt = new Date().toISOString();
      
      // Calculate active duration
      if (stage.startedAt) {
        const deltaMs = Date.now() - new Date(stage.startedAt).getTime();
        stage.actualDurationHours = deltaMs / (3600 * 1000);
        if (stage.actualDurationHours > stage.deadlineHours) {
          stage.slaBreached = true;
          wf.slaBreached = true;
        }
      }

      this.logWorkflowAction(
        wf.id,
        user,
        role,
        "Stage Approved",
        "in_progress",
        "approved",
        `Stage [${stage.name}] fully approved by ${user}. Comment: ${comment}`,
        signature
      );

      // Advance to next stage if available
      const nextStageIndex = stageIndex + 1;
      if (nextStageIndex < wf.stages.length) {
        const nextStage = wf.stages[nextStageIndex];
        nextStage.status = "in_progress";
        nextStage.startedAt = new Date().toISOString();
        wf.currentStageId = nextStage.id;

        // Auto generate tasks for next stage
        this.generateStageTasks(wf, nextStage);

        this.logWorkflowAction(
          wf.id,
          "System Bot",
          "Automator",
          "Stage Advanced",
          stage.name,
          nextStage.name,
          `Workflow advanced to stage [${nextStage.name}]. Assigned to: ${nextStage.assignedRole}`
        );
      } else {
        // Workflow completed fully!
        wf.status = "completed";
        wf.completedAt = new Date().toISOString();
        
        if (wf.createdAt) {
          const totalMs = Date.now() - new Date(wf.createdAt).getTime();
          wf.totalDurationHours = totalMs / (3600 * 1000);
        }

        this.logWorkflowAction(
          wf.id,
          "System Bot",
          "Automator",
          "Workflow Completed",
          "active",
          "completed",
          `Unified workflow '${wf.name}' closed out successfully.`
        );

        // Notify Event Bus of fully completed workflow
        IntelligenceEngine.publish(
          "WORKFLOW_COMPLETED",
          "WorkflowEngine",
          { workflowId: wf.id, finalStatus: "completed" },
          `Audit Verified: Enterprise Workflow '${wf.name}' fully completed and signed.`
        );
      }
    } else if (isStageRejected) {
      wf.status = "draft"; // Or returned back
      this.logWorkflowAction(
        wf.id,
        user,
        role,
        "Stage Rejected",
        "in_progress",
        "rejected",
        `Stage [${stage.name}] was rejected by ${user}. Action reverted. Reason: ${comment}`,
        signature
      );

      // Auto flag risk or issue update
      IntelligenceEngine.publish(
        "WORKFLOW_REJECTED",
        "WorkflowEngine",
        { workflowId: wf.id, rejectedBy: user },
        `Escalation Notice: Stage in workflow '${wf.name}' rejected. Review demanded.`
      );
    } else {
      // Partially approved (waiting for more signs)
      this.logWorkflowAction(
        wf.id,
        user,
        role,
        "Approval Signature Added",
        "in_progress",
        "in_progress",
        `Add signature from ${user} (${role}). Awaiting remaining parallel signers.`,
        signature
      );
    }

    this.notifySubscribers();
    return true;
  }

  // --- STEP 5: TASK GENERATOR ---

  public createTask(task: Omit<AutomatedTask, "id" | "reminderSent">): AutomatedTask {
    const newTask: AutomatedTask = {
      ...task,
      id: `task-${Math.floor(Math.random() * 1000000)}`,
      reminderSent: false,
    };
    this.tasks.unshift(newTask);
    this.notifySubscribers();
    return newTask;
  }

  public completeTask(taskId: string): boolean {
    const t = this.tasks.find((tk) => tk.id === taskId);
    if (t) {
      t.status = "completed";
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  private generateStageTasks(wf: WorkflowInstance, stage: WorkflowStage) {
    const linkedIssueId = wf.linkedEntity?.type === "Issue" ? wf.linkedEntity.id : undefined;
    const linkedBimId = wf.linkedEntity?.type === "BIM" ? wf.linkedEntity.id : undefined;

    // Task for the specific assignee
    this.createTask({
      workflowInstanceId: wf.id,
      stageId: stage.id,
      title: `${stage.name} - Action Required`,
      description: `Complete stage [${stage.name}] for workflow '${wf.name}'. Task constraints: ${stage.type} checklist.`,
      owner: stage.assignedUser || `Lead ${stage.assignedRole}`,
      dueDate: new Date(Date.now() + stage.deadlineHours * 3600 * 1000).toISOString().split("T")[0],
      priority: stage.type === "approval" ? "high" : "medium",
      status: "pending",
      dependencies: [],
      attachments: [],
      linkedProject: "proj-01",
      linkedBimElement: linkedBimId,
      linkedIssue: linkedIssueId,
      isRecurring: false
    });
  }

  // --- STEP 6: NOTIFICATION DISPATCH ---

  public sendAutomatedNotification(
    title: string,
    message: string,
    recipient: string,
    channel: AutomatedNotification["channel"]
  ): AutomatedNotification {
    const notif: AutomatedNotification = {
      id: `notif-wf-${Math.floor(Math.random() * 1000000)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      channel,
      recipient,
      status: "delivered",
      deliveryLog: `Handshake OK. Channel ${channel} routed through SMTP/AWS-SNS cluster.`
    };
    this.notifications.unshift(notif);
    this.notifySubscribers();
    return notif;
  }

  // --- STEP 8: AUDIT TRAIL WRITER ---

  private logWorkflowAction(
    wfId: string,
    user: string,
    role: string,
    action: string,
    prevState: string,
    newState: string,
    comments: string,
    signature?: string
  ) {
    const log: WorkflowAuditLog = {
      id: `audit-${Math.floor(Math.random() * 1000000)}`,
      workflowInstanceId: wfId,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      previousState: prevState,
      newState,
      reason: "Workflow State Transition",
      comments,
      signature
    };
    this.auditLogs.unshift(log);
  }

  // --- STEP 7: SLA CALCULATOR ---

  public getSLAMetrics(): SLAMetrics {
    const active = this.workflows;
    const completed = active.filter((w) => w.status === "completed");
    
    // Bottlenecks list
    const stagesList: Record<string, { totalHours: number; count: number; category: string }> = {};
    active.forEach((wf) => {
      wf.stages.forEach((stg) => {
        if (stg.status === "approved" || stg.status === "rejected") {
          const duration = stg.actualDurationHours || 12;
          if (!stagesList[stg.name]) {
            stagesList[stg.name] = { totalHours: 0, count: 0, category: wf.category };
          }
          stagesList[stg.name].totalHours += duration;
          stagesList[stg.name].count += 1;
        }
      });
    });

    const bottlenecks = Object.entries(stagesList).map(([name, data]) => ({
      stageName: name,
      category: data.category,
      avgDelayHours: parseFloat((data.totalHours / data.count).toFixed(1)),
      count: data.count,
    })).sort((a, b) => b.avgDelayHours - a.avgDelayHours);

    const total = active.length;
    const breached = active.filter((w) => w.slaBreached || w.status === "overdue").length;
    const onTime = total - breached;

    return {
      totalWorkflows: total,
      completedOnTime: completed.filter((w) => !w.slaBreached).length,
      overdueCount: breached,
      averageResponseTimeHours: total > 0 ? parseFloat((completed.reduce((acc, w) => acc + (w.totalDurationHours || 0), 0) / (completed.length || 1)).toFixed(1)) : 0,
      slaCompliancePercentage: total > 0 ? Math.round((onTime / total) * 100) : 100,
      bottlenecks: bottlenecks.slice(0, 4)
    };
  }

  // --- SEED INITIALIZERS ---

  private seedTemplates() {
    this.templates = [
      {
        id: "tpl-inspection",
        name: "Standard Structural Inspection",
        description: "Standard workflow for civil structural column and concrete slab verification. Spans QC field scanning up to PM release approval.",
        category: "Inspection",
        slaTargetHours: 48,
        canDuplicate: false,
        stages: [
          { id: "stg-01", name: "Drone Orthomosaic Capture", type: "initiation", status: "pending", assignedRole: "Civil QA Engineer", assignedUser: "Rajesh Kumar", deadlineHours: 12 },
          { id: "stg-02", name: "AI Alignment Variance Check", type: "review", status: "pending", assignedRole: "AI Lead Operator", assignedUser: "Staff Operator (You)", deadlineHours: 6 },
          { id: "stg-03", name: "Structural Design Sign-off", type: "approval", status: "pending", assignedRole: "Project Manager", assignedUser: "Arvind Swamy", approvalType: "single", deadlineHours: 24 },
          { id: "stg-04", name: "Close Permit", type: "closure", status: "pending", assignedRole: "Site Auditor", assignedUser: "Inspector General", deadlineHours: 6 }
        ]
      },
      {
        id: "tpl-issue-res",
        name: "Concrete NCR Quality Failure Resolution",
        description: "Full Non-Conformance Report (NCR) process to investigate, re-work, and verify concrete geometric deviations.",
        category: "Quality",
        slaTargetHours: 72,
        canDuplicate: false,
        stages: [
          { id: "stg-11", name: "Log NCR Deviation", type: "initiation", status: "pending", assignedRole: "Lead QA Engineer", assignedUser: "Rajesh Kumar", deadlineHours: 12 },
          { id: "stg-12", name: "Remediation Planning", type: "review", status: "pending", assignedRole: "Structural Design Consultant", assignedUser: "Dr. Vikram Seth", deadlineHours: 24 },
          { id: "stg-13", name: "Overtime Trade Action Dispatch", type: "action", status: "pending", assignedRole: "Subcontractor Foreman", assignedUser: "Abhinav Singh", deadlineHours: 24 },
          { id: "stg-14", name: "Joint verification audit", type: "verification", status: "pending", assignedRole: "Client Representative", assignedUser: "Siddharth Chitiki", approvalType: "parallel", requiredApprovers: ["Client Representative", "Project Manager"], approvalsCountNeeded: 2, deadlineHours: 12 }
        ]
      },
      {
        id: "tpl-doc-app",
        name: "Commercial Change Order Request",
        description: "BPM change order approval workflow with multi-level budgets escalation rules.",
        category: "Commercial",
        slaTargetHours: 120,
        canDuplicate: false,
        stages: [
          { id: "stg-21", name: "Submit Pricing Variance", type: "initiation", status: "pending", assignedRole: "Quantity Surveyor", assignedUser: "Ananya Hegde", deadlineHours: 24 },
          { id: "stg-22", name: "Budget Availability Review", type: "review", status: "pending", assignedRole: "Commercial Director", assignedUser: "Meera Nair", deadlineHours: 48 },
          { id: "stg-23", name: "Executive Capital Authorization", type: "approval", status: "pending", assignedRole: "Chief Executive Officer", assignedUser: "Gopal Krishna", approvalType: "sequential", requiredApprovers: ["Commercial Director", "Chief Executive Officer"], approvalsCountNeeded: 2, deadlineHours: 48 }
        ]
      }
    ];
  }

  private seedRules() {
    this.rules = [
      {
        id: "rule-wf-01",
        name: "Escalate Rebar Spacing Quality Anomaly",
        description: "If drone computer vision detects under-density or axial misalignment -> Auto launch Quality NCR Workflow.",
        trigger: "QUALITY_FAILURE",
        conditions: [],
        actions: [
          { type: "TRIGGER_WORKFLOW", params: { templateId: "tpl-issue-res", namePrefix: "NCR Auto Escalation" } },
          { type: "SEND_NOTIFICATION", params: { title: "Automated Escalation Initiated", recipient: "qa-lead@tracprogress.com", message: "Quality anomaly flagged. Non-Conformance workflow booted." } }
        ],
        isEnabled: true,
        timesTriggered: 2
      },
      {
        id: "rule-wf-02",
        name: "Baseline Delay Multi-Level Budget Review",
        description: "If Gantt schedule slippage exceeds 5 days -> Alert Commercial Desk to check liquidated damages.",
        trigger: "DELAY_INCREASED",
        conditions: [
          { field: "delayDays", operator: "greater_than", value: "5" }
        ],
        actions: [
          { type: "CREATE_TASK", params: { title: "Audit Delay Liquidity Damages", description: "Schedule slipped past RERA buffer. Verify contractual trade penalties.", owner: "Commercial Manager" } },
          { type: "SEND_NOTIFICATION", params: { title: "WARNING: Milestone Slip Contract risk", recipient: "commercial@tracprogress.com", message: "Delayed milestone exceeds 5 days. Contingency review suggested." } }
        ],
        isEnabled: true,
        timesTriggered: 1
      },
      {
        id: "rule-wf-03",
        name: "Auto-Accept Safe Walk Log",
        description: "If manual inspection passes -> Post webhook to enterprise Slack group.",
        trigger: "DOCUMENT_APPROVED",
        conditions: [],
        actions: [
          { type: "POST_WEBHOOK", params: { endpoint: "https://hooks.slack.com/services/tracprogress-ops" } }
        ],
        isEnabled: true,
        timesTriggered: 0
      }
    ];
  }

  private seedWorkflows() {
    this.workflows = [
      {
        id: "wf-inst-01",
        templateId: "tpl-inspection",
        name: "Level 3 Structural Layout Inspection #42",
        description: "Standard workflow for civil structural column and concrete slab verification. Spans QC field scanning up to PM release approval.",
        status: "active",
        currentStageId: "stg-02",
        category: "Inspection",
        initiatedBy: "Rajesh Kumar",
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        slaTargetHours: 48,
        slaBreached: false,
        stages: [
          {
            id: "stg-01",
            name: "Drone Orthomosaic Capture",
            type: "initiation",
            status: "approved",
            assignedRole: "Civil QA Engineer",
            assignedUser: "Rajesh Kumar",
            deadlineHours: 12,
            startedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
            actualDurationHours: 4,
            completedApprovals: [
              { user: "Rajesh Kumar", role: "Civil QA Engineer", status: "approved", timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), comment: "Flight completed. Density images uploaded." }
            ]
          },
          {
            id: "stg-02",
            name: "AI Alignment Variance Check",
            type: "review",
            status: "in_progress",
            assignedRole: "AI Lead Operator",
            assignedUser: "Staff Operator (You)",
            deadlineHours: 6,
            startedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
          },
          {
            id: "stg-03",
            name: "Structural Design Sign-off",
            type: "approval",
            status: "pending",
            assignedRole: "Project Manager",
            assignedUser: "Arvind Swamy",
            approvalType: "single",
            deadlineHours: 24
          },
          {
            id: "stg-04",
            name: "Close Permit",
            type: "closure",
            status: "pending",
            assignedRole: "Site Auditor",
            assignedUser: "Inspector General",
            deadlineHours: 6
          }
        ],
        linkedEntity: {
          type: "BIM",
          id: "col_c4",
          name: "Level 3 Column C4 Layout"
        }
      }
    ];
  }

  private seedTasks() {
    this.tasks = [
      {
        id: "task-01",
        workflowInstanceId: "wf-inst-01",
        stageId: "stg-02",
        title: "Inference Walk: Level 3 Alignment Grid",
        description: "Conduct 3D orthophoto comparison using model weights on Zone B rebar nodes.",
        owner: "Staff Operator (You)",
        dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString().split("T")[0],
        priority: "high",
        status: "in_progress",
        dependencies: [],
        attachments: [],
        linkedProject: "proj-01",
        linkedBimElement: "col_c4",
        reminderSent: false,
        isRecurring: false
      },
      {
        id: "task-02",
        title: "Weekly PM Coordination Alignment",
        description: "Verify subcontractors head counts and dispatch logs manually in database.",
        owner: "Arvind Swamy",
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split("T")[0],
        priority: "medium",
        status: "pending",
        dependencies: [],
        attachments: [],
        linkedProject: "proj-01",
        reminderSent: false,
        isRecurring: true,
        recurrencePattern: "weekly"
      }
    ];
  }

  private seedAuditLogs() {
    this.auditLogs = [
      {
        id: "audit-01",
        workflowInstanceId: "wf-inst-01",
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        user: "Rajesh Kumar",
        role: "Civil QA Engineer",
        action: "Initiated Workflow",
        previousState: "None",
        newState: "active",
        reason: "Manual Creation",
        comments: "Launched Level 3 Structural layout inspection workflow."
      },
      {
        id: "audit-02",
        workflowInstanceId: "wf-inst-01",
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        user: "Rajesh Kumar",
        role: "Civil QA Engineer",
        action: "Stage Approved",
        previousState: "in_progress",
        newState: "approved",
        reason: "Stage Complete",
        comments: "Ingested drone photogrammetry walk."
      }
    ];
  }

  private seedNotifications() {
    this.notifications = [
      {
        id: "notif-wf-01",
        title: "Workflow Assignment Received",
        message: "You have been assigned to stage 'AI Alignment Variance Check' on Level 3 Layout Inspection.",
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        channel: "in-app",
        recipient: "Staff Operator (You)",
        status: "delivered",
        deliveryLog: "In-app delivery confirmed."
      }
    ];
  }
}

export const WorkflowEngine = new EnterpriseWorkflowAutomationEngine();
export default WorkflowEngine;
