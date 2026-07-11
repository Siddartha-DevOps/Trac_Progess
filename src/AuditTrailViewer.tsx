import React, { useState, useEffect } from "react";
import { 
  History, 
  RefreshCw, 
  UserCheck, 
  Cpu, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowLeftRight, 
  Code2, 
  Search, 
  Database, 
  Calendar, 
  Download, 
  User, 
  Play, 
  ArrowUpRight, 
  Layers, 
  Terminal,
  Activity
} from "lucide-react";

interface AuditLog {
  id: string;
  action: "INSERT" | "UPDATE" | "DELETE" | "RESTORE";
  tableName: string;
  recordId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  description?: string;
}

interface AiActivity {
  id: string;
  jobType: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "RETRYING";
  priority: number;
  videoId?: string;
  projectId: string;
  payload?: any;
  result?: any;
  retryCount: number;
  maxRetries: number;
  gpuRequired: boolean;
  gpuDeviceType?: string;
  progressPercent: number;
  errorMessage?: string;
  processingLogs: string[];
  createdAt: string;
  completedAt?: string;
}

interface ReportActivity {
  id: string;
  projectId: string;
  name: string;
  type: string;
  format: string;
  status: string;
  filePath?: string;
  summary?: string;
  reportData: any;
  createdAt: string;
}

