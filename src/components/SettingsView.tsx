import React, { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  ShieldCheck,
  HardDrive,
  Brain,
  Lock,
  Palette,
  CreditCard,
  Plus,
  Trash2,
  Search,
  Check,
  RefreshCw,
  Clock,
  Download,
  Save,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Key,
  Copy,
  Coins,
  Sparkles
} from "lucide-react";

// Interfaces
interface UserMember {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "BIM Manager" | "Safety Officer" | "QC Inspector" | "Guest Auditor";
  status: "Active" | "Pending" | "Suspended";
  department: string;
  avatarColor: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  plan: string;
}

export default function SettingsView() {
  // Tabs: org, users, roles, storage, ai, security, appearance, billing
  const [activeTab, setActiveTab] = useState<
    "org" | "users" | "roles" | "storage" | "ai" | "security" | "appearance" | "billing"
  >("org");

  // Notifications State
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // 1. Organization Details State
  const [orgDetails, setOrgDetails] = useState({
    name: "BuildTrace India Private Limited",
    taxId: "IN-GST-29AABCB1234F1Z8",
    domain: "bangalore-hub.buildtrace.io",
    headOffice: "Level 11, Prestige Trade Tower, Palace Road, High Grounds, Bengaluru, KA 560001",
    contactEmail: "ops@buildtrace.in",
    phone: "+91 80 4912 8800",
    timezone: "UTC+05:30 (Kolkata)",
    country: "India"
  });

  // 2. Users State
  const [users, setUsers] = useState<UserMember[]>([
    {
      id: "usr-1",
      name: "Siddu Chitiki",
      email: "sidduchitiki@gmail.com",
      role: "Administrator",
      status: "Active",
      department: "Project Steering",
      avatarColor: "bg-indigo-600 text-white"
    },
    {
      id: "usr-2",
      name: "Amit Sharma",
      email: "amit.sharma@buildtrace.in",
      role: "BIM Manager",
      status: "Active",
      department: "VDC Planning",
      avatarColor: "bg-emerald-600 text-white"
    },
    {
      id: "usr-3",
      name: "Rajesh Kumar",
      email: "rajesh.k@buildtrace.in",
      role: "QC Inspector",
      status: "Active",
      department: "Quality Assurance",
      avatarColor: "bg-amber-600 text-white"
    },
    {
      id: "usr-4",
      name: "Priya Rao",
      email: "priya.rao@contractor-bt.com",
      role: "Safety Officer",
      status: "Pending",
      department: "HSE Compliance",
      avatarColor: "bg-rose-600 text-white"
    },
    {
      id: "usr-5",
      name: "Nikhil Deshmukh",
      email: "nikhil.d@rera-audits.gov.in",
      role: "Guest Auditor",
      status: "Suspended",
      department: "External Audit Committee",
      avatarColor: "bg-slate-600 text-white"
    }
  ]);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserMember["role"]>("BIM Manager");
  const [newUserDept, setNewUserDept] = useState("VDC Planning");

  // 3. Roles and Permissions configuration matrix
  const [selectedRoleToConfigure, setSelectedRoleToConfigure] = useState<UserMember["role"]>("BIM Manager");
  const [rolePermissions, setRolePermissions] = useState<Record<UserMember["role"], Record<string, boolean>>>({
    "Administrator": {
      "bim_upload": true,
      "ai_trigger": true,
      "user_invite": true,
      "billing_access": true,
      "delete_scans": true,
      "modify_schedules": true,
    },
    "BIM Manager": {
      "bim_upload": true,
      "ai_trigger": true,
      "user_invite": true,
      "billing_access": false,
      "delete_scans": false,
      "modify_schedules": true,
    },
    "Safety Officer": {
      "bim_upload": false,
      "ai_trigger": true,
      "user_invite": false,
      "billing_access": false,
      "delete_scans": false,
      "modify_schedules": false,
    },
    "QC Inspector": {
      "bim_upload": true,
      "ai_trigger": true,
      "user_invite": false,
      "billing_access": false,
      "delete_scans": false,
      "modify_schedules": false,
    },
    "Guest Auditor": {
      "bim_upload": false,
      "ai_trigger": false,
      "user_invite": false,
      "billing_access": false,
      "delete_scans": false,
      "modify_schedules": false,
    },
  });

  // 4. Storage & Retention settings
  const [storageSettings, setStorageSettings] = useState({
    retentionDays: 180,
    webGlCacheActive: true,
    rawPointCloudStore: true,
    customS3Url: "s3.ap-south-1.amazonaws.com/buildtrace-india-production"
  });

  // 5. AI Engine calibration settings
  const [aiSettings, setAiSettings] = useState({
    primaryModel: "gemini-2.5-pro",
    autoClashDetector: true,
    delayForecaster: true,
    safetyScanner: true,
    temperatureValue: 0.2,
    tokenCapMillions: 25
  });

  // 6. Security settings & API Key Issuer
  const [securitySettings, setSecuritySettings] = useState({
    mfaRequired: true,
    ssoEnabled: false,
    sessionTimeoutMins: 60,
    ipRestrictions: "103.45.2.0/24, 182.16.89.0/22"
  });

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "key-1",
      name: "Site Drone Upload Integration",
      key: "bt_live_pk_88d2fca4c01db163a39f50e828d54ee1",
      createdAt: "2026-03-12",
      lastUsed: "2026-07-12 11:42",
      status: "Active"
    },
    {
      id: "key-2",
      name: "Procore Core Syncer Hook",
      key: "bt_live_pk_12d4fb319cc83fe1009ee182390a3c2a",
      createdAt: "2026-05-20",
      lastUsed: "2026-07-11 18:15",
      status: "Active"
    },
    {
      id: "key-3",
      name: "Legacy Bentley MicroStation Link",
      key: "bt_live_pk_55d3dbef101f82737ca3909e20cb0019",
      createdAt: "2026-01-15",
      lastUsed: "2026-02-18 09:12",
      status: "Revoked"
    }
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // 7. Appearance & Styling State
  const [appearanceSettings, setAppearanceSettings] = useState({
    themePreset: "cosmic_slate",
    accentColor: "indigo",
    density: "balanced"
  });

  // 8. Billing details & Invoices list
  const [billingSettings, setBillingSettings] = useState({
    currentPlan: "Enterprise Plus Dedicated",
    billingFrequency: "Annually",
    costPerYear: "$29,988 USD",
    billingCycleEnd: "2026-12-31",
    paymentMethod: "Visa ending in 8891 (Expires 12/28)",
    billingContact: "accounts-payable@buildtrace.in"
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2026-004",
      date: "2026-07-01",
      amount: "$2,499.00 USD",
      status: "Paid",
      plan: "Enterprise Plus - July 2026"
    },
    {
      id: "INV-2026-003",
      date: "2026-06-01",
      amount: "$2,499.00 USD",
      status: "Paid",
      plan: "Enterprise Plus - June 2026"
    },
    {
      id: "INV-2026-002",
      date: "2026-05-01",
      amount: "$2,499.00 USD",
      status: "Paid",
      plan: "Enterprise Plus - May 2026"
    }
  ]);

  // ==========================================
  // CORE EVENT HANDLERS
  // ==========================================

  const handleSaveAllGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerToast("Configuration details committed to persistent indexes successfully.");
    }, 1000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      triggerToast("Please input valid email and name parameters.", "error");
      return;
    }

    const newUser: UserMember = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Pending",
      department: newUserDept,
      avatarColor: "bg-indigo-600 text-white"
    };

    setUsers([...users, newUser]);
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserModal(false);
    triggerToast(`Invited ${newUserName} successfully. Authentication token emailed.`);
  };

  const toggleUserStatus = (id: string, current: UserMember["status"]) => {
    const nextStatus: UserMember["status"] = current === "Active" ? "Suspended" : "Active";
    setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    triggerToast(`User status toggled to ${nextStatus}.`);
  };

  const removeUser = (id: string, name: string) => {
    if (window.confirm(`Remove user ${name} from organization access list?`)) {
      setUsers(users.filter(u => u.id !== id));
      triggerToast(`Removed ${name} from tenant.`);
    }
  };

  const handleTogglePermission = (role: UserMember["role"], permissionKey: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role][permissionKey]
      }
    }));
    triggerToast(`Toggled ${permissionKey} authorization for ${role}.`);
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `bt_live_pk_${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "Active"
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName("");
    triggerToast(`API key "${newKeyName}" provisioned.`);
  };

  const toggleApiKeyStatus = (id: string, currentStatus: ApiKey["status"]) => {
    const nextStatus = currentStatus === "Active" ? "Revoked" : "Active";
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: nextStatus } : k));
    triggerToast(`API Key status set to ${nextStatus}.`);
  };

  const handleCopyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
    triggerToast("Credential token copied to clipboard.");
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.department.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800" id="settings-view">
      
      {/* TOAST FEEDBACK PANEL */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-slate-800 transition-all">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
              <Lock className="w-5 h-5 text-indigo-400" />
            </span>
            <h2 className="text-lg font-black tracking-tight uppercase">Enterprise Settings Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure tenant profiles, manage security keys, authorize role permissions, and customize AI and Storage scopes.
          </p>
        </div>
        <div className="bg-slate-850 border border-slate-700/80 px-3 py-1.5 rounded-lg text-[10px] font-mono text-indigo-300 flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tenant: TracProgress-KA-992</span>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT DIRECTORY COLUMN (3 COLS) */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono px-3 pt-1 pb-2">Settings Segments</span>
          
          {[
            { id: "org", label: "Organization Details", icon: Building2 },
            { id: "users", label: "Users & Members", icon: Users, count: users.length },
            { id: "roles", label: "Roles & Permissions", icon: Shield },
            { id: "storage", label: "Storage & Retention", icon: HardDrive },
            { id: "ai", label: "AI Calibration Engine", icon: Brain },
            { id: "security", label: "Security & API Access", icon: Lock },
            { id: "appearance", label: "Appearance & Themes", icon: Palette },
            { id: "billing", label: "Billing & Subscription", icon: CreditCard }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm font-black"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? "bg-indigo-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[10px] text-slate-400 p-2 font-mono">
            <div className="flex justify-between">
              <span>Cluster Version:</span>
              <span className="font-bold text-slate-600">v4.82-LTS</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime SLA:</span>
              <span className="font-bold text-emerald-600">99.991%</span>
            </div>
          </div>
        </div>

        {/* RIGHT SUB-SCREEN AREA (9 COLS) */}
        <div className="lg:col-span-9 flex flex-col gap-6">

          {/* ==================== TAB 1: ORG DETAILS ==================== */}
          {activeTab === "org" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-indigo-500" />
                  Organization Corporate Identity
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust headquarters information, active GSTIN/Tax details, and primary redirection domains.
                </p>
              </div>

              <form onSubmit={handleSaveAllGeneral} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Official Registered Name</label>
                  <input
                    type="text"
                    value={orgDetails.name}
                    onChange={(e) => setOrgDetails({ ...orgDetails, name: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Tax ID / GSTIN Code</label>
                  <input
                    type="text"
                    value={orgDetails.taxId}
                    onChange={(e) => setOrgDetails({ ...orgDetails, taxId: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-mono text-slate-850"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Enterprise Domain Redirect</label>
                  <input
                    type="text"
                    value={orgDetails.domain}
                    onChange={(e) => setOrgDetails({ ...orgDetails, domain: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-mono text-slate-850"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Primary Contact Email</label>
                  <input
                    type="email"
                    value={orgDetails.contactEmail}
                    onChange={(e) => setOrgDetails({ ...orgDetails, contactEmail: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-bold text-slate-700">Headquarters Physical Address</label>
                  <textarea
                    rows={2}
                    value={orgDetails.headOffice}
                    onChange={(e) => setOrgDetails({ ...orgDetails, headOffice: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-800 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Global Contact Hotline</label>
                  <input
                    type="text"
                    value={orgDetails.phone}
                    onChange={(e) => setOrgDetails({ ...orgDetails, phone: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">System Timezone Index</label>
                  <select
                    value={orgDetails.timezone}
                    onChange={(e) => setOrgDetails({ ...orgDetails, timezone: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-medium text-slate-800"
                  >
                    <option value="UTC+05:30 (Kolkata)">Asia/Kolkata (UTC+05:30)</option>
                    <option value="UTC+00:00 (London)">Europe/London (UTC+00:00)</option>
                    <option value="UTC-08:00 (Pacific)">America/Los_Angeles (UTC-08:00)</option>
                    <option value="UTC+08:00 (Singapore)">Asia/Singapore (UTC+08:00)</option>
                  </select>
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-2 transition"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? "Saving Identity Config..." : "Commit Organization Data"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 2: MEMBERS DIRECTORY ==================== */}
          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-indigo-500" />
                    Enterprise Team Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Invite internal colleagues, toggle credential suspensions, and manage department divisions.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg flex items-center gap-1.5 transition shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Invite Personnel</span>
                </button>
              </div>

              {/* SEARCH FILTERS */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-150">
                <div className="relative bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center w-full sm:w-72 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search users by name, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-transparent outline-none text-xs w-full placeholder-slate-400 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 font-mono text-[10px]">Filter Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-medium outline-none"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="Administrator">Administrator</option>
                    <option value="BIM Manager">BIM Manager</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="QC Inspector">QC Inspector</option>
                    <option value="Guest Auditor">Guest Auditor</option>
                  </select>
                </div>
              </div>

              {/* DIRECTORY LIST */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="p-3.5 pl-4">Member</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">System Position</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3.5 pl-4 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${user.avatarColor}`}>
                              {user.name.split(" ").map(w => w[0]).join("")}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block">{user.name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{user.email}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-600 font-semibold">{user.department}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded uppercase text-[9px] border border-slate-200 font-mono">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 font-bold uppercase rounded text-[9px] ${
                              user.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : user.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right pr-4 space-x-1 shrink-0">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.status)}
                              className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded hover:bg-slate-50 transition cursor-pointer"
                            >
                              {user.status === "Active" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              onClick={() => removeUser(user.id, user.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                          No personnel matched the active criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* MODAL: ADD MEMBER */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl w-full max-w-md animate-scale-up text-xs flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-black text-slate-900 uppercase tracking-wider">Invite Tenant Personnel</h4>
                      </div>
                      <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddUserSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Email Address</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="e.g. j.doe@company.com"
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Workspace Position</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as UserMember["role"])}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="BIM Manager">BIM Manager</option>
                          <option value="Safety Officer">Safety Officer</option>
                          <option value="QC Inspector">QC Inspector</option>
                          <option value="Guest Auditor">Guest Auditor</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700">Department Segment</label>
                        <input
                          type="text"
                          required
                          value={newUserDept}
                          onChange={(e) => setNewUserDept(e.target.value)}
                          placeholder="e.g. HSE Quality Division"
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg transition"
                        >
                          Send Invitation
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: ROLES & POLICIES ==================== */}
          {activeTab === "roles" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-indigo-500" />
                  Workforce Position & Policy Access
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust toggleable feature flags to define custom functional permissions for selected enterprise roles.
                </p>
              </div>

              {/* CHOOSE ROLE SELECTION HEADER */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Selected Workspace Position</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{selectedRoleToConfigure}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100 font-mono">EDITABLE</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 font-mono text-[10px]">Change Role:</span>
                  <select
                    value={selectedRoleToConfigure}
                    onChange={(e) => setSelectedRoleToConfigure(e.target.value as UserMember["role"])}
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="BIM Manager">BIM Manager</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="QC Inspector">QC Inspector</option>
                    <option value="Guest Auditor">Guest Auditor</option>
                  </select>
                </div>
              </div>

              {/* MATRIX TOGGLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { key: "bim_upload", title: "MEP & IFC Model Upload", desc: "Allows overwriting architectural CAD assets and 3D wireframe segmentation layers." },
                  { key: "ai_trigger", title: "Trigger AI Calculations", desc: "Allows executing manually invoked computer vision scan matching and point cloud summaries." },
                  { key: "user_invite", title: "Invite Core Team Members", desc: "Allows registering new personnel email claim scopes within organization directory." },
                  { key: "billing_access", title: "Access Billing Ledger", desc: "Allows viewing invoices, updating cards, and increasing storage quotas." },
                  { key: "delete_scans", title: "Delete Compliance History", desc: "Enables raw scan deletion and metadata reset operations. Extremely sensitive.", isDanger: true },
                  { key: "modify_schedules", title: "Reschedule Baselines", desc: "Enables overriding Gannt critical path vectors and resetting calendar shifts." }
                ].map(item => (
                  <div key={item.key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)] flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className={`font-black block ${item.isDanger ? "text-rose-600 flex items-center gap-1" : "text-slate-900"}`}>
                        {item.isDanger && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        {item.title}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(selectedRoleToConfigure, item.key)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        rolePermissions[selectedRoleToConfigure][item.key] ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rolePermissions[selectedRoleToConfigure][item.key] ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Permission matrix policies apply instantaneously via OAuth claims check.
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast("Authorization policies successfully committed to Okta.")}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  Apply Claim Policies
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: STORAGE ==================== */}
          {activeTab === "storage" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4.5 h-4.5 text-indigo-500" />
                  Storage Allocation & Retentions
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Allocate disk space, tune client WebGL caching configurations, and set raw data purge deadlines.
                </p>
              </div>

              {/* STORAGE METRICS BAR */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                <div className="space-y-1 flex-1 w-full">
                  <span className="text-[9px] text-indigo-300 font-bold uppercase block tracking-wider font-mono">Allocated Storage Space (85% Utilized)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono">1,741.2 GB</span>
                    <span className="text-slate-400 text-xs">used of 2,048 GB</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2 border border-slate-700/50 flex">
                    <div className="bg-indigo-500 h-full w-[45%]" />
                    <div className="bg-emerald-500 h-full w-[30%]" />
                    <div className="bg-amber-500 h-full w-[10%]" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-slate-400 pt-1.5">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500" /> CAD Models (45%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Drone Clouds (30%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> Audit Logs (10%)</span>
                  </div>
                </div>

                <button
                  onClick={() => triggerToast("Point cloud directory compacted. Reclaimed 42.5 GB.")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition shrink-0 w-full sm:w-auto"
                >
                  Compact Files
                </button>
              </div>

              {/* RETENTION CONTROLS */}
              <form onSubmit={handleSaveAllGeneral} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      Historical Orthomosaic Retention Purge
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-150">{storageSettings.retentionDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={720}
                    step={30}
                    value={storageSettings.retentionDays}
                    onChange={(e) => setStorageSettings({ ...storageSettings, retentionDays: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-1"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>30 Days (Fast Cycle)</span>
                    <span>180 Days (Half Year)</span>
                    <span>720 Days (2 Years Compliance)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 block">WebGL Canvas Caching</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Caches recognized physical concrete columns inside browser IndexedDB to reduce point-cloud network transfers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStorageSettings({ ...storageSettings, webGlCacheActive: !storageSettings.webGlCacheActive })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        storageSettings.webGlCacheActive ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        storageSettings.webGlCacheActive ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 block">Backup Point Clouds</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Archive expired CAD files inside Amazon S3 Glaciers instead of running hard deletion purging routines.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStorageSettings({ ...storageSettings, rawPointCloudStore: !storageSettings.rawPointCloudStore })}
                      className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                        storageSettings.rawPointCloudStore ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        storageSettings.rawPointCloudStore ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-bold text-slate-700">Custom S3 Object Storage Endpoints</label>
                  <input
                    type="text"
                    value={storageSettings.customS3Url}
                    onChange={(e) => setStorageSettings({ ...storageSettings, customS3Url: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:border-indigo-500 outline-none font-mono text-slate-600"
                  />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Storage Parameters</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 5: AI ENGINE ==================== */}
          {activeTab === "ai" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4.5 h-4.5 text-indigo-500" />
                  Gemini AI Model Calibration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure Gemini core models, adjust context parameters, and set monthly programmatic token budget guardrails.
                </p>
              </div>

              {/* EXPERIMENTAL CAP */}
              <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5 text-xs text-indigo-900">
                  <span className="font-extrabold block uppercase tracking-wider text-[10px]">Secure LLM Proxy Active</span>
                  <p className="leading-relaxed text-[11px]">
                    Your workspace queries are proxied via TracProgress secure clusters. Model parameters do not feed back into public baseline training repositories.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAllGeneral} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700">Target Core LLM Model</label>
                  <select
                    value={aiSettings.primaryModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, primaryModel: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-800"
                  >
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Precision Segmentation)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Standard Stream pipeline)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy compatibility)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 font-mono">Generation Temperature (0.2 recommended)</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={aiSettings.temperatureValue}
                      onChange={(e) => setAiSettings({ ...aiSettings, temperatureValue: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">{aiSettings.temperatureValue}</span>
                  </div>
                </div>

                {/* AI PIPELINES ROW */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                  <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider font-mono mb-3">AI Automation Pipeline Filters</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Auto Clash Alert</span>
                        <input
                          type="checkbox"
                          checked={aiSettings.autoClashDetector}
                          onChange={(e) => setAiSettings({ ...aiSettings, autoClashDetector: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 leading-normal">Runs MEP vs Concrete column collision searches on upload.</span>
                    </div>

                    <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Delay Predictor</span>
                        <input
                          type="checkbox"
                          checked={aiSettings.delayForecaster}
                          onChange={(e) => setAiSettings({ ...aiSettings, delayForecaster: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 leading-normal">Scans progress logs to estimate milestone shift risks.</span>
                    </div>

                    <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Safety Hazard Audit</span>
                        <input
                          type="checkbox"
                          checked={aiSettings.safetyScanner}
                          onChange={(e) => setAiSettings({ ...aiSettings, safetyScanner: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 leading-normal">Flags guardrails and PPE safety omissions via computer vision.</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-bold text-slate-700">Monthly AI Token Consumption Limit (Millions)</label>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <Coins className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="flex-1">
                      <input
                        type="range"
                        min={1}
                        max={100}
                        step={5}
                        value={aiSettings.tokenCapMillions}
                        onChange={(e) => setAiSettings({ ...aiSettings, tokenCapMillions: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <span className="bg-indigo-600 text-white font-mono px-3 py-1 rounded-lg text-xs font-black">
                      {aiSettings.tokenCapMillions}M tokens
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Calibration Config</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 6: SECURITY & API ==================== */}
          {activeTab === "security" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-indigo-500" />
                  Security Guardrails & Programmatic Keys
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce authentication parameters, whitelist office IP scopes, and issue secure integration keys.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block">Require 2FA Authentication</span>
                    <span className="text-[10px] text-slate-400 block leading-relaxed">
                      Enforce Multi-Factor (TOTP) codes for all directory personnel logins.
                    </span>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, mfaRequired: !securitySettings.mfaRequired })}
                    className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                      securitySettings.mfaRequired ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      securitySettings.mfaRequired ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block">Enforce Single Sign-On (SSO)</span>
                    <span className="text-[10px] text-slate-400 block leading-relaxed">
                      Sync credential records automatically with Okta/Azure Active Directory mappings.
                    </span>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, ssoEnabled: !securitySettings.ssoEnabled })}
                    className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                      securitySettings.ssoEnabled ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      securitySettings.ssoEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Inactivity Session Timeout</label>
                  <select
                    value={securitySettings.sessionTimeoutMins}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeoutMins: parseInt(e.target.value) })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold text-slate-800"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour (Standard)</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Office IP Access Range (CIDR Whitelist)</label>
                  <input
                    type="text"
                    value={securitySettings.ipRestrictions}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, ipRestrictions: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-slate-750 focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* API KEYS SECTION */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-500" />
                    Programmatic API Credentials
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Generate secure webhooks secrets to automate orthomosaic point cloud ingestion pipelines.
                  </p>
                </div>

                <form onSubmit={handleCreateApiKey} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Drone Ortho Pipeline integration..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white focus:border-indigo-500 outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate key</span>
                  </button>
                </form>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-150 text-xs">
                  {apiKeys.map(apiKey => (
                    <div key={apiKey.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{apiKey.name}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            apiKey.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-red-50 text-red-700 border border-red-150"
                          }`}>
                            {apiKey.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <span>Created: {apiKey.createdAt}</span>
                          <span>•</span>
                          <span>Last Sync: {apiKey.lastUsed}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="bg-slate-950 px-2.5 py-1.5 rounded-lg text-white font-mono text-[10px] truncate max-w-xs flex-1 select-all border border-slate-800">
                          {apiKey.key.substr(0, 15)}...
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition shrink-0"
                          title="Copy Credential Token"
                        >
                          {copiedKeyId === apiKey.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.status)}
                          className="px-2.5 py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded transition shrink-0"
                        >
                          {apiKey.status === "Active" ? "Revoke" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 7: APPEARANCE ==================== */}
          {activeTab === "appearance" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4.5 h-4.5 text-indigo-500" />
                  Appearance & Branding Themes
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure corporate palette mappings, adjust layout density presets, and customize high-contrast parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div
                  onClick={() => setAppearanceSettings({ ...appearanceSettings, themePreset: "light" })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    appearanceSettings.themePreset === "light"
                      ? "border-indigo-600 bg-indigo-50/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-350 bg-white"
                  }`}
                >
                  <div className="w-full h-16 bg-slate-100 rounded border border-slate-200 mb-3 flex flex-col p-1.5 gap-1">
                    <div className="w-3/4 h-2 bg-slate-300 rounded" />
                    <div className="w-1/2 h-2 bg-slate-200 rounded" />
                  </div>
                  <span className="font-extrabold text-slate-900 block">Enterprise Light</span>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">High contrast, clean layout optimized for daylight work.</p>
                </div>

                <div
                  onClick={() => setAppearanceSettings({ ...appearanceSettings, themePreset: "cosmic_slate" })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    appearanceSettings.themePreset === "cosmic_slate"
                      ? "border-indigo-600 bg-indigo-50/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-350 bg-white"
                  }`}
                >
                  <div className="w-full h-16 bg-slate-900 rounded border border-slate-800 mb-3 flex flex-col p-1.5 gap-1">
                    <div className="w-3/4 h-2 bg-slate-700 rounded" />
                    <div className="w-1/2 h-2 bg-slate-800 rounded" />
                  </div>
                  <span className="font-extrabold text-slate-900 block">Cosmic Slate Dark</span>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Warm dark canvas designed for low-light rooms.</p>
                </div>

                <div
                  onClick={() => setAppearanceSettings({ ...appearanceSettings, themePreset: "high_contrast" })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    appearanceSettings.themePreset === "high_contrast"
                      ? "border-indigo-600 bg-indigo-50/10 shadow-xs"
                      : "border-slate-200 hover:border-slate-350 bg-white"
                  }`}
                >
                  <div className="w-full h-16 bg-slate-950 rounded border border-slate-900 mb-3 flex flex-col p-1.5 gap-1">
                    <div className="w-3/4 h-2 bg-slate-100 rounded" />
                    <div className="w-1/2 h-2 bg-yellow-400 rounded" />
                  </div>
                  <span className="font-extrabold text-slate-900 block">CAD High Contrast</span>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Maximized luminescence maps matching design terminals.</p>
                </div>
              </div>

              {/* COLOR RANGE */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 text-xs">
                <span className="font-bold text-slate-700">Primary Branding Color Key</span>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: "indigo", bg: "bg-indigo-600", name: "Indigo Royal" },
                    { key: "teal", bg: "bg-teal-600", name: "Matrix Teal" },
                    { key: "emerald", bg: "bg-emerald-600", name: "Emerald Safety" },
                    { key: "amber", bg: "bg-amber-600", name: "Amber Alert" }
                  ].map(color => (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => {
                        setAppearanceSettings({ ...appearanceSettings, accentColor: color.key });
                        triggerToast(`Brand accent color set to ${color.name}.`);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <div className={`w-5 h-5 rounded-full ${color.bg} border ${
                        appearanceSettings.accentColor === color.key ? "border-slate-900 scale-110 ring-2 ring-indigo-100" : "border-transparent"
                      }`} />
                      <span className="text-[10px] font-semibold text-slate-500">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DENSITY SELECTION */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Display Layout Density</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 w-64">
                  {["compact", "balanced", "spacious"].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, density: d })}
                      className={`flex-1 text-center py-1.5 rounded font-mono font-bold text-[9px] uppercase transition-all ${
                        appearanceSettings.density === d
                          ? "bg-white text-slate-900 shadow-sm font-black"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => triggerToast("Styling preferences stored in cluster configs.")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Appearance Config</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 8: BILLING ==================== */}
          {activeTab === "billing" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-500" />
                  Billing Audit & Subscription Metrics
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage corporate recurring payment cycles, audit subscription meters, and download compliance receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-xl flex flex-col justify-between md:col-span-2">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Current Plan
                    </span>
                    <h4 className="text-sm font-black tracking-tight">{billingSettings.currentPlan}</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1">
                      High capacity dedicated cluster for Indian VDC pipelines, including automated drone point cloud matching.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 mt-4 border-t border-slate-800 text-[10px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Cycle:</span>
                      <span className="font-bold text-white">{billingSettings.billingFrequency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Annual Cost:</span>
                      <span className="font-bold text-white">{billingSettings.costPerYear}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Renews On:</span>
                      <span className="font-bold text-amber-400">{billingSettings.billingCycleEnd}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Payment Method</span>
                    <span className="text-xs font-bold text-slate-800 block">{billingSettings.paymentMethod}</span>
                    <span className="text-[10px] text-slate-400 block mt-2">Billing Invoice Contact:</span>
                    <span className="text-[10px] font-mono text-indigo-600 block truncate">{billingSettings.billingContact}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerToast("Invoice setup verification link emailed.")}
                    className="w-full py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 font-bold rounded text-[10px] mt-4 transition cursor-pointer"
                  >
                    Modify Method
                  </button>
                </div>
              </div>

              {/* METERED METRICS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4 text-xs">
                <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider font-mono">Plan Quotas Utilization Index</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>Registered User Seats</span>
                      <span>18 / 50</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[36%]" />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">32 empty seats available</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>Active CAD BIM Models</span>
                      <span>12 / 30</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[40%]" />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">18 slots remaining</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>Monthly Drone Scans</span>
                      <span>45 / 100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[45%]" />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">Resets automatically on Aug 1st</span>
                  </div>
                </div>
              </div>

              {/* INVOICES SECTION */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Historical Account Invoices</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Download audited receipts containing registered tax reference labels.</p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="p-3.5 flex justify-between items-center bg-white hover:bg-slate-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-500">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block">{invoice.id}</span>
                          <span className="text-[10px] text-slate-400 block">{invoice.plan} • {invoice.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-700">{invoice.amount}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 font-bold uppercase text-[9px] rounded font-mono">
                          {invoice.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Dispatched invoice download request for ${invoice.id}`)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded transition flex items-center gap-1 cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
