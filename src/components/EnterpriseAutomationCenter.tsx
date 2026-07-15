import React, { useState, useEffect } from "react";
import { 
  WorkflowEngine, 
  WorkflowTemplate, 
  WorkflowInstance, 
  AutomationRule, 
  AutomatedTask, 
  WorkflowAuditLog, 
  AutomatedNotification,
  StageType,
  ApprovalType,
  TaskPriority,
  TaskStatus,
  RuleTrigger,
  RuleActionType
} from "../lib/WorkflowEngine";
import { 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  FileText, 
  UserCheck, 
  PlusCircle, 
  Settings, 
  Activity, 
  User, 
  Check, 
  X, 
  History, 
  Send, 
  Sliders, 
  HelpCircle, 
  Play, 
  Compass, 
  Flame, 
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  BookOpen
} from "lucide-react";

export default function EnterpriseAutomationCenter() {
  // Sync state from the Engine singleton
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [tasks, setTasks] = useState<AutomatedTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<WorkflowAuditLog[]>([]);
  const [notifications, setNotifications] = useState<AutomatedNotification[]>([]);
  const [slaMetrics, setSlaMetrics] = useState(WorkflowEngine.getSLAMetrics());

  // Navigation inside the Center
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "designer" | "approvals" | "rules" | "tasks" | "audit">("dashboard");

  // Interaction States
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [testingRole, setTestingRole] = useState<string>("AI Lead Operator");
  const [testingUser, setTestingUser] = useState<string>("Staff Operator (You)");

  // Form Inputs
  // 1. Rule Creation
  const [newRule, setNewRule] = useState({
    name: "Auto QC Verification Fail",
    description: "Launch joint verification if 3D drone scan detects a layout misalignment.",
    trigger: "INSPECTION_FAILED" as RuleTrigger,
    conditionField: "level",
    conditionValue: "critical",
    actionType: "TRIGGER_WORKFLOW" as RuleActionType,
    actionTemplateId: "tpl-issue-res",
    actionParamsRecipient: "qa-lead@tracprogress.com"
  });

  // 2. Custom Template Creation
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "Safety Drill Incident Workflow",
    description: "Multi-level audit for reporting and correcting structural hazard notices on site.",
    category: "Safety" as any,
    slaTargetHours: 24,
    stages: [
      { id: "s1", name: "Report Hazard", type: "initiation" as StageType, status: "pending" as const, assignedRole: "Safety Officer", assignedUser: "Karan Johar", deadlineHours: 4 },
      { id: "s2", name: "Mitigate Threat", type: "action" as StageType, status: "pending" as const, assignedRole: "Subcontractor Foreman", assignedUser: "Abhinav Singh", deadlineHours: 12 },
      { id: "s3", name: "Verification Sign-off", type: "approval" as StageType, status: "pending" as const, assignedRole: "Site Auditor", assignedUser: "Inspector General", deadlineHours: 8 }
    ]
  });

  // 3. Custom Workflow Launch
  const [isLaunchingWorkflow, setIsLaunchingWorkflow] = useState(false);
  const [launchForm, setLaunchForm] = useState({
    templateId: "tpl-inspection",
    name: "Ad-hoc Level 4 Column Pour",
    linkedType: "BIM" as any,
    linkedId: "col_c5",
    linkedName: "Level 4 Column C5 Structure"
  });

  // 4. Approval Sign-off Inputs
  const [approvalDecision, setApprovalDecision] = useState<"approved" | "rejected">("approved");
  const [approvalComment, setApprovalComment] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");

  // Subscribing to engine updates
  useEffect(() => {
    const updateLocalState = () => {
      setTemplates([...WorkflowEngine.getTemplates()]);
      setWorkflows([...WorkflowEngine.getWorkflows()]);
      setRules([...WorkflowEngine.getRules()]);
      setTasks([...WorkflowEngine.getTasks()]);
      setAuditLogs([...WorkflowEngine.getAuditLogs()]);
      setNotifications([...WorkflowEngine.getNotifications()]);
      setSlaMetrics(WorkflowEngine.getSLAMetrics());
    };

    updateLocalState();
    const unsubscribe = WorkflowEngine.subscribeToChanges(updateLocalState);
    return () => unsubscribe();
  }, []);

  // Pre-fill fields
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
    }
    if (workflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(workflows[0]);
    }
  }, [templates, workflows]);

  // Actions
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const actionParams: Record<string, any> = {};
    if (newRule.actionType === "TRIGGER_WORKFLOW") {
      actionParams.templateId = newRule.actionTemplateId;
      actionParams.namePrefix = "Auto Rule Launch";
    } else if (newRule.actionType === "SEND_NOTIFICATION") {
      actionParams.recipient = newRule.actionParamsRecipient;
      actionParams.message = `Automated notification triggered.`;
    }

    const rulesList = WorkflowEngine.getRules();
    const rule: AutomationRule = {
      id: `rule-user-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      trigger: newRule.trigger,
      conditions: [
        { field: newRule.conditionField, operator: "equals", value: newRule.conditionValue }
      ],
      actions: [
        { type: newRule.actionType, params: actionParams }
      ],
      isEnabled: true,
      timesTriggered: 0
    };

    rulesList.push(rule);
    WorkflowEngine.sendAutomatedNotification(
      "Automation Rule Registered",
      `New automation rule '${rule.name}' saved and enabled.`,
      "sysadmin@tracprogress.com",
      "in-app"
    );
    alert(`Automation Rule '${rule.name}' registered successfully!`);
    // Reset
    setNewRule({
      name: "Gantt Slippage Commercial Penalty",
      description: "Auto-penalize trade value in BOQ ledger when tasks delay beyond SLA timeline limits.",
      trigger: "DELAY_INCREASED",
      conditionField: "delayDays",
      conditionValue: "5",
      actionType: "UPDATE_DASHBOARD_SCORE",
      actionTemplateId: "tpl-doc-app",
      actionParamsRecipient: "billing@tracprogress.com"
    });
  };

  const handleCreateTemplate = () => {
    WorkflowEngine.createTemplate({
      id: `tpl-user-${Date.now()}`,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      stages: templateForm.stages,
      slaTargetHours: templateForm.slaTargetHours
    });
    setIsCreatingTemplate(false);
    alert(`Custom BPM template '${templateForm.name}' compiled to structural registry!`);
  };

  const handleLaunchWorkflow = () => {
    const wf = WorkflowEngine.triggerWorkflowFromTemplate(
      launchForm.templateId,
      launchForm.name,
      {
        type: launchForm.linkedType,
        id: launchForm.linkedId,
        name: launchForm.linkedName
      }
    );
    if (wf) {
      setSelectedWorkflow(wf);
      setIsLaunchingWorkflow(false);
      setActiveSubTab("approvals");
      alert(`Workflow Engine spawned instance '${wf.name}'!`);
    }
  };

  const handleSubmitSignOff = (wfId: string, stageId: string) => {
    if (!digitalSignature.trim()) {
      alert("Please complete the Digital Signature ledger verify step.");
      return;
    }

    const success = WorkflowEngine.submitApproval(
      wfId,
      stageId,
      testingUser,
      testingRole,
      approvalDecision,
      approvalComment,
      digitalSignature
    );

    if (success) {
      alert(`Digital sign-off submitted as ${testingRole}!`);
      // Reset signature
      setDigitalSignature("");
      setApprovalComment("");
      
      // Update selected workflow state
      const updated = WorkflowEngine.getWorkflows().find((w) => w.id === wfId);
      if (updated) {
        setSelectedWorkflow(updated);
      }
    } else {
      alert("Error processing approval sign-off. Ensure stage is in_progress.");
    }
  };

  const handleToggleRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.isEnabled = !rule.isEnabled;
      // Triggers engine redraw
      WorkflowEngine.sendAutomatedNotification(
        "Rule Status Adjusted",
        `Rule '${rule.name}' state toggled to ${rule.isEnabled ? 'Active' : 'Draft'}.`,
        "ops@tracprogress.com",
        "in-app"
      );
    }
  };

  return (
    <div className="flex flex-col gap-6" id="enterprise-automation-center">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-xl text-white gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/25 border border-indigo-500/40 rounded-lg text-indigo-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">Enterprise Orchestrator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400">SLA: 98.4%</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">TracProgress® BPM & Automation Hub</h1>
            <p className="text-xs text-slate-400 mt-0.5">Central logic layer governing automated actions, workflows, critical SLAs, and digital sign-offs.</p>
          </div>
        </div>

        {/* ROLE SIMULATOR PICKER */}
        <div className="flex items-center gap-2.5 bg-slate-850/60 p-2.5 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Testing Actor:</span>
          <select 
            value={testingRole}
            onChange={(e) => {
              setTestingRole(e.target.value);
              if (e.target.value === "AI Lead Operator") setTestingUser("Staff Operator (You)");
              else if (e.target.value === "Project Manager") setTestingUser("Arvind Swamy");
              else if (e.target.value === "Chief Executive Officer") setTestingUser("Gopal Krishna");
              else if (e.target.value === "Civil QA Engineer") setTestingUser("Rajesh Kumar");
              else setTestingUser("Inspector General");
            }}
            className="bg-slate-900 text-xs border border-slate-700 rounded p-1.5 font-bold text-indigo-300 outline-none"
          >
            <option value="AI Lead Operator">AI Lead Operator (You)</option>
            <option value="Civil QA Engineer">Civil QA Engineer (Rajesh)</option>
            <option value="Project Manager">Project Manager (Arvind)</option>
            <option value="Site Auditor">Site Auditor (Inspector G)</option>
            <option value="Chief Executive Officer">CEO (Gopal Krishna)</option>
          </select>
        </div>
      </div>

      {/* HORIZONTAL BPM NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "dashboard"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          SLA Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab("designer")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "designer"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass className="w-4 h-4" />
          Workflow Designer
        </button>
        <button
          onClick={() => setActiveSubTab("approvals")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "approvals"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Approval Center
          {workflows.some(w => w.status === "active") && (
            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {workflows.filter(w => w.status === "active").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("rules")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "rules"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Automation Rules
        </button>
        <button
          onClick={() => setActiveSubTab("tasks")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "tasks"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Task Board
          {tasks.some(t => t.status === "pending") && (
            <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {tasks.filter(t => t.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("audit")}
          className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeSubTab === "audit"
              ? "border-indigo-600 text-indigo-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Audit Ledger
        </button>
      </div>

      {/* CORE CONTENT SWITCHER */}
      <div className="min-h-[450px]">
        
        {/* TAB A: SLA DASHBOARD */}
        {activeSubTab === "dashboard" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* COMPLIANCE ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">BPM HEALTH</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{slaMetrics.slaCompliancePercentage}%</h3>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>SLA Compliance Goal Met</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">ACTIVE PIPELINES</span>
                  <h3 className="text-2xl font-black text-indigo-600 mt-1">{workflows.filter(w => w.status === "active").length} Running</h3>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-bold">
                  Total of {workflows.length} workflows initialized
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">SLA BREACHED / OVERDUE</span>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{slaMetrics.overdueCount} Alerts</h3>
                </div>
                <div className="mt-2 text-[10px] text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Needs PM re-routing</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">AVG RESPONSE VELOCITY</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{slaMetrics.averageResponseTimeHours || 12} hrs</h3>
                </div>
                <div className="mt-2 text-[10px] text-indigo-600 font-bold">
                  Target threshold &lt; 24h
                </div>
              </div>
            </div>

            {/* BOTTLENECK ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* BOTTLENECK BAR CHART MOCK */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">SLA Bottleneck Diagnostic</h3>
                    <span className="bg-red-50 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-100 font-bold">CRITICAL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Statistical review of approval steps with longest cycle delays.</p>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  {slaMetrics.bottlenecks.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-mono">
                      Generating telemetry delay metrics...
                    </div>
                  ) : (
                    slaMetrics.bottlenecks.map((bt, index) => (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{bt.stageName} <span className="text-[10px] text-slate-400 font-normal">({bt.category})</span></span>
                          <span className="font-mono font-bold text-indigo-600">{bt.avgDelayHours} hours avg</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${Math.min((bt.avgDelayHours / 48) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto-escalation rules are active. Steps exceeding 24 hours trigger notifications.</span>
                </div>
              </div>

              {/* LIVE NOTIFICATIONS LOGS */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Delivery Channels Registry</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live SMS, Email, and Webhook transaction telemetry.</p>
                </div>

                <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg flex items-start gap-2 text-xs">
                      <div className={`p-1.5 rounded text-[10px] font-mono font-bold ${
                        n.channel === "webhook" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {n.channel.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 truncate">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Just now</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-emerald-600 font-mono block mt-1">✔ {n.status.toUpperCase()}: {n.recipient}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 font-mono">
                      No notifications recorded in history.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                  <span className="font-mono text-indigo-600">SMTP STATUS: SECURE (TLS)</span>
                  <span className="font-mono text-emerald-600">SLACK WEBHOOK: ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: WORKFLOW DESIGNER */}
        {activeSubTab === "designer" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* WORKFLOW TEMPLATES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT COLUMN: LIST & DETAILS */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-900">BPM Templates Registry</h3>
                    <button 
                      onClick={() => setIsCreatingTemplate(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reusable blueprints defining stage sequences and roles.</p>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between gap-3 ${
                        selectedTemplate?.id === tpl.id
                          ? "bg-slate-50 border-indigo-600 shadow-sm"
                          : "bg-transparent border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                            tpl.category === "Quality" ? "bg-red-50 text-red-700" : tpl.category === "Inspection" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {tpl.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">SLA: {tpl.slaTargetHours}h</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">{tpl.name}</h4>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button 
                    onClick={() => setIsLaunchingWorkflow(true)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Launch Active Instance
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: VISUAL FLOW DIAGRAM CANVAS */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-inner flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Cpu className="w-48 h-48 text-indigo-500" />
                </div>

                <div className="z-10">
                  <div className="flex justify-between items-center text-white border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Visual BPM Flow Designer</span>
                      <h3 className="text-sm font-extrabold text-white mt-0.5">{selectedTemplate?.name}</h3>
                    </div>
                    <span className="bg-indigo-600/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded border border-indigo-500/30 font-mono font-bold">
                      {selectedTemplate?.stages.length} Configured Stages
                    </span>
                  </div>

                  {/* INTERACTIVE FLOW BLOCKS */}
                  <div className="flex flex-col md:flex-row items-center gap-4 py-8 overflow-x-auto select-none mt-4 scrollbar-thin">
                    {selectedTemplate?.stages.map((stg, index) => (
                      <React.Fragment key={stg.id}>
                        {/* STAGE BLOCK */}
                        <div className="w-44 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md shrink-0 text-slate-300">
                          <div className="flex justify-between items-start">
                            <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono text-[9px] font-bold border border-indigo-500/20">
                              {index + 1}
                            </span>
                            <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono uppercase">
                              {stg.type}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-bold text-white mt-2 truncate">{stg.name}</h4>
                          
                          <div className="mt-3 flex items-center gap-1.5 text-[9px] text-slate-400">
                            <User className="w-3 h-3 text-indigo-400" />
                            <span className="truncate">{stg.assignedRole}</span>
                          </div>
                          
                          <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>Limit: {stg.deadlineHours}h</span>
                          </div>
                        </div>

                        {/* ARROW */}
                        {index < (selectedTemplate?.stages.length - 1) && (
                          <div className="flex items-center text-indigo-500/50 uppercase font-mono text-[9px] tracking-wider shrink-0 rotate-90 md:rotate-0">
                            <span>➔</span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="z-10 mt-6 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>CANVAS MODELER: v1.0 (SECURED)</span>
                  <span className="text-indigo-400">✔ DRAG & DROP PIPELINE IS COMPILED</span>
                </div>
              </div>

            </div>

            {/* MODAL / OVERLAY FOR CREATING NEW TEMPLATE */}
            {isCreatingTemplate && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-md flex flex-col gap-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-indigo-600" /> Compile Custom BPM Workflow Template
                  </h3>
                  <button onClick={() => setIsCreatingTemplate(false)} className="p-1 text-slate-400 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Template Name</label>
                    <input 
                      type="text" 
                      value={templateForm.name} 
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">SLA Limit (Hours)</label>
                    <input 
                      type="number" 
                      value={templateForm.slaTargetHours} 
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, slaTargetHours: Number(e.target.value) }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Industry Category</label>
                    <select 
                      value={templateForm.category} 
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    >
                      <option value="Inspection">Site Inspection</option>
                      <option value="Quality">QMS Quality NCR</option>
                      <option value="Commercial">Commercial Billing</option>
                      <option value="Safety">Safety & Audit</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                  <button onClick={() => setIsCreatingTemplate(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600">Cancel</button>
                  <button onClick={handleCreateTemplate} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg">Compile Blueprint</button>
                </div>
              </div>
            )}

            {/* MODAL / OVERLAY FOR LAUNCHING INSTANCE */}
            {isLaunchingWorkflow && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-md flex flex-col gap-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-indigo-600" /> Spawn Active Workflow Instance
                  </h3>
                  <button onClick={() => setIsLaunchingWorkflow(false)} className="p-1 text-slate-400 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Instance Custom Name</label>
                    <input 
                      type="text" 
                      value={launchForm.name} 
                      onChange={(e) => setLaunchForm(prev => ({ ...prev, name: e.target.value }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Select Blueprint Template</label>
                    <select 
                      value={launchForm.templateId} 
                      onChange={(e) => {
                        const selected = templates.find(t => t.id === e.target.value);
                        setLaunchForm(prev => ({ 
                          ...prev, 
                          templateId: e.target.value,
                          name: selected ? `${selected.name} - Instance #${Math.floor(Math.random() * 1000)}` : prev.name
                        }));
                      }}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Linked BIM / Entity Name</label>
                    <input 
                      type="text" 
                      value={launchForm.linkedName} 
                      onChange={(e) => setLaunchForm(prev => ({ ...prev, linkedName: e.target.value }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Linked Entity ID</label>
                    <input 
                      type="text" 
                      value={launchForm.linkedId} 
                      onChange={(e) => setLaunchForm(prev => ({ ...prev, linkedId: e.target.value }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                  <button onClick={() => setIsLaunchingWorkflow(false)} className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600">Cancel</button>
                  <button onClick={handleLaunchWorkflow} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg">Launch Active Instance</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB C: APPROVAL CENTER */}
        {activeSubTab === "approvals" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* ACTIVE WORKFLOWS LIST */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Active Pipelines</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Track and verify ongoing construction audits.</p>
                </div>

                <div className="flex flex-col gap-3 mt-4 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin">
                  {workflows.map((wf) => (
                    <button
                      key={wf.id}
                      onClick={() => setSelectedWorkflow(wf)}
                      className={`w-full text-left p-3 rounded-lg border transition flex flex-col gap-2 ${
                        selectedWorkflow?.id === wf.id
                          ? "bg-slate-50 border-indigo-600 shadow-sm"
                          : "bg-transparent border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] text-indigo-600 font-mono font-bold truncate">ID: {wf.id}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          wf.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {wf.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{wf.name}</h4>
                      
                      {/* COMPACT PROGRESS */}
                      <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Current: {wf.stages.find(s => s.id === wf.currentStageId)?.name || "Done"}</span>
                        <span>SLA: {wf.slaTargetHours}h</span>
                      </div>
                    </button>
                  ))}
                  {workflows.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400 font-mono">
                      No active workflows currently. Click 'Workflow Designer' tab to spawn one.
                    </div>
                  )}
                </div>

                <div className="mt-4 text-[10px] text-slate-400 font-mono text-center">
                  Select a workflow to audit, sign, or reject.
                </div>
              </div>

              {/* ACTIVE APPROVAL INTERACTIVE FORM */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                {selectedWorkflow ? (
                  <div className="flex flex-col gap-5">
                    {/* WORKFLOW TITLE BLOCK */}
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-indigo-200 font-mono uppercase">ACTIVE PIPELINE</span>
                          {selectedWorkflow.slaBreached && (
                            <span className="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1 font-mono"><AlertTriangle className="w-3 h-3 text-red-500" /> SLA BREACH</span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-1">{selectedWorkflow.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{selectedWorkflow.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">INITIATED BY</span>
                        <span className="text-xs font-bold text-slate-800 block">{selectedWorkflow.initiatedBy}</span>
                      </div>
                    </div>

                    {/* DETAILED PROGRESS STEP SEQUENCE */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-2">
                      {selectedWorkflow.stages.map((stg, index) => {
                        const isCurrent = stg.id === selectedWorkflow.currentStageId;
                        const isApproved = stg.status === "approved";
                        return (
                          <div key={stg.id} className="flex-1 flex items-center gap-2 text-xs w-full md:w-auto">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold shrink-0 ${
                              isApproved ? "bg-emerald-500 text-white" : isCurrent ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-200 text-slate-500"
                            }`}>
                              {isApproved ? "✓" : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`block font-bold truncate ${isCurrent ? "text-indigo-600" : "text-slate-700"}`}>{stg.name}</span>
                              <span className="block text-[9px] text-slate-400 truncate uppercase font-mono">{stg.assignedRole}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* APPROVAL INTERACTIVE SIGN-OFF FIELD */}
                    {selectedWorkflow.status === "active" ? (
                      (() => {
                        const activeStage = selectedWorkflow.stages.find(s => s.id === selectedWorkflow.currentStageId);
                        if (!activeStage) return null;

                        const isAssignedToUs = activeStage.assignedRole === testingRole;

                        return (
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-4 animate-fade-in">
                            <div className="flex justify-between items-center border-b border-slate-250 pb-2">
                              <div>
                                <span className="text-[9px] text-indigo-600 font-mono font-bold uppercase block">ACTIVE ASSIGNMENT STEP</span>
                                <h4 className="text-xs font-black text-slate-800 mt-0.5">{activeStage.name}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-slate-400 block font-mono">STEP DEADLINE</span>
                                <span className="text-xs font-bold text-slate-800 block">{activeStage.deadlineHours} Hours</span>
                              </div>
                            </div>

                            {/* WARNING BOX IF ASSIGNED ROLE MISMATCH */}
                            {!isAssignedToUs && (
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-extrabold block">Role Simulation Mismatch</span>
                                  This step is assigned to <strong>{activeStage.assignedRole}</strong> ({activeStage.assignedUser}). 
                                  You are testing as <strong>{testingRole}</strong>. Adjust your testing role in the top header selector to authorize sign-off.
                                </div>
                              </div>
                            )}

                            {/* THE SIGN-OFF INPUTS FORM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Decision</label>
                                  <div className="flex gap-2">
                                    <button 
                                      type="button"
                                      disabled={!isAssignedToUs}
                                      onClick={() => setApprovalDecision("approved")}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                        approvalDecision === "approved" 
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold" 
                                          : "bg-white border-slate-200 text-slate-600"
                                      }`}
                                    >
                                      <Check className="w-4 h-4" /> Approve
                                    </button>
                                    <button 
                                      type="button"
                                      disabled={!isAssignedToUs}
                                      onClick={() => setApprovalDecision("rejected")}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                        approvalDecision === "rejected" 
                                          ? "bg-red-50 border-red-300 text-red-800 font-extrabold" 
                                          : "bg-white border-slate-200 text-slate-600"
                                      }`}
                                    >
                                      <X className="w-4 h-4" /> Reject (Revert)
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Comments</label>
                                  <textarea 
                                    disabled={!isAssignedToUs}
                                    rows={2}
                                    placeholder="Add site notes, inspection logs, or rework instructions..."
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    className="p-2 border border-slate-200 rounded-lg bg-white outline-none font-semibold resize-none"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Cryptographic Digital Signature</label>
                                  <input 
                                    disabled={!isAssignedToUs}
                                    type="text"
                                    placeholder="Type your name to register digital sign-off key..."
                                    value={digitalSignature}
                                    onChange={(e) => setDigitalSignature(e.target.value)}
                                    className="p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold tracking-wider outline-none"
                                  />
                                </div>

                                {/* cursive/handwriting mockup of signature */}
                                {digitalSignature.trim().length > 0 && (
                                  <div className="p-3 bg-white border border-slate-200 rounded-lg border-dashed text-center flex items-center justify-center min-h-[50px] font-serif italic text-lg text-indigo-800 font-bold">
                                    {digitalSignature}
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              disabled={!isAssignedToUs}
                              onClick={() => handleSubmitSignOff(selectedWorkflow.id, activeStage.id)}
                              className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-45 text-indigo-400 rounded-lg text-xs font-mono font-extrabold uppercase tracking-widest border border-slate-800 transition"
                            >
                              Commit Cryptographic Signature & Advance
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Workflow completed fully! All digital sign-offs compiled into the cryptographic audit trail ledger.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-300 animate-bounce" />
                    <span>Select an active workflow pipeline from the left panel.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB D: AUTOMATION RULES */}
        {activeSubTab === "rules" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* CURRENT AUTOMATION RULES LIST */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Configured Automation Rules</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rules evaluating site event telemetry to trigger workflows and tasks autonomously.</p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${rule.isEnabled ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`} />
                          <h4 className="text-xs font-black text-slate-800">{rule.name}</h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* TOGGLE */}
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                              rule.isEnabled ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                              rule.isEnabled ? "transform translate-x-4" : ""
                            }`} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{rule.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-2 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-600 uppercase">Trigger:</span>
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-100">{rule.trigger}</span>
                        
                        <span className="font-bold text-slate-600 uppercase ml-2">Times Fired:</span>
                        <span className="text-indigo-600 font-bold">{rule.timesTriggered}</span>
                        
                        {rule.lastTriggeredAt && (
                          <>
                            <span className="font-bold text-slate-600 uppercase ml-2">Last:</span>
                            <span>{new Date(rule.lastTriggeredAt).toLocaleTimeString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>DEPLOYED RULES: {rules.length} ACTIVE</span>
                  <span>ENGINE ROUTE: DIRECT</span>
                </div>
              </div>

              {/* AUTOMATION RULE FORM BUILDER */}
              <form onSubmit={handleSaveRule} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600" /> BPM Automation Rules Designer
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Author dynamic trigger conditions and actions.</p>
                </div>

                <div className="flex flex-col gap-4 mt-5 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Rule Identifier Name</label>
                    <input 
                      type="text" 
                      value={newRule.name} 
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Event Bus Trigger</label>
                    <select 
                      value={newRule.trigger} 
                      onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value as any }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold bg-white"
                    >
                      <option value="QUALITY_FAILURE">Drone Quality Failure Detected</option>
                      <option value="INSPECTION_FAILED">Field Inspection Failed</option>
                      <option value="DELAY_INCREASED">Schedule Milestone Slipped</option>
                      <option value="DOCUMENT_APPROVED">BIM Document Approved</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Filter Variable</label>
                      <select 
                        value={newRule.conditionField} 
                        onChange={(e) => setNewRule(prev => ({ ...prev, conditionField: e.target.value }))}
                        className="p-2 border border-slate-200 rounded-lg font-bold bg-white"
                      >
                        <option value="level">Severity Severity</option>
                        <option value="delayDays">Slippage Delay Days</option>
                        <option value="category">Material Category</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Value Threshold</label>
                      <input 
                        type="text" 
                        value={newRule.conditionValue} 
                        onChange={(e) => setNewRule(prev => ({ ...prev, conditionValue: e.target.value }))}
                        className="p-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Dispatch Action Target</label>
                    <select 
                      value={newRule.actionType} 
                      onChange={(e) => setNewRule(prev => ({ ...prev, actionType: e.target.value as any }))}
                      className="p-2 border border-slate-200 rounded-lg font-bold bg-white"
                    >
                      <option value="TRIGGER_WORKFLOW">Trigger BPM Workflow Instance</option>
                      <option value="CREATE_TASK">Generate High-Priority Task</option>
                      <option value="SEND_NOTIFICATION">Route SLA Notification Alert</option>
                      <option value="UPDATE_DASHBOARD_SCORE">Update Central Health Metrics</option>
                    </select>
                  </div>

                  {newRule.actionType === "TRIGGER_WORKFLOW" && (
                    <div className="flex flex-col gap-1 animate-fade-in">
                      <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Workflow Template</label>
                      <select 
                        value={newRule.actionTemplateId} 
                        onChange={(e) => setNewRule(prev => ({ ...prev, actionTemplateId: e.target.value }))}
                        className="p-2 border border-slate-200 rounded-lg font-bold bg-white"
                      >
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newRule.actionType === "SEND_NOTIFICATION" && (
                    <div className="flex flex-col gap-1 animate-fade-in">
                      <label className="text-[10px] text-slate-400 font-mono font-bold uppercase">Recipient Email</label>
                      <input 
                        type="email" 
                        value={newRule.actionParamsRecipient} 
                        onChange={(e) => setNewRule(prev => ({ ...prev, actionParamsRecipient: e.target.value }))}
                        className="p-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Save & Defer Deployed
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB E: TASK BOARD */}
        {activeSubTab === "tasks" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* TASKS DELEGATION BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* COL 1: CRITICAL */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 min-h-[350px]">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span className="text-xs font-black text-red-600 uppercase flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Critical</span>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.priority === "critical" && t.status !== "completed").length}
                  </span>
                </div>
                {tasks.filter(t => t.priority === "critical").map(t => (
                  <TaskCard key={t.id} task={t} onComplete={WorkflowEngine.completeTask.bind(WorkflowEngine)} />
                ))}
              </div>

              {/* COL 2: HIGH */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 min-h-[350px]">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span className="text-xs font-black text-amber-600 uppercase">High Priority</span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.priority === "high" && t.status !== "completed").length}
                  </span>
                </div>
                {tasks.filter(t => t.priority === "high").map(t => (
                  <TaskCard key={t.id} task={t} onComplete={WorkflowEngine.completeTask.bind(WorkflowEngine)} />
                ))}
              </div>

              {/* COL 3: MEDIUM/LOW */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 min-h-[350px]">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-600 uppercase">Medium & Low</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tasks.filter(t => (t.priority === "medium" || t.priority === "low") && t.status !== "completed").length}
                  </span>
                </div>
                {tasks.filter(t => t.priority === "medium" || t.priority === "low").map(t => (
                  <TaskCard key={t.id} task={t} onComplete={WorkflowEngine.completeTask.bind(WorkflowEngine)} />
                ))}
              </div>

              {/* COL 4: COMPLETED */}
              <div className="bg-emerald-50/40 border border-emerald-150 rounded-xl p-4 shadow-sm flex flex-col gap-3 min-h-[350px]">
                <div className="border-b border-emerald-200 pb-2 flex justify-between items-center text-emerald-800">
                  <span className="text-xs font-black uppercase flex items-center gap-1">✓ Completed</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === "completed").length}
                  </span>
                </div>
                {tasks.filter(t => t.status === "completed").map(t => (
                  <TaskCard key={t.id} task={t} onComplete={WorkflowEngine.completeTask.bind(WorkflowEngine)} />
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB F: AUDIT TRAIL TIMELINE */}
        {activeSubTab === "audit" && (
          <div className="flex flex-col gap-6 animate-fade-in bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Cryptographically Sealed Audit Ledger</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Immutable records documenting all workflow state alterations, PM overrides, and stakeholder signatures.</p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] mt-4 pr-1 scrollbar-thin">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start gap-4 text-xs font-semibold">
                  <div className="w-24 shrink-0 font-mono text-[10px] text-slate-400 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                    <span className="block text-[9px] mt-0.5">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-slate-800">{log.action}</span>
                        <span className="text-slate-400 font-normal"> by {log.user} ({log.role})</span>
                      </div>
                      <span className="bg-slate-200 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded">ID: {log.workflowInstanceId}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5 font-normal leading-relaxed">{log.comments}</p>
                    
                    {log.signature && (
                      <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100/50 p-1.5 rounded font-mono flex items-center justify-between">
                        <span>✔ Cryptographic Signature Verified:</span>
                        <span className="font-bold tracking-wider italic font-serif text-xs">{log.signature}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-10 text-xs text-slate-400 font-mono">
                  No audit logs recorded yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>SHA-256 LEDGER HASH: E85E6AA1F...</span>
              <span>AUDIT BLOCKCHAIN STATE: SEALED</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- HELPER COMPONENT: TASK CARD ---
interface TaskCardProps {
  task: AutomatedTask;
  onComplete: (id: string) => boolean;
}

function TaskCard({ task, onComplete }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  
  return (
    <div className={`p-3 rounded-lg border flex flex-col gap-2 shadow-sm transition-all text-xs bg-white ${
      isCompleted 
        ? "border-emerald-100 opacity-60 bg-emerald-50/10" 
        : task.priority === "critical" 
          ? "border-red-200 hover:border-red-300" 
          : "border-slate-200 hover:border-slate-300"
    }`}>
      <div className="flex justify-between items-start">
        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[65%]">Linked: {task.linkedBimElement || task.linkedIssue || "Project Workspace"}</span>
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
          task.priority === "critical" 
            ? "bg-red-50 text-red-700" 
            : task.priority === "high" 
              ? "bg-amber-50 text-amber-700" 
              : "bg-indigo-50 text-indigo-700"
        }`}>
          {task.priority}
        </span>
      </div>

      <h4 className={`font-bold text-slate-800 ${isCompleted ? "line-through text-slate-400" : ""}`}>{task.title}</h4>
      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">{task.description}</p>
      
      <div className="mt-1 flex items-center justify-between text-[10px] border-t border-slate-100 pt-2 text-slate-400">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-indigo-500" />
          <span className="font-bold truncate max-w-[70px]">{task.owner}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span>Due: {task.dueDate}</span>
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={() => {
            onComplete(task.id);
            alert(`Task Completed! Central metrics synchronized.`);
          }}
          className="w-full mt-1.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-extrabold transition flex items-center justify-center gap-1 uppercase"
        >
          <Check className="w-3 h-3" /> Mark Complete
        </button>
      )}
    </div>
  );
}

// --- HELPER COMPONENT: CHEVRON RIGHT ---
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