export default function AuditTrailViewer() {
  const [activeSubTab, setActiveSubTab] = useState<"logs" | "users" | "projects" | "ai" | "reports" | "playground">("logs");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [aiActivities, setAiActivities] = useState<AiActivity[]>([]);
  const [reportActivities, setReportActivities] = useState<ReportActivity[]>([]);
  
  // Filtering & History States
  const [filterTable, setFilterTable] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchRecordId, setSearchRecordId] = useState("");
  const [historyTable, setHistoryTable] = useState("Project");
  const [historyRecordId, setHistoryRecordId] = useState("proj-blr-02");
  const [historyResults, setHistoryResults] = useState<AuditLog[]>([]);
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  // Playground/Swagger States
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("GET_LOGS");
  const [playgroundResponse, setPlaygroundResponse] = useState<string>("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [apiLogsQuery, setApiLogsQuery] = useState('{"limit": 20, "offset": 0}');

  // UI States
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch core unified audit logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/audit/logs");
      const data = await res.json();
      if (data.items) {
        setLogs(data.items);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specialized activities
  const fetchSpecialized = async () => {
    try {
      // Fetch User Activity
      const uRes = await fetch("/api/v1/audit/users");
      const uData = await uRes.json();
      if (uData.items) setUserActivities(uData.items);

      // Fetch AI pipeline executions
      const aiRes = await fetch("/api/v1/audit/ai");
      const aiData = await aiRes.json();
      if (aiData.items) setAiActivities(aiData.items);

      // Fetch Report actions
      const rRes = await fetch("/api/v1/audit/reports");
      const rData = await rRes.json();
      if (rData.items) setReportActivities(rData.items);

    } catch (err) {
      console.error("Failed to load specialized audit streams", err);
    }
  };

  // Fetch specific record history
  const fetchRecordHistory = async () => {
    if (!historyTable || !historyRecordId) return;
    try {
      const res = await fetch(`/api/v1/audit/history/${historyTable}/${historyRecordId}`);
      const data = await res.json();
      setHistoryResults(data);
    } catch (err) {
      console.error("Failed to fetch record history", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchSpecialized();
  }, [activeSubTab]);

  useEffect(() => {
    fetchRecordHistory();
  }, [historyTable, historyRecordId]);

  // Handle Restore Reversible Operation
  const handleRestore = async (id: string) => {
    setRestoringId(id);
    showToast("success", "Reverting database state...");
    try {
      const res = await fetch(`/api/v1/audit/restore/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "usr-001",
          "x-user-role": "Admin"
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Restored: Reverted ${data.restoredTable} [ID: ${data.restoredRecordId}] successfully!`);
        // Refresh logs immediately
        await fetchLogs();
        await fetchSpecialized();
      } else {
        showToast("error", data.error || "Restoration failed.");
      }
    } catch (err) {
      showToast("error", "Restoration failed due to connection error.");
    } finally {
      setRestoringId(null);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Execute API playground requests
  const runPlaygroundRequest = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse("");
    try {
      let url = "/api/v1/audit/logs";
      let method = "GET";
      let body: any = null;

      switch (selectedEndpoint) {
        case "GET_LOGS":
          url = "/api/v1/audit/logs";
          break;
        case "GET_USERS":
          url = "/api/v1/audit/users";
          break;
        case "GET_AI":
          url = "/api/v1/audit/ai";
          break;
        case "GET_REPORTS":
          url = "/api/v1/audit/reports";
          break;
        case "GET_HISTORY":
          url = `/api/v1/audit/history/${historyTable}/${historyRecordId}`;
          break;
        case "POST_RESTORE":
          url = `/api/v1/audit/restore/aud-001`;
          method = "POST";
          body = JSON.stringify({ userId: "usr-001" });
          break;
        default:
          break;
      }

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "usr-001",
          "x-user-role": "Admin"
        }
      };
      if (method === "POST") {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setPlaygroundResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setPlaygroundResponse(`ERROR: ${err.message}`);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Filter logs locally for presentation
  const filteredLogs = logs.filter(log => {
    const matchTable = filterTable ? log.tableName.toLowerCase() === filterTable.toLowerCase() : true;
    const matchAction = filterAction ? log.action === filterAction : true;
    const matchRecord = searchRecordId ? log.recordId.includes(searchRecordId) : true;
    return matchTable && matchAction && matchRecord;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-12 min-h-[680px]">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 transition-all duration-300 transform translate-y-0 scale-100 ${
          toastMessage.type === "success" 
            ? "bg-slate-900 text-white border-indigo-500" 
            : "bg-red-50 text-red-900 border-red-200"
        }`}>
          {toastMessage.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <CheckCircle className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span className="text-xs font-bold font-sans tracking-wide">{toastMessage.text}</span>
        </div>
      )}

      {/* Left Navigation Rails (3 Cols) */}
      <div className="md:col-span-3 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1.5">
        <div className="pb-3.5 mb-2 border-b border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enterprise Modules</span>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
            Audit Module
          </h2>
          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Conforming with global safety standards and construction schedules.</p>
        </div>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-between transition ${
            activeSubTab === "logs" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 shrink-0" />
            <span>Unified Audit Trail</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
            activeSubTab === "logs" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
          }`}>{logs.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("users")}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-between transition ${
            activeSubTab === "users" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>User Activity Trail</span>
          </div>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{userActivities.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("projects")}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-between transition ${
            activeSubTab === "projects" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Project Activity Trail</span>
          </div>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">Active</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ai")}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-between transition ${
            activeSubTab === "ai" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 shrink-0" />
            <span>AI Execution Logs</span>
          </div>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{aiActivities.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("reports")}
          className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-between transition ${
            activeSubTab === "reports" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0" />
            <span>Report Run Trails</span>
          </div>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{reportActivities.length}</span>
        </button>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider mb-2">Developers</span>
          <button
            onClick={() => setActiveSubTab("playground")}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition ${
              activeSubTab === "playground" 
                ? "bg-slate-900 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Interactive APIs</span>
          </button>
        </div>

        {/* Database Sync Status Box */}
        <div className="mt-auto bg-slate-900 text-white p-3.5 rounded-xl text-[11px] leading-relaxed flex flex-col gap-2 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-400 font-mono text-[9px] uppercase tracking-wider">Storage Engine:</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <span className="font-extrabold text-slate-200 text-[10px]">Prisma & PostgreSQL</span>
          <p className="text-slate-400 text-[10px]">Changes tracked inside transactions. Full dynamic reversibility validated.</p>
        </div>
      </div>

      {/* Main Content Workspace Panel (9 Cols) */}
      <div className="md:col-span-9 p-6 flex flex-col gap-6">

        {/* ========================================================= */}
        {/* SUBTAB 1: UNIFIED AUDIT LOG FEED */}
        {/* ========================================================= */}
        {activeSubTab === "logs" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs">
            
            {/* Headers & Action bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Unified Audit Trails Feed</h3>
                <p className="text-[11px] text-slate-500">Every single structural, organizational, or administrative change logged chronologically with JSON snapshots.</p>
              </div>
              <button 
                onClick={fetchLogs} 
                disabled={loading}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 transition text-xs shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? "animate-spin" : ""}`} />
                Reload logs
              </button>
            </div>

            {/* Filtration Toolbar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-600">Filters:</span>
              </div>
              
              {/* Table Name */}
              <select 
                value={filterTable} 
                onChange={(e) => setFilterTable(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none focus:border-indigo-500"
              >
                <option value="">All Tables</option>
                <option value="Project">Project</option>
                <option value="Building">Building</option>
                <option value="Room">Room</option>
                <option value="ProjectFile">ProjectFile</option>
                <option value="User">User</option>
              </select>

              {/* Action */}
              <select 
                value={filterAction} 
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none focus:border-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="RESTORE">RESTORE</option>
              </select>

              {/* Record ID Search */}
              <input 
                type="text" 
                placeholder="Search record UUID..." 
                value={searchRecordId}
                onChange={(e) => setSearchRecordId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none focus:border-indigo-500 placeholder-slate-400 w-44"
              />

              {/* Reset */}
              {(filterTable || filterAction || searchRecordId) && (
                <button 
                  onClick={() => { setFilterTable(""); setFilterAction(""); setSearchRecordId(""); }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Logs List & Details Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Feeds Timeline (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 text-xs block">No matching audit logs</span>
                    <p className="text-[11px] mt-1">Adjust your filter values or trigger a mock restore transaction to populate logs.</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div 
                      key={log.id}
                      onClick={() => setSelectedLogForDetails(log)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2.5 hover:shadow-md ${
                        selectedLogForDetails?.id === log.id 
                          ? "bg-slate-900 text-white border-slate-900 scale-[1.01]" 
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                            log.action === "INSERT" ? "bg-emerald-100 text-emerald-800" :
                            log.action === "UPDATE" ? "bg-indigo-100 text-indigo-800" :
                            log.action === "DELETE" ? "bg-rose-100 text-rose-800" :
                            "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {log.action}
                          </span>
                          <span className={`font-mono text-[10px] font-bold ${
                            selectedLogForDetails?.id === log.id ? "text-indigo-300" : "text-slate-500"
                          }`}>
                            {log.tableName}
                          </span>
                        </div>
                        <span className="text-[9px] opacity-70 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="font-sans text-[11px] leading-relaxed">
                        {log.description || `${log.action} executed on ${log.tableName} record ID ${log.recordId}`}
                      </p>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/20 opacity-90">
                        <div className="flex items-center gap-1.5 font-sans font-semibold">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{log.userName || log.userEmail || "System Engine"}</span>
                        </div>
                        <span className="font-mono text-[9px] opacity-70">ID: {log.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Inspector Panel (5 Cols) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm min-h-[380px] flex flex-col">
                {selectedLogForDetails ? (
                  <div className="flex-1 flex flex-col justify-between text-xs text-left">
                    <div className="flex flex-col gap-4">
                      
                      {/* Meta header */}
                      <div className="border-b border-slate-200 pb-3">
                        <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider block">Snapshot Inspector</span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">Log {selectedLogForDetails.id}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">Table: {selectedLogForDetails.tableName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Record UUID: {selectedLogForDetails.recordId}</span>
                      </div>

                      {/* Side-by-side snapshot comparison */}
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        
                        {/* Old Values */}
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-400 uppercase tracking-wide">Prior Snapshot:</span>
                          <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200/80 font-mono text-[9px] overflow-x-auto h-36">
                            {selectedLogForDetails.oldValues ? (
                              <pre className="text-slate-600 whitespace-pre-wrap">{JSON.stringify(selectedLogForDetails.oldValues, null, 2)}</pre>
                            ) : (
                              <span className="text-slate-400 italic">None (INSERT)</span>
                            )}
                          </div>
                        </div>

                        {/* New Values */}
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-indigo-600 uppercase tracking-wide">Updated Snapshot:</span>
                          <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 font-mono text-[9px] overflow-x-auto h-36">
                            {selectedLogForDetails.newValues ? (
                              <pre className="text-slate-700 whitespace-pre-wrap">{JSON.stringify(selectedLogForDetails.newValues, null, 2)}</pre>
                            ) : (
                              <span className="text-rose-500 italic">Deleted (DELETE)</span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Educational Context */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Restoring this log will revert the table back to the values saved inside the <strong>Prior Snapshot</strong> block, preserving RERA schedule consistency.</span>
                      </div>

                    </div>

                    {/* Restore Action Button */}
                    <button
                      onClick={() => handleRestore(selectedLogForDetails.id)}
                      disabled={restoringId === selectedLogForDetails.id}
                      className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${restoringId === selectedLogForDetails.id ? "animate-spin" : ""}`} />
                      {restoringId === selectedLogForDetails.id ? "Executing database restore..." : "Revert Record to This Snapshot"}
                    </button>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 p-4">
                    <History className="w-10 h-10 text-slate-300 mb-2" />
                    <h5 className="font-bold text-slate-700 text-xs">Snapshot Inspector</h5>
                    <p className="text-[11px] leading-relaxed max-w-[180px] mt-1">Select any audit trail record in the left feed to compare historical changes and trigger a state restore.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 2: USER ACTIVITY TRAIL */}
        {/* ========================================================= */}
        {activeSubTab === "users" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">User Administration & Login Trails</h3>
              <p className="text-[11px] text-slate-500">Comprehensive, tamper-proof tracking of login events, user account setups, permissions changes, and roles mappings.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Operator</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Audit Details</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {act.userName ? act.userName[0] : "S"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{act.userName || "Operator"}</span>
                            <span className="text-[10px] text-slate-400">{act.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          act.action === "INSERT" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {act.action}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-600 font-sans">{act.description}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button 
                          onClick={() => { setSelectedLogForDetails(act); setActiveSubTab("logs"); }}
                          className="px-2.5 py-1 text-[11px] border border-slate-200 hover:bg-slate-50 rounded-md font-bold text-slate-600 transition"
                        >
                          Compare JSON
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl flex gap-3 text-slate-700">
              <UserCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Active RERA Compliance Security Principle:</span>
                <p className="text-[11px] leading-relaxed text-slate-500 mt-0.5">
                  Every administrative session modification logs the operator IP Address and JWT fingerprint in the persistent PostgreSQL Audit database. Auditors can inspect these lines to authenticate compliance.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 3: PROJECT ACTIVITY TRAIL */}
        {/* ========================================================= */}
        {activeSubTab === "projects" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs text-left">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Project Revision Timeline</h3>
                <p className="text-[11px] text-slate-500">Auditable history of construction scope, budgets, physical trades progress updates, and spatial objects configuration edits.</p>
              </div>
            </div>

            {/* Dynamic Revision Search Bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Search className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Examine Specific Record Revisions:</span>
              </div>
              
              <div className="flex flex-1 gap-2 w-full">
                <select 
                  value={historyTable} 
                  onChange={(e) => setHistoryTable(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="Project">Project Table</option>
                  <option value="Building">Building Table</option>
                  <option value="Room">Room Table</option>
                  <option value="ProjectFile">ProjectFile Table</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Record ID (e.g., proj-blr-02)"
                  value={historyRecordId}
                  onChange={(e) => setHistoryRecordId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono outline-none focus:border-indigo-500 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Revision List */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Chronological Revisions ({historyResults.length})</span>
              
              {historyResults.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span className="font-bold text-slate-700 text-xs block">No historical changes found for this entity</span>
                  <p className="text-[11px] mt-1">Check that you have input the correct table name and existing record ID.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-200 flex flex-col gap-6 text-left">
                  {historyResults.map((hist, idx) => (
                    <div key={hist.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm"></span>
                      
                      <div className="bg-slate-50/50 hover:bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4 transition">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs font-mono">Revision {historyResults.length - idx}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              hist.action === "INSERT" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                            }`}>
                              {hist.action}
                            </span>
                          </div>
                          
                          <p className="text-slate-600 text-xs">{hist.description || `Executed ${hist.action} transaction on record.`}</p>

                          <div className="text-[10px] text-slate-400 flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {hist.userName || "System"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(hist.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setSelectedLogForDetails(hist); setActiveSubTab("logs"); }}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-slate-700 transition"
                          >
                            Inspect JSON Diff
                          </button>
                          <button 
                            onClick={() => handleRestore(hist.id)}
                            disabled={restoringId === hist.id}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${restoringId === hist.id ? "animate-spin" : ""}`} />
                            Restore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 4: AI EXECUTION LOGS */}
        {/* ========================================================= */}
        {activeSubTab === "ai" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">AI Inspection Pipeline Execution Logs</h3>
              <p className="text-[11px] text-slate-500">Live logs from the FastAPI worker nodes running YOLOv8 object segmentation and PyTorch rebar count matching.</p>
            </div>

            {/* CUDA GPU Telemetry Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-indigo-400 font-bold font-mono block uppercase">GPU Acceleration</span>
                <span className="font-extrabold text-sm font-mono text-slate-100">NVIDIA L4 active</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-indigo-400 font-bold font-mono block uppercase">Memory Allocation</span>
                <span className="font-extrabold text-sm font-mono text-slate-100">8.2 GB / 24 GB</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-indigo-400 font-bold font-mono block uppercase">Inference Latency</span>
                <span className="font-extrabold text-sm font-mono text-slate-100">125ms / frame</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col gap-0.5 shadow-sm">
                <span className="text-[9px] text-indigo-400 font-bold font-mono block uppercase">Neural Precision</span>
                <span className="font-extrabold text-sm font-mono text-slate-100">94.6% YOLO-v8x</span>
              </div>
            </div>

            {/* AI Jobs feed */}
            <div className="flex flex-col gap-4">
              {aiActivities.map((job) => (
                <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-sm text-left">
                  
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{job.jobType}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Job ID: {job.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        job.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        job.status === "FAILED" ? "bg-red-50 text-red-700 border border-red-200" :
                        "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Completed: {new Date(job.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* GPU details & results banner */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    
                    {/* Left: Metadata specs (4 Cols) */}
                    <div className="md:col-span-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 font-bold uppercase block text-[8px] tracking-wide">Target Project:</span>
                        <span className="font-semibold text-slate-700">Bangalore Tech Park Phase 2</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase block text-[8px] tracking-wide">GPU Core:</span>
                        <span className="font-semibold text-slate-700">NVIDIA L4 Tensor Core (Shared)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase block text-[8px] tracking-wide">Job Parameters:</span>
                        <pre className="font-mono text-[9px] text-indigo-600 bg-white p-1 rounded border border-slate-100 mt-0.5">
                          {JSON.stringify(job.payload, null, 2)}
                        </pre>
                      </div>
                      {job.result && (
                        <div>
                          <span className="text-slate-400 font-bold uppercase block text-[8px] tracking-wide">Model Inference Output:</span>
                          <pre className="font-mono text-[9px] text-emerald-600 bg-white p-1 rounded border border-slate-100 mt-0.5">
                            {JSON.stringify(job.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Right: Simulated GPU Terminal Console (8 Cols) */}
                    <div className="md:col-span-8 flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                        Inference Log Stream
                      </span>
                      
                      <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto leading-relaxed border border-slate-900 shadow-inner flex flex-col gap-1">
                        {job.processingLogs.map((logLine, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-slate-500 shrink-0">[{idx + 1}]</span>
                            <span className={logLine.includes("discrepancy") || logLine.includes("displacement") ? "text-amber-400 font-semibold" : ""}>
                              {logLine}
                            </span>
                          </div>
                        ))}
                        {job.errorMessage && (
                          <div className="text-red-400 font-bold bg-red-950/40 p-2 rounded border border-red-900/30 mt-2">
                            [FATAL] Error: {job.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 5: REPORT GENERATION TRIALS */}
        {/* ========================================================= */}
        {activeSubTab === "reports" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Report Compilation Trails</h3>
              <p className="text-[11px] text-slate-500">TAMPER-PROOF chronological track of static RERA quality report compilations, including scanned rebar densities and structural drift warnings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportActivities.map((rep) => (
                <div key={rep.id} className="bg-slate-50/50 hover:bg-slate-50 p-5 border border-slate-200 rounded-xl flex flex-col justify-between gap-4 transition shadow-sm text-left">
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-bold">
                        {rep.format} READY
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{rep.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Created: {new Date(rep.createdAt).toLocaleString()}</span>
                    
                    <p className="text-slate-600 text-xs mt-2 italic leading-relaxed">
                      "{rep.summary}"
                    </p>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-[10px] mt-2 flex flex-col gap-1 font-mono">
                      <span className="text-slate-400 font-bold font-sans uppercase text-[8px]">Compiled Data Elements:</span>
                      {Object.entries(rep.reportData).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="font-bold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a 
                    href="#download"
                    onClick={(e) => { e.preventDefault(); showToast("success", `Initiated secure download of RERA ${rep.format} layout.`); }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    Download Signed PDF
                  </a>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 6: API SWAGGER PLAYGROUND */}
        {/* ========================================================= */}
        {activeSubTab === "playground" && (
          <div className="flex flex-col gap-5 animate-fade-in text-xs text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Audit Module OpenAPI / Swagger Documentation</h3>
              <p className="text-[11px] text-slate-500">Live API tester interface. Execute REST queries to our live NestJS endpoint routing simulator to verify response schemas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Swagger endpoints dictionary (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">API Endpoints Spec</span>
                
                {/* Endpoint item 1 */}
                <div 
                  onClick={() => setSelectedEndpoint("GET_LOGS")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedEndpoint === "GET_LOGS" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">GET</span>
                    <span className="font-bold text-slate-800 text-[11px] font-mono">/v1/audit/logs</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Get unified paginated change logs.</p>
                </div>

                {/* Endpoint item 2 */}
                <div 
                  onClick={() => setSelectedEndpoint("GET_USERS")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedEndpoint === "GET_USERS" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">GET</span>
                    <span className="font-bold text-slate-800 text-[11px] font-mono">/v1/audit/users</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Get user administration history logs.</p>
                </div>

                {/* Endpoint item 3 */}
                <div 
                  onClick={() => setSelectedEndpoint("GET_AI")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedEndpoint === "GET_AI" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">GET</span>
                    <span className="font-bold text-slate-800 text-[11px] font-mono">/v1/audit/ai</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Get computer vision task trial feeds.</p>
                </div>

                {/* Endpoint item 4 */}
                <div 
                  onClick={() => setSelectedEndpoint("GET_REPORTS")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedEndpoint === "GET_REPORTS" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">GET</span>
                    <span className="font-bold text-slate-800 text-[11px] font-mono">/v1/audit/reports</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Get weekly PDF compilation trails.</p>
                </div>

                {/* Endpoint item 5 */}
                <div 
                  onClick={() => setSelectedEndpoint("POST_RESTORE")}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedEndpoint === "POST_RESTORE" ? "bg-indigo-50 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-indigo-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">POST</span>
                    <span className="font-bold text-slate-800 text-[11px] font-mono">/v1/audit/restore/:id</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Revert record dynamically to log state.</p>
                </div>

              </div>

              {/* Dynamic Playground Console (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between min-h-[440px]">
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-wider">REST API Request Builder</span>
                    <span className="text-[9px] text-slate-500">Security: Bearer JWT Validated</span>
                  </div>

                  {/* Simulated request info */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold mr-2">{selectedEndpoint === "POST_RESTORE" ? "POST" : "GET"}</span>
                      <span>
                        {selectedEndpoint === "GET_LOGS" && "/api/v1/audit/logs"}
                        {selectedEndpoint === "GET_USERS" && "/api/v1/audit/users"}
                        {selectedEndpoint === "GET_AI" && "/api/v1/audit/ai"}
                        {selectedEndpoint === "GET_REPORTS" && "/api/v1/audit/reports"}
                        {selectedEndpoint === "POST_RESTORE" && "/api/v1/audit/restore/aud-001"}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[9px]">HTTPS/1.1</span>
                  </div>

                  {/* Optional JSON Query input if GET_LOGS */}
                  {selectedEndpoint === "GET_LOGS" && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Query Params DTO:</span>
                      <textarea 
                        value={apiLogsQuery}
                        onChange={(e) => setApiLogsQuery(e.target.value)}
                        className="bg-slate-950 text-slate-300 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] h-14 outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Response pre */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Response Payload:</span>
                    <div className="bg-slate-950 text-indigo-300 p-3.5 rounded-lg border border-slate-800 font-mono text-[10px] h-52 overflow-y-auto leading-relaxed">
                      {playgroundLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-500 italic">
                          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin mr-2" />
                          Executing REST transaction...
                        </div>
                      ) : (
                        playgroundResponse ? (
                          <pre className="whitespace-pre-wrap">{playgroundResponse}</pre>
                        ) : (
                          <span className="text-slate-500 italic">Click "Execute Request" below to trigger API route.</span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={runPlaygroundRequest}
                  disabled={playgroundLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow disabled:opacity-50 text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-white shrink-0" />
                  Execute Request
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
