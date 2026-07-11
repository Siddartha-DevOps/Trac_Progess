import React, { useState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  Bell,
  Settings,
  Database,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Layers,
  Search,
  Send,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Activity,
  ArrowRight
} from "lucide-react";

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channels: string[];
}

interface NotificationLog {
  id: string;
  projectId?: string;
  userId?: string;
  recipient: string;
  channel: string;
  templateName?: string;
  subject?: string;
  body: string;
  status: "PENDING" | "SENT" | "FAILED" | "FAILED_MAX_RETRIES";
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<"dispatch" | "templates" | "queue" | "logs">("dispatch");

  // State arrays populated with rich seed data matching the server schemas
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "tpl-1",
      name: "PROGRESS_ALERT",
      subject: "Progress Alert: {{projectName}} - {{trade}} Status Update",
      body: "Dear Team, physical progress update has been registered for project \"{{projectName}}\". Current complete trade volume for {{trade}} stands at {{completionPercent}}% with {{remainingWork}} units remaining.",
      channels: ["EMAIL", "IN_APP"]
    },
    {
      id: "tpl-2",
      name: "DELAY_WARNING",
      subject: "CRITICAL DELAY ALERT: {{projectName}} Risk Score {{riskScore}}/100",
      body: "URGENT: Project \"{{projectName}}\" is pacing below baseline schedule targets. Actual Completion is {{actualProgress}}% vs Planned {{plannedProgress}}% (Delta: {{variance}}%). Active delay mitigation recommended.",
      channels: ["EMAIL", "SMS", "PUSH", "IN_APP"]
    },
    {
      id: "tpl-3",
      name: "REPORT_READY",
      subject: "Report Ready: BuildTrace Audit Document Generated",
      body: "The requested \"{{reportType}}\" audit report (\"{{reportName}}\") for project \"{{projectName}}\" has been successfully compiled and is ready for download. Format: {{format}}.",
      channels: ["EMAIL", "IN_APP"]
    }
  ]);

  const [logs, setLogs] = useState<NotificationLog[]>([
    {
      id: "log-1",
      projectId: "proj-123",
      userId: "user-1",
      recipient: "sidduchitiki@gmail.com",
      channel: "EMAIL",
      templateName: "REPORT_READY",
      subject: "Report Ready: BuildTrace Audit Document Generated",
      body: "The requested \"EXECUTIVE\" audit report (\"Q3 Executive Summary\") for project \"Bangalore Tech Park\" has been successfully compiled and is ready for download. Format: PDF.",
      status: "SENT",
      retryCount: 0,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "log-2",
      projectId: "proj-123",
      userId: "user-2",
      recipient: "+91 98765 43210",
      channel: "SMS",
      templateName: "DELAY_WARNING",
      subject: "CRITICAL DELAY ALERT: Bangalore Tech Park",
      body: "URGENT: Project \"Bangalore Tech Park\" is pacing below baseline schedule targets. Actual Completion is 58% vs Planned 72% (Delta: -14.0%). Active delay mitigation recommended.",
      status: "SENT",
      retryCount: 0,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: "log-3",
      projectId: "proj-123",
      recipient: "site-fcm-token-invalid-fail",
      channel: "PUSH",
      templateName: "DELAY_WARNING",
      subject: "CRITICAL DELAY ALERT: Bangalore Tech Park",
      body: "URGENT: Project \"Bangalore Tech Park\" is pacing below baseline schedule targets.",
      status: "FAILED",
      retryCount: 1,
      errorMessage: "Simulated Gateway Timeout for channel PUSH on recipient: site-fcm-token-invalid-fail",
      createdAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: "log-4",
      projectId: "proj-123",
      userId: "user-1",
      recipient: "sidduchitiki@gmail.com",
      channel: "IN_APP",
      templateName: "PROGRESS_ALERT",
      subject: "Progress Alert: Bangalore Tech Park - Concrete Columns Update",
      body: "Dear Team, physical progress update has been registered for project \"Bangalore Tech Park\". Current complete trade volume for Concrete Columns stands at 75% with 250 units remaining.",
      status: "SENT",
      retryCount: 0,
      createdAt: new Date(Date.now() - 14400000).toISOString()
    }
  ]);

  // Dispatch states
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("PROGRESS_ALERT");
  const [recipientInput, setRecipientInput] = useState("sidduchitiki@gmail.com");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["EMAIL"]);
  const [manualSubject, setManualSubject] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({
    projectName: "Bangalore Tech Park",
    trade: "Concrete Columns",
    completionPercent: "75",
    remainingWork: "250",
    riskScore: "78",
    actualProgress: "58",
    plannedProgress: "72",
    variance: "-14",
    reportType: "EXECUTIVE",
    reportName: "Q3 Executive Summary",
    format: "PDF"
  });

  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Template Form state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempSubject, setTempSubject] = useState("");
  const [tempBody, setTempBody] = useState("");
  const [tempChannels, setTempChannels] = useState<string[]>(["EMAIL"]);

  // Search states
  const [logSearch, setLogSearch] = useState("");
  const [logChannelFilter, setLogChannelFilter] = useState("ALL");
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");

  // Queue simulation states
  const [sweeping, setSweeping] = useState(false);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);

  // Sync recipient coordinate based on channel choice
  useEffect(() => {
    if (selectedChannels.includes("SMS")) {
      setRecipientInput("+91 94480 12345");
    } else if (selectedChannels.includes("PUSH")) {
      setRecipientInput("device-push-token-bt-992");
    } else {
      setRecipientInput("sidduchitiki@gmail.com");
    }
  }, [selectedChannels]);

  // Interpolate function matching server-side replacement engine
  const interpolate = (text: string, vars: Record<string, string>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  };

  // Get active template variables
  const getRequiredVariables = () => {
    const activeTpl = templates.find(t => t.name === selectedTemplateName);
    if (!activeTpl) return [];
    const combined = activeTpl.subject + " " + activeTpl.body;
    const matches = combined.match(/\{\{(\w+)\}\}/g) || [];
    return Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, ""))));
  };

  // Dispatch Notification Handler
  const handleTriggerDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);
    setDispatchSuccess(null);

    setTimeout(() => {
      const activeTpl = templates.find(t => t.name === selectedTemplateName);
      const isFailedRecipient = recipientInput.toLowerCase().includes("fail");

      const finalSubject = activeTpl 
        ? interpolate(activeTpl.subject, variables) 
        : (manualSubject || "BuildTrace Notification Update");

      const finalBody = activeTpl 
        ? interpolate(activeTpl.body, variables) 
        : (manualBody || "Manual Alert Notification Payload");

      const newLogs: NotificationLog[] = selectedChannels.map(channel => ({
        id: `log-${Date.now()}-${channel}`,
        projectId: "proj-123",
        userId: "user-1",
        recipient: recipientInput,
        channel,
        templateName: activeTpl ? activeTpl.name : undefined,
        subject: finalSubject,
        body: finalBody,
        status: isFailedRecipient ? "FAILED" : "SENT",
        retryCount: 0,
        errorMessage: isFailedRecipient 
          ? `Simulated Gateway Timeout for channel ${channel} on recipient: ${recipientInput}` 
          : undefined,
        createdAt: new Date().toISOString()
      }));

      setLogs(prev => [...newLogs, ...prev]);
      setDispatching(false);

      if (isFailedRecipient) {
        setDispatchSuccess("FAILED_TRIGGER");
      } else {
        setDispatchSuccess("SUCCESS_TRIGGER");
        setTimeout(() => setDispatchSuccess(null), 5000);
      }
    }, 1200);
  };

  // Add Custom Template
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName || !tempSubject || !tempBody) return;

    const newTpl: NotificationTemplate = {
      id: `tpl-${Date.now()}`,
      name: tempName.toUpperCase().replace(/\s+/g, "_"),
      subject: tempSubject,
      body: tempBody,
      channels: tempChannels
    };

    setTemplates([...templates, newTpl]);
    setTempName("");
    setTempSubject("");
    setTempBody("");
    setShowTemplateModal(false);
  };

  // Delete Template
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  // Simulated queue and retry sweep action
  const handleRunRetrySweeper = () => {
    setSweeping(true);
    setSweepLogs([]);

    const addLogLine = (line: string, delay: number) => {
      setTimeout(() => {
        setSweepLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
      }, delay);
    };

    addLogLine("Starting background queue retry worker sweep...", 100);
    addLogLine("Scanning NotificationLog table for status='FAILED' and retryCount < 3...", 500);

    const failedRecords = logs.filter(l => l.status === "FAILED");

    if (failedRecords.length === 0) {
      addLogLine("Success: No failed log files found. Process is clean. Exiting.", 1200);
      setTimeout(() => setSweeping(false), 1500);
      return;
    }

    addLogLine(`Found ${failedRecords.length} failed logs. Enqueueing dispatcher jobs...`, 1000);

    failedRecords.forEach((rec, index) => {
      const stepDelay = 1500 + index * 1000;
      addLogLine(`Retrying Log ID: ${rec.id} via channel ${rec.channel} to recipient: ${rec.recipient}...`, stepDelay);

      setTimeout(() => {
        // Simple mock of 50% recovery rate
        const recovered = !rec.recipient.toLowerCase().includes("fail-permanent");
        
        setLogs(prev => prev.map(l => {
          if (l.id === rec.id) {
            return {
              ...l,
              status: recovered ? "SENT" : (l.retryCount >= 2 ? "FAILED_MAX_RETRIES" : "FAILED"),
              retryCount: l.retryCount + 1,
              errorMessage: recovered ? undefined : `Permanent gateway error limit reached. Retried: ${l.retryCount + 1} times.`
            };
          }
          return l;
        }));

        if (recovered) {
          setSweepLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS: Log ID ${rec.id} delivered on retry attempt #${rec.retryCount + 1}`]);
        } else {
          setSweepLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] WARNING: Retry attempt #${rec.retryCount + 1} for Log ID ${rec.id} failed again.`]);
        }
      }, stepDelay + 500);
    });

    setTimeout(() => {
      addLogLine("Sweeper sweeping run completed. All logs updated inside database indexes.", failedRecords.length * 1000 + 2000);
      setTimeout(() => setSweeping(false), failedRecords.length * 1000 + 2500);
    }, failedRecords.length * 1000 + 2100);
  };

  // Filters for Log Telemetry
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.recipient.toLowerCase().includes(logSearch.toLowerCase()) || 
                        (log.subject && log.subject.toLowerCase().includes(logSearch.toLowerCase())) ||
                        log.body.toLowerCase().includes(logSearch.toLowerCase());
    const matchChannel = logChannelFilter === "ALL" || log.channel === logChannelFilter;
    const matchStatus = logStatusFilter === "ALL" || log.status === logStatusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full overflow-hidden text-slate-800">
      
      {/* MODULE HEADER */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
              <Bell className="w-5 h-5 text-indigo-400 animate-bounce" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">AI Notification & Telemetry Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure multi-channel templates and trigger instant Email, SMS, Push alerts mapped over site progress triggers
          </p>
        </div>

        {/* Quick HUD Metrics */}
        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Processed Logs</span>
            <span className="font-bold text-white text-sm">{logs.length}</span>
          </div>
          <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <span className="text-[10px] text-red-400 block uppercase font-bold">Unresolved Fails</span>
            <span className="font-bold text-red-400 text-sm">{logs.filter(l => l.status === "FAILED").length}</span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex bg-slate-50 border-b border-slate-200 px-6 gap-2">
        <button
          onClick={() => setActiveTab("dispatch")}
          className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "dispatch"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4" />
          Dispatch Console
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "templates"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Settings className="w-4 h-4" />
          Template Manager
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "queue"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${sweeping ? "animate-spin" : ""}`} />
          Queue & Retries
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Database className="w-4 h-4" />
          Telemetry Logs
        </button>
      </div>

      {/* WORKSPACE AREA */}
      <div className="p-6 bg-white min-h-[450px]">
        
        {/* TAB 1: DISPATCH CONSOLE */}
        {activeTab === "dispatch" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column (7 cols) */}
            <form onSubmit={handleTriggerDispatch} className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-500" />
                Trigger Event Broadcast
              </h3>

              {/* Select template */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Notification Template</label>
                  <select
                    value={selectedTemplateName}
                    onChange={(e) => setSelectedTemplateName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                    <option value="CUSTOM">-- Manual / Plain Notification --</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Recipient Destination</label>
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Enter email or phone"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-medium"
                    required
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                    💡 Tip: Include the word <strong className="text-red-500">"fail"</strong> in the coordinate to test retries!
                  </span>
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-2">Delivery Channels</label>
                <div className="flex flex-wrap gap-2">
                  {["EMAIL", "SMS", "PUSH", "IN_APP"].map(channel => {
                    const isSelected = selectedChannels.includes(channel);
                    return (
                      <button
                        type="button"
                        key={channel}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedChannels(selectedChannels.filter(c => c !== channel));
                          } else {
                            setSelectedChannels([...selectedChannels, channel]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {channel === "EMAIL" && <Mail className="w-3.5 h-3.5" />}
                        {channel === "SMS" && <MessageSquare className="w-3.5 h-3.5" />}
                        {channel === "PUSH" && <Bell className="w-3.5 h-3.5" />}
                        {channel === "IN_APP" && <Activity className="w-3.5 h-3.5" />}
                        {channel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variables Panel (Dynamic) */}
              {selectedTemplateName !== "CUSTOM" && (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-indigo-600 font-bold block uppercase mb-2">Template Variables Merger</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getRequiredVariables().map(v => (
                      <div key={v} className="flex flex-col gap-0.5">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">{v}</label>
                        <input
                          type="text"
                          value={variables[v] || ""}
                          onChange={(e) => setVariables({ ...variables, [v]: e.target.value })}
                          className="text-xs p-1.5 border border-slate-200 bg-white rounded font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual content if Custom chosen */}
              {selectedTemplateName === "CUSTOM" && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Subject Title</label>
                    <input
                      type="text"
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      placeholder="Enter email/push subject"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Message Body</label>
                    <textarea
                      rows={3}
                      value={manualBody}
                      onChange={(e) => setManualBody(e.target.value)}
                      placeholder="Type the manual message..."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg resize-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Outcomes indicators */}
              {dispatchSuccess === "SUCCESS_TRIGGER" && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Success: Notifications triggered and dispatched successfully. Live SMTP and local database logs updated.</span>
                </div>
              )}

              {dispatchSuccess === "FAILED_TRIGGER" && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800 text-xs flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-bold">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Failed Dispatch Event</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-normal font-medium">
                    The SMS / SMTP Gateway simulated a connection reset on recipient coordinates. The task was logged as FAILED and placed inside the retry sweep queue.
                  </p>
                </div>
              )}

              {/* Actions button */}
              <button
                type="submit"
                disabled={dispatching || selectedChannels.length === 0}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {dispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Broadcasting over Gateways...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Trigger Multi-Channel Broadcast
                  </>
                )}
              </button>
            </form>

            {/* Live Preview Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-1.5 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Live Feed Visualizer
              </h3>

              <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl shadow-lg flex-1 font-mono text-[11px] leading-relaxed flex flex-col justify-between border border-slate-800 min-h-[350px]">
                <div>
                  <div className="flex justify-between items-center text-slate-500 border-b border-slate-900 pb-2.5 mb-3.5">
                    <span>MOCK-GATEWAY-DEVICES v1.0.2</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 font-bold">SIMULATOR ACTIVE</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-slate-500">[TARGET]:</span>{" "}
                      <span className="text-slate-200">{recipientInput}</span>
                    </div>

                    <div>
                      <span className="text-slate-500">[CHANNELS]:</span>{" "}
                      <span className="text-yellow-400 font-bold">{selectedChannels.join(" + ")}</span>
                    </div>

                    <div className="border-t border-dashed border-slate-900 pt-2.5 mt-1.5">
                      <span className="text-slate-500">[SUBJECT]:</span>
                      <p className="text-indigo-400 font-semibold mt-0.5">
                        {selectedTemplateName !== "CUSTOM"
                          ? interpolate(templates.find(t => t.name === selectedTemplateName)?.subject || "", variables)
                          : manualSubject || "BuildTrace Title"}
                      </p>
                    </div>

                    <div className="mt-1.5">
                      <span className="text-slate-500">[INTERPOLATED BODY]:</span>
                      <p className="text-slate-300 mt-1 bg-slate-900/50 p-2.5 rounded border border-slate-900 leading-normal">
                        {selectedTemplateName !== "CUSTOM"
                          ? interpolate(templates.find(t => t.name === selectedTemplateName)?.body || "", variables)
                          : manualBody || "No plain-text parameters input yet."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-2.5 mt-4 flex justify-between">
                  <span>SYSTEM LATENCY: 24ms</span>
                  <span>QUEUE STATUS: INACTIVE</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TEMPLATE MANAGER */}
        {activeTab === "templates" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Structured Notification Templates</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create custom patterns and variable blocks for automatic triggers</p>
              </div>

              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Template
              </button>
            </div>

            {/* Template List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map(tpl => (
                <div key={tpl.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 transition flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-[10px] bg-slate-200/75 border border-slate-300 font-bold px-2 py-0.5 rounded text-slate-700">
                        {tpl.name}
                      </span>
                      <button
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 mt-3">{tpl.subject}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1.5 line-clamp-3">
                      {tpl.body}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/50 pt-3.5 flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Supported Channels</span>
                    <div className="flex gap-1">
                      {tpl.channels.map(ch => (
                        <span key={ch} className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded-full">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Template Modal */}
            {showTemplateModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateTemplate}
                  className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Plus className="w-5 h-5 text-indigo-500" />
                      Add Notification Template
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(false)}
                      className="text-slate-400 hover:text-slate-950 font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Template Identifier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. SAFETY_ANOMALY_ALERT"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Subject Line Title</label>
                    <input
                      type="text"
                      placeholder="Warning: Spacing discrepancy observed in {{elementId}}"
                      value={tempSubject}
                      onChange={(e) => setTempSubject(e.target.value)}
                      className="p-2 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Message Body (Placeholders syntax)</label>
                    <textarea
                      rows={4}
                      placeholder="Dear Team, the drone captured spacing of {{observedValue}}mm stands at..."
                      value={tempBody}
                      onChange={(e) => setTempBody(e.target.value)}
                      className="p-2 border border-slate-200 rounded-lg text-xs resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1.5">Broadcast Target Channels</label>
                    <div className="flex gap-2">
                      {["EMAIL", "SMS", "PUSH", "IN_APP"].map(ch => {
                        const hasCh = tempChannels.includes(ch);
                        return (
                          <button
                            type="button"
                            key={ch}
                            onClick={() => {
                              if (hasCh) {
                                setTempChannels(tempChannels.filter(item => item !== ch));
                              } else {
                                setTempChannels([...tempChannels, ch]);
                              }
                            }}
                            className={`px-3 py-1 bg-slate-100 border text-[10px] font-bold rounded-lg transition ${
                              hasCh 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold" 
                                : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={tempChannels.length === 0}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Register Template
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: QUEUES & RETRIES */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Control & stats (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1.5">Background Task Queue Manager</h3>
                <p className="text-xs text-slate-400 leading-normal mb-4">
                  Manually trigger the background retry sweeper to scan, process, and automatically recover failed notifications.
                </p>

                <div className="flex flex-col gap-3 font-mono text-[10px] text-slate-600 bg-white border border-slate-200 p-4 rounded-xl mb-4">
                  <div className="flex justify-between">
                    <span>Task Name:</span>
                    <span className="font-bold text-slate-800">notification-retry-worker</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trigger Mode:</span>
                    <span className="font-bold text-slate-800">CRON or Manual REST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Queues:</span>
                    <span className="font-bold text-indigo-600">InMemoryLogQueue</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled Baseline:</span>
                    <span className="font-bold text-slate-800">Every 15 Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum Retry Cap:</span>
                    <span className="font-bold text-red-500">3 Attempts</span>
                  </div>
                </div>

                <button
                  onClick={handleRunRetrySweeper}
                  disabled={sweeping}
                  className="w-full p-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className={`w-4 h-4 ${sweeping ? "animate-spin" : ""}`} />
                  {sweeping ? "Processing Sweeping Engine..." : "Force Execute Retry Sweeper"}
                </button>
              </div>

              {/* Retry status card */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold uppercase tracking-wider text-[10px]">
                  <AlertTriangle className="w-4 h-4 text-indigo-500" />
                  <span>How Retries Work:</span>
                </div>
                <p className="text-indigo-700 leading-relaxed font-medium">
                  When a SMS gateway, FCM server, or SMTP network drops a connection, the event is immediately flagged as <strong>FAILED</strong>. The scheduler picks up the failures, verifies the retry threshold, and performs ad-hoc gateway handshakes.
                </p>
              </div>
            </div>

            {/* Log Stream Terminal (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Live Retry Engine Logger Stream</span>
              
              <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl shadow-lg font-mono text-[11px] leading-relaxed flex-1 border border-slate-800 min-h-[320px] flex flex-col justify-between">
                <div className="flex flex-col gap-1.5 h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {sweepLogs.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center text-slate-600 gap-1">
                      <RefreshCw className="w-8 h-8 animate-spin text-slate-800 mb-1" />
                      <span>Telemetry console is listening...</span>
                      <span className="text-[10px]">Trigger a force sweeper execution to view real-time log traces.</span>
                    </div>
                  ) : (
                    sweepLogs.map((logLine, idx) => {
                      let color = "text-slate-300";
                      if (logLine.includes("SUCCESS")) color = "text-emerald-400 font-bold";
                      if (logLine.includes("WARNING")) color = "text-yellow-400 font-bold";
                      if (logLine.includes("Scanning")) color = "text-blue-400";
                      return (
                        <div key={idx} className={`${color} leading-normal`}>
                          {logLine}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-slate-900 pt-2.5 mt-2 flex justify-between text-slate-600 text-[10px]">
                  <span>RETRIES COMPLETE: {sweepLogs.filter(l => l.includes("attempt")).length}</span>
                  <span>SYSTEM FEED: ON</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: TELEMETRY LOGS */}
        {activeTab === "logs" && (
          <div className="flex flex-col gap-5">
            {/* Filter Bar */}
            <div className="flex flex-wrap md:flex-nowrap gap-3 items-center justify-between border-b border-slate-100 pb-4">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by recipient or content..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full text-xs p-2 pl-8.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                {/* Channel Filter */}
                <select
                  value={logChannelFilter}
                  onChange={(e) => setLogChannelFilter(e.target.value)}
                  className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="ALL">All Channels</option>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                  <option value="IN_APP">In-App</option>
                </select>

                {/* Status Filter */}
                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="FAILED_MAX_RETRIES">Max Failed</option>
                </select>
              </div>
            </div>

            {/* Logs Table Layout */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3">Recipient / Coordinate</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Template Name</th>
                    <th className="p-3">Body Snapshot</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Retries</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">
                        <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No matching telemetry audit records found in database query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">{item.recipient}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {item.channel}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">
                          {item.templateName || "PLAIN_TEXT"}
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-600" title={item.body}>
                          {item.body}
                        </td>
                        <td className="p-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === "SENT" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : (item.status === "FAILED" ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" : "bg-red-50 text-red-700 border border-red-200")
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono font-bold text-center">
                          {item.retryCount}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
