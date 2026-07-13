import React, { useState, useEffect, useMemo } from "react";
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
  Layers,
  Search,
  Send,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Activity,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Archive,
  UserCheck,
  Calendar,
  Sparkle
} from "lucide-react";
import { useAppStore } from "./store";

// Notification Type Definitions
interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: "mention" | "ai_alert" | "warning" | "system";
  priority: "Critical" | "Medium" | "Low";
  createdAt: string;
  read: boolean;
  author?: string;
  role?: string;
  elementId?: string;
  confidence?: number;
  deviation?: string;
  category?: "Structure" | "MEP" | "Arch" | "Safety";
}

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

// Initial Seed In-App Notifications
const INITIAL_INAPP_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "ntf-1",
    title: "Mentioned on Level 2 Column C4 Alignment",
    body: "@Siddu Chitiki, structural formwork is ready for re-inspection post-alignment. Please review and approve concrete pour.",
    type: "mention",
    priority: "Critical",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    read: false,
    author: "Amit Sharma",
    role: "BIM Manager",
    elementId: "col_c4",
    category: "Structure"
  },
  {
    id: "ntf-2",
    title: "Critical MEP Clash Detected - Zone B",
    body: "Physical HVAC duct position conflicts with proposed main drainage path. Intersection volume exceeds standard design tolerances.",
    type: "ai_alert",
    priority: "Critical",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
    read: false,
    confidence: 98.7,
    deviation: "Intersection Volume: 1450 cm³",
    elementId: "pipe_p12",
    category: "MEP"
  },
  {
    id: "ntf-3",
    title: "Schedule Delay Prediction Alarm",
    body: "Gemini AI predicts 4-day structural completion delay due to slow rebar spacing remediation on Slab S2.",
    type: "ai_alert",
    priority: "Medium",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    read: true,
    confidence: 92.1,
    deviation: "Average Spacing 255mm vs Spec 200mm",
    elementId: "slab_s2",
    category: "Structure"
  },
  {
    id: "ntf-4",
    title: "Perimeter Safety Hazard Spotted",
    body: "LiDAR crane drone detected missing perimeter protection safety rails on Level 3 East Boundary.",
    type: "warning",
    priority: "Critical",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    read: false,
    category: "Safety"
  },
  {
    id: "ntf-5",
    title: "RERA Audit Sync Succeeded",
    body: "Database backup and RERA trace verification ledger synchronized successfully with Bangalore division endpoints.",
    type: "system",
    priority: "Low",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    read: true,
  }
];

// Alert stream candidates for auto generation
const SIMULATED_STREAM_ALERT_SAMPLES = [
  {
    title: "Mentioned on Concrete Strength Check",
    body: "@Siddu Chitiki, ultrasound scans on Level 2 concrete slabs confirm 92% strength maturity. Requesting structural clearance.",
    type: "mention",
    priority: "Medium",
    author: "Rajesh Kumar",
    role: "QC Engineer",
    elementId: "slab_s2",
    category: "Structure"
  },
  {
    title: "CV Reinforcement Deviation Warning",
    body: "Smart helmet stream spotted steel stirrups count lower than drawings specifications on Level 2 Beam B9.",
    type: "ai_alert",
    priority: "Critical",
    confidence: 94.2,
    deviation: "6 stirrups installed vs 8 design spec",
    elementId: "col_c4",
    category: "Structure"
  },
  {
    title: "Mechanical Duct Alignment Variance",
    body: "Automated scan shows fire protection sprinkler line overlapping primary electrical cable tray on Floor 1 Corridor.",
    type: "ai_alert",
    priority: "Medium",
    confidence: 89.5,
    deviation: "Clash volume: 320 cm³",
    elementId: "pipe_p12",
    category: "MEP"
  },
  {
    title: "Safety Guard Missing - Zone A Lift Shaft",
    body: "Operator reported lift shaft gateway lock is unsecured on Level 3. Violation under safety standard IS-3786.",
    type: "warning",
    priority: "Critical",
    category: "Safety"
  },
  {
    title: "BIM Coordination Hub Synced",
    body: "A revised .IFC file for HVAC and Fire systems has been pushed by MEP Consultant and successfully integrated.",
    type: "system",
    priority: "Low",
  }
];

export default function NotificationCenter() {
  const { setActiveTab, selectElementById, selectAnomalyById } = useAppStore();

  // Dual View Mode: User Notification Inbox vs Admin Telemetry Logs
  const [viewScope, setViewScope] = useState<"inbox" | "admin">("inbox");

  // INBOX SCOPE STATES
  const [inboxNotifications, setInboxNotifications] = useState<InAppNotification[]>(INITIAL_INAPP_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<"all" | "unread" | "mention" | "ai_alert" | "warning">("all");
  const [inboxSearch, setInboxSearch] = useState("");
  const [selectedInboxId, setSelectedInboxId] = useState<string | null>(INITIAL_INAPP_NOTIFICATIONS[0].id);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAutoStreaming, setIsAutoStreaming] = useState(true);

  // ADMIN SCOPE STATES
  const [adminTab, setAdminTab] = useState<"dispatch" | "templates" | "queue" | "logs">("dispatch");

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

  // Dispatch variables
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

  // Template Form Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempSubject, setTempSubject] = useState("");
  const [tempBody, setTempBody] = useState("");
  const [tempChannels, setTempChannels] = useState<string[]>(["EMAIL"]);

  // Search logs
  const [logSearch, setLogSearch] = useState("");
  const [logChannelFilter, setLogChannelFilter] = useState("ALL");
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");

  // Sweeper
  const [sweeping, setSweeping] = useState(false);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);

  // Synchronize recipient route based on channel select
  useEffect(() => {
    if (selectedChannels.includes("SMS")) {
      setRecipientInput("+91 94480 12345");
    } else if (selectedChannels.includes("PUSH")) {
      setRecipientInput("device-push-token-bt-992");
    } else {
      setRecipientInput("sidduchitiki@gmail.com");
    }
  }, [selectedChannels]);

  // Audio dual chime alert via Web Audio API
  const playNotificationChime = () => {
    if (isAudioMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(440.00, ctx.currentTime); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.55);
      osc2.stop(ctx.currentTime + 0.55);
    } catch (err) {
      console.log("Audio play blocked or unsupported:", err);
    }
  };

  // Real-time automatic simulation of incoming alerts
  useEffect(() => {
    if (!isAutoStreaming) return;

    const interval = setInterval(() => {
      // Pick a random simulated candidate
      const randomIndex = Math.floor(Math.random() * SIMULATED_STREAM_ALERT_SAMPLES.length);
      const chosenSample = SIMULATED_STREAM_ALERT_SAMPLES[randomIndex];

      const newId = `ntf-${Date.now()}`;
      const newNotification: InAppNotification = {
        id: newId,
        ...chosenSample,
        createdAt: new Date().toISOString(),
        read: false
      } as InAppNotification;

      setInboxNotifications(prev => [newNotification, ...prev]);
      playNotificationChime();
    }, 18000); // every 18 seconds

    return () => clearInterval(interval);
  }, [isAutoStreaming, isAudioMuted]);

  // Instantly trigger a simulated inbound event
  const handleSimulateInboundEvent = () => {
    const randomIndex = Math.floor(Math.random() * SIMULATED_STREAM_ALERT_SAMPLES.length);
    const chosenSample = SIMULATED_STREAM_ALERT_SAMPLES[randomIndex];

    const newId = `ntf-${Date.now()}`;
    const newNotification: InAppNotification = {
      id: newId,
      ...chosenSample,
      createdAt: new Date().toISOString(),
      read: false
    } as InAppNotification;

    setInboxNotifications(prev => [newNotification, ...prev]);
    setSelectedInboxId(newId);
    playNotificationChime();
  };

  // Inbox list selectors and filtering
  const filteredInbox = useMemo(() => {
    return inboxNotifications.filter(ntf => {
      const matchesSearch = ntf.title.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                            ntf.body.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                            (ntf.elementId && ntf.elementId.toLowerCase().includes(inboxSearch.toLowerCase())) ||
                            (ntf.author && ntf.author.toLowerCase().includes(inboxSearch.toLowerCase()));

      const matchesType = filterType === "all" ||
                          (filterType === "unread" && !ntf.read) ||
                          (filterType === "mention" && ntf.type === "mention") ||
                          (filterType === "ai_alert" && ntf.type === "ai_alert") ||
                          (filterType === "warning" && ntf.type === "warning");

      return matchesSearch && matchesType;
    });
  }, [inboxNotifications, filterType, inboxSearch]);

  const selectedInboxNotification = useMemo(() => {
    return inboxNotifications.find(n => n.id === selectedInboxId) || null;
  }, [inboxNotifications, selectedInboxId]);

  // Helper counters
  const unreadCount = useMemo(() => {
    return inboxNotifications.filter(n => !n.read).length;
  }, [inboxNotifications]);

  const aiAlertsCount = useMemo(() => {
    return inboxNotifications.filter(n => n.type === "ai_alert").length;
  }, [inboxNotifications]);

  const mentionsCount = useMemo(() => {
    return inboxNotifications.filter(n => n.type === "mention").length;
  }, [inboxNotifications]);

  // Mark all inbox notifications as read
  const handleMarkAllRead = () => {
    setInboxNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const handleClearInbox = () => {
    if (window.confirm("Clear all notifications from your active in-app session?")) {
      setInboxNotifications([]);
      setSelectedInboxId(null);
    }
  };

  // Mark single as read/unread
  const handleToggleSingleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInboxNotifications(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    }));
  };

  // Remove single notification
  const handleRemoveSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInboxNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedInboxId === id) {
      setSelectedInboxId(null);
    }
  };

  // Interpolate helper
  const interpolate = (text: string, vars: Record<string, string>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  };

  const getRequiredVariables = () => {
    const activeTpl = templates.find(t => t.name === selectedTemplateName);
    if (!activeTpl) return [];
    const combined = activeTpl.subject + " " + activeTpl.body;
    const matches = combined.match(/\{\{(\w+)\}\}/g) || [];
    return Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, ""))));
  };

  // Dispatch Trigger Function
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

      // Add as live log
      setLogs(prev => [...newLogs, ...prev]);

      // If IN_APP channel is dispatched, also feed it directly into the in-app inbox
      if (selectedChannels.includes("IN_APP")) {
        const inAppId = `ntf-${Date.now()}`;
        const newInApp: InAppNotification = {
          id: inAppId,
          title: finalSubject,
          body: finalBody,
          type: "system",
          priority: "Medium",
          createdAt: new Date().toISOString(),
          read: false
        };
        setInboxNotifications(prev => [newInApp, ...prev]);
        setSelectedInboxId(inAppId);
        playNotificationChime();
      }

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

  // Queue sweep simulation
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
      addLogLine("Sweeper run completed. All logs updated inside database indexes.", failedRecords.length * 1000 + 2000);
      setTimeout(() => setSweeping(false), failedRecords.length * 1000 + 2500);
    }, failedRecords.length * 1000 + 2100);
  };

  // Filter logs list
  const filteredLogs = logs.filter(log => {
    const matchSearch = log.recipient.toLowerCase().includes(logSearch.toLowerCase()) ||
                        (log.subject && log.subject.toLowerCase().includes(logSearch.toLowerCase())) ||
                        log.body.toLowerCase().includes(logSearch.toLowerCase());
    const matchChannel = logChannelFilter === "ALL" || log.channel === logChannelFilter;
    const matchStatus = logStatusFilter === "ALL" || log.status === logStatusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  // Cross-tab interaction navigators
  const navigateToBimElement = (elemId: string) => {
    selectElementById(elemId);
    setActiveTab("bim-models");
  };

  const navigateToQualityIssues = (elemId: string) => {
    setActiveTab("issues");
  };

  // Custom diagram SVG renderer based on trade category
  const renderMiniDiagram = (type?: string) => {
    return (
      <div className="w-full h-32 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-hidden flex items-center justify-center relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" id="svg-mini-schematic">
          <rect width="100%" height="100%" fill="#0a0f1d" />
          <defs>
            <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#131d35" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mini-grid)" />
          {type === "MEP" ? (
            <>
              <line x1="10" y1="50" x2="90" y2="50" stroke="#4f46e5" strokeWidth="4" />
              <rect x="40" y="30" width="20" height="40" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" strokeWidth="1" />
              <text x="43" y="24" fill="#f43f5e" fontSize="6" fontWeight="bold">CLASH</text>
            </>
          ) : (
            <>
              <rect x="35" y="35" width="30" height="30" rx="2" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
              <rect x="39" y="31" width="30" height="30" rx="2" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="36" y="24" fill="#f43f5e" fontSize="6" fontWeight="bold">SHIFTED</text>
            </>
          )}
        </svg>
        <span className="absolute bottom-1 right-2 text-[8px] text-slate-500 font-mono">BIM-COORD v1.0</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full overflow-hidden text-slate-800" id="notification-center-root">

      {/* MODULE HEADER */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
              <Bell className="w-5 h-5 text-indigo-400 animate-pulse" />
            </span>
            <h2 className="text-xl font-black tracking-tight uppercase">AI Notification & Alerts Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-channel notification engine containing computer-vision alerts, mentions, and gateway logs.
          </p>
        </div>

        {/* Global toggles and view scopes */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
            <button
              onClick={() => setViewScope("inbox")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewScope === "inbox"
                  ? "bg-indigo-600 text-white shadow-sm font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>In-App Inbox ({unreadCount})</span>
            </button>
            <button
              onClick={() => setViewScope("admin")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewScope === "admin"
                  ? "bg-indigo-600 text-white shadow-sm font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Admin Gateway Panel</span>
            </button>
          </div>

          <div className="bg-slate-800 h-8 w-[1px] hidden md:block" />

          <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="text-slate-400 hover:text-white p-1"
              title={isAudioMuted ? "Unmute alert dual chimes" : "Mute alert dual chimes"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* VIEW SCOPE A: USER NOTIFICATION INBOX */}
      {viewScope === "inbox" && (
        <div className="flex flex-col animate-fade-in">
          
          {/* STATS HUD ROW */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Unread Alerts</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-slate-900 font-mono">{unreadCount}</span>
                {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">AI CV Anomalies</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-indigo-600 font-mono">{aiAlertsCount}</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Personal Mentions</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-rose-600 font-mono">{mentionsCount}</span>
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Simulation Control</span>
              <div className="flex items-center justify-between mt-1.5">
                <button
                  onClick={() => setIsAutoStreaming(!isAutoStreaming)}
                  className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                    isAutoStreaming 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                  title="Auto-streams new alert events in background"
                >
                  {isAutoStreaming ? "Auto On (18s)" : "Auto Off"}
                </button>
                <button
                  onClick={handleSimulateInboundEvent}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-2.5 py-0.5 rounded uppercase"
                >
                  Force Inbound
                </button>
              </div>
            </div>
          </div>

          {/* INTERACTIVE CONTROLS BAR */}
          <div className="p-4 px-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white">
            {/* Inbox Filter Types */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0 border border-slate-200">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Feed
              </button>
              <button
                onClick={() => setFilterType("unread")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "unread" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">{unreadCount}</span>
                )}
              </button>
              <button
                onClick={() => setFilterType("mention")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "mention" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Mentions</span>
                {mentionsCount > 0 && (
                  <span className="bg-rose-500 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">{mentionsCount}</span>
                )}
              </button>
              <button
                onClick={() => setFilterType("ai_alert")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "ai_alert" ? "bg-white text-indigo-600 shadow-sm font-black" : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                <span>AI Alerts</span>
                {aiAlertsCount > 0 && (
                  <span className="bg-indigo-600 text-white rounded-full text-[9px] px-1.5 py-0.2 font-mono">{aiAlertsCount}</span>
                )}
              </button>
              <button
                onClick={() => setFilterType("warning")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterType === "warning" ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Warnings
              </button>
            </div>

            {/* Actions & Search */}
            <div className="flex items-center gap-3">
              <div className="relative bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center w-full md:w-56 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search alert content..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs w-full placeholder-slate-400 font-medium"
                />
                {inboxSearch && (
                  <button onClick={() => setInboxSearch("")} className="text-slate-400 hover:text-slate-600 font-bold text-[10px]">✕</button>
                )}
              </div>

              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
                title="Mark all notifications as read"
              >
                Mark All Read
              </button>
              <button
                onClick={handleClearInbox}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition shrink-0 cursor-pointer"
                title="Clear Session Inbox"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN TWO-COLUMN SPLIT SCREEN AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            
            {/* LEFT WORKSPACE PANEL: Notification Alerts Stream (5 Cols) */}
            <div className="lg:col-span-5 border-r border-slate-200 flex flex-col max-h-[580px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {filteredInbox.length > 0 ? (
                filteredInbox.map(ntf => {
                  const isSelected = selectedInboxId === ntf.id;
                  return (
                    <div
                      key={ntf.id}
                      onClick={() => {
                        setSelectedInboxId(ntf.id);
                        // Mark as read automatically when clicked
                        if (!ntf.read) {
                          setInboxNotifications(prev => prev.map(n => n.id === ntf.id ? { ...n, read: true } : n));
                        }
                      }}
                      className={`p-4 transition-all duration-150 cursor-pointer select-none relative flex flex-col gap-2 ${
                        isSelected 
                          ? "bg-indigo-50/40 border-l-4 border-indigo-600" 
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      } ${!ntf.read ? "bg-slate-50/20" : ""}`}
                    >
                      {/* Alert Type Icon & Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ntf.type === "mention" && (
                            <span className="p-1 bg-rose-50 border border-rose-100 rounded text-rose-600">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {ntf.type === "ai_alert" && (
                            <span className="p-1 bg-indigo-50 border border-indigo-100 rounded text-indigo-600">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            </span>
                          )}
                          {ntf.type === "warning" && (
                            <span className="p-1 bg-amber-50 border border-amber-100 rounded text-amber-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {ntf.type === "system" && (
                            <span className="p-1 bg-slate-100 border border-slate-200 rounded text-slate-500">
                              <Settings className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{ntf.type.replace("_", " ")}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium font-mono">{new Date(ntf.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <button
                            onClick={(e) => handleRemoveSingle(ntf.id, e)}
                            className="p-1 hover:bg-slate-100 text-slate-300 hover:text-red-500 rounded transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Header block with unread indicator */}
                      <div>
                        <h4 className={`text-xs tracking-tight text-slate-900 leading-snug flex items-center gap-2 ${!ntf.read ? "font-extrabold" : "font-semibold"}`}>
                          {!ntf.read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />}
                          <span className="truncate">{ntf.title}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">{ntf.body}</p>
                      </div>

                      {/* Bottom badge row */}
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-100/40 text-[9.5px]">
                        <span className="text-slate-400 truncate max-w-[150px]">
                          {ntf.author ? `By: ${ntf.author}` : "System Gateway"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {ntf.priority === "Critical" && (
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-700 font-bold uppercase rounded text-[8px]">Critical</span>
                          )}
                          {ntf.elementId && (
                            <span className="bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded font-bold uppercase text-[8px]">{ntf.elementId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-slate-400 bg-slate-50/20 h-full flex flex-col justify-center items-center p-4">
                  <Bell className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No active notification events found.</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Adjust filters or trigger a simulated event above.</p>
                </div>
              )}
            </div>

            {/* RIGHT WORKSPACE PANEL: Expanded Detailed View (7 Cols) */}
            <div className="lg:col-span-7 p-6 bg-slate-50/25 flex flex-col max-h-[580px] overflow-y-auto scrollbar-thin">
              {selectedInboxNotification ? (
                <article className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Headline Header */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex justify-between items-start">
                    <div className="space-y-1.5 max-w-[80%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          selectedInboxNotification.priority === "Critical"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {selectedInboxNotification.priority} PRIORITY
                        </span>
                        
                        {selectedInboxNotification.category && (
                          <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-600 font-mono font-black px-1.5 py-0.5 rounded uppercase">
                            Trade: {selectedInboxNotification.category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                        {selectedInboxNotification.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Registered Event: {new Date(selectedInboxNotification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleSingleRead(selectedInboxNotification.id)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded border border-slate-200 bg-white transition cursor-pointer"
                      title={selectedInboxNotification.read ? "Mark as unread" : "Mark as read"}
                    >
                      {selectedInboxNotification.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Body Text Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Detailed Incident Message</span>
                      <p className="text-xs text-slate-700 leading-relaxed mt-2 p-3 bg-slate-50 border border-slate-150 rounded-lg">
                        {selectedInboxNotification.body}
                      </p>
                    </div>

                    {/* AI Deviation metrics if applicable */}
                    {selectedInboxNotification.type === "ai_alert" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-indigo-50/40 border border-indigo-150 p-3.5 rounded-lg">
                          <span className="text-[9px] text-indigo-600 font-extrabold block uppercase tracking-wider font-mono">CV Verification Confidence</span>
                          <span className="text-xl font-black text-indigo-700 block mt-1 font-mono">{selectedInboxNotification.confidence || 94.5}%</span>
                          <p className="text-[10px] text-indigo-500 mt-1 leading-normal">Satisfies Bangalore high-density structural layout algorithms.</p>
                        </div>
                        
                        <div className="bg-rose-50/40 border border-rose-150 p-3.5 rounded-lg">
                          <span className="text-[9px] text-rose-600 font-extrabold block uppercase tracking-wider font-mono">Registered Deviation Delta</span>
                          <span className="text-xs font-black text-rose-700 block mt-1">{selectedInboxNotification.deviation || "Axis alignment discrepancy"}</span>
                          <p className="text-[10px] text-rose-500 mt-1 leading-normal">Requires immediate supervisor intervention prior to concrete casting.</p>
                        </div>
                      </div>
                    )}

                    {/* Mention Metadata */}
                    {selectedInboxNotification.type === "mention" && (
                      <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 flex items-center gap-3">
                        <span className="p-2 bg-rose-100 rounded-full text-rose-600 font-black text-xs font-mono">
                          {selectedInboxNotification.author?.charAt(0)}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Mention Comment by: {selectedInboxNotification.author}</span>
                          <span className="text-[10px] text-slate-400 block">{selectedInboxNotification.role || "Lead Site Coordinator"} • Whitefield Block B</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Schematic Graphic Component if BIM Element bound */}
                  {selectedInboxNotification.elementId && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Spatial Schematic Diagram</span>
                        <span className="text-[10px] text-indigo-600 font-semibold font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          BIM Element: {selectedInboxNotification.elementId}
                        </span>
                      </div>

                      {renderMiniDiagram(selectedInboxNotification.category)}
                    </div>
                  )}

                  {/* Interactive Action Control Board */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col gap-4">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider block font-mono">Remedial Action Panel</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">Determine workflow route for this alert coordinate</h4>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {selectedInboxNotification.elementId && (
                        <button
                          onClick={() => navigateToBimElement(selectedInboxNotification.elementId!)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Open in 3D BIM Viewer</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {selectedInboxNotification.type === "ai_alert" && (
                        <button
                          onClick={() => navigateToQualityIssues(selectedInboxNotification.elementId!)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>View in Quality Issues</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          alert("Workflow status updated inside SQL database indexes.");
                          setInboxNotifications(prev => prev.map(n => n.id === selectedInboxNotification.id ? { ...n, read: true } : n));
                        }}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-lg transition cursor-pointer"
                      >
                        Acknowledge Alert
                      </button>
                    </div>
                  </div>

                </article>
              ) : (
                <div className="py-24 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col justify-center items-center h-full">
                  <Archive className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No notification expanded.</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Select an active alert in the sidebar stream to examine telemetry, metadata, and BIM spatial parameters.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW SCOPE B: ADMIN & DEVELOPER SYSTEM GATEWAY */}
      {viewScope === "admin" && (
        <div className="flex flex-col animate-fade-in">
          
          {/* TABS SELECTOR */}
          <div className="flex bg-slate-50 border-b border-slate-200 px-6 gap-2 shrink-0">
            <button
              onClick={() => setAdminTab("dispatch")}
              className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                adminTab === "dispatch" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Send className="w-4 h-4" />
              Dispatch Console
            </button>
            <button
              onClick={() => setAdminTab("templates")}
              className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                adminTab === "templates" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4" />
              Template Manager
            </button>
            <button
              onClick={() => setAdminTab("queue")}
              className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                adminTab === "queue" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${sweeping ? "animate-spin" : ""}`} />
              Queue & Retries
            </button>
            <button
              onClick={() => setAdminTab("logs")}
              className={`py-4 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                adminTab === "logs" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Database className="w-4 h-4" />
              Telemetry Logs
            </button>
          </div>

          <div className="p-6 bg-white min-h-[450px]">
            
            {/* ADMIN TAB 1: DISPATCH CONSOLE */}
            {adminTab === "dispatch" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <form onSubmit={handleTriggerDispatch} className="lg:col-span-7 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-1.5 border-b border-slate-100 flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-500" />
                    Trigger Event Broadcast
                  </h3>

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

                  {dispatchSuccess === "SUCCESS_TRIGGER" && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Success: Notifications triggered and logs updated. Dispatched to IN_APP / email.</span>
                    </div>
                  )}

                  {dispatchSuccess === "FAILED_TRIGGER" && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800 text-xs flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-bold">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Failed Dispatch Event</span>
                      </div>
                      <p className="text-[11px] text-red-700 leading-normal font-medium">
                        The SMS / PUSH Gateway simulated connection timed out. Logs were flagged as FAILED and enqueued.
                      </p>
                    </div>
                  )}

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

            {/* ADMIN TAB 2: TEMPLATE MANAGER */}
            {adminTab === "templates" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Notification Templates Registry</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Define JSON models and variable interpolation slots for alerts.</p>
                  </div>

                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Template
                  </button>
                </div>

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
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Channels</span>
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

                {showTemplateModal && (
                  <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                      onSubmit={handleCreateTemplate}
                      className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
                    >
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                          <Plus className="w-5 h-5 text-indigo-500" />
                          Add Notification Template
                        </h3>
                        <button type="button" onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-950">✕</button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Template ID</label>
                        <input
                          type="text"
                          placeholder="SAFETY_ALERT"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Subject Line</label>
                        <input
                          type="text"
                          placeholder="Warning: Spacing discrepancy on {{elementId}}"
                          value={tempSubject}
                          onChange={(e) => setTempSubject(e.target.value)}
                          className="p-2 border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Body Message</label>
                        <textarea
                          rows={4}
                          value={tempBody}
                          onChange={(e) => setTempBody(e.target.value)}
                          className="p-2 border border-slate-200 rounded-lg text-xs resize-none"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-slate-150 rounded-lg text-xs">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs">Save</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN TAB 3: QUEUE & SWEEP RETRIES */}
            {adminTab === "queue" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Background Retry Sweeper</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Initiate a local thread scheduler sweep to look up failed delivery channels and retry transactions.
                  </p>

                  <div className="flex flex-col gap-2.5 font-mono text-[10px] text-slate-600 bg-white border border-slate-200 p-4 rounded-xl">
                    <div className="flex justify-between"><span>Worker Name:</span><span className="font-bold text-slate-800">retry-gateway-sweep</span></div>
                    <div className="flex justify-between"><span>Active Queue:</span><span className="font-bold text-indigo-600">MemoryBufferQueue</span></div>
                    <div className="flex justify-between"><span>Max Attempt limit:</span><span className="font-bold text-red-500">3 Limit</span></div>
                  </div>

                  <button
                    onClick={handleRunRetrySweeper}
                    disabled={sweeping}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    {sweeping ? "Sweeping active queue..." : "Force Execute Retry Sweeper"}
                  </button>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Sweeper Live Output Traces</span>
                  
                  <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl shadow-lg font-mono text-[11px] leading-relaxed flex-1 border border-slate-800 min-h-[300px] flex flex-col justify-between">
                    <div className="flex flex-col gap-1.5 h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                      {sweepLogs.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center text-slate-600 gap-1">
                          <RefreshCw className="w-8 h-8 animate-spin text-slate-800 mb-1" />
                          <span>Telemetry logs waiting...</span>
                          <span className="text-[10px]">Execute a manual sweep above to observe pipeline events.</span>
                        </div>
                      ) : (
                        sweepLogs.map((logLine, idx) => {
                          let color = "text-slate-300";
                          if (logLine.includes("SUCCESS")) color = "text-emerald-400 font-bold";
                          if (logLine.includes("WARNING")) color = "text-yellow-400 font-bold";
                          if (logLine.includes("Scanning")) color = "text-blue-400";
                          return <div key={idx} className={`${color} leading-normal`}>{logLine}</div>;
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN TAB 4: TELEMETRY LOGS */}
            {adminTab === "logs" && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap md:flex-nowrap gap-3 items-center justify-between border-b border-slate-100 pb-4">
                  <div className="relative w-full md:max-w-xs text-xs">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search log records..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full p-2 pl-8 border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={logChannelFilter}
                      onChange={(e) => setLogChannelFilter(e.target.value)}
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      <option value="ALL">All Channels</option>
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="PUSH">Push</option>
                      <option value="IN_APP">In-App</option>
                    </select>

                    <select
                      value={logStatusFilter}
                      onChange={(e) => setLogStatusFilter(e.target.value)}
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SENT">Sent</option>
                      <option value="FAILED">Failed</option>
                      <option value="FAILED_MAX_RETRIES">Max Failed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3">Template Name</th>
                        <th className="p-3">Body Snapshot</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Retries</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-slate-400">No telemetry log entries found.</td>
                        </tr>
                      ) : (
                        filteredLogs.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/55">
                            <td className="p-3 font-semibold text-slate-800">{item.recipient}</td>
                            <td className="p-3">
                              <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                {item.channel}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px]">{item.templateName || "PLAIN_TEXT"}</td>
                            <td className="p-3 max-w-xs truncate text-slate-600" title={item.body}>{item.body}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                item.status === "SENT"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                                  : "bg-red-50 text-red-700 border border-red-150"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-center text-slate-700">{item.retryCount}</td>
                            <td className="p-3 text-slate-400 font-mono text-[10px]">{new Date(item.createdAt).toLocaleTimeString()}</td>
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
      )}

    </div>
  );
}
