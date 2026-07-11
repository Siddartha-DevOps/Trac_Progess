import React, { useState } from "react";
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Key, 
  Search, 
  Building2, 
  CheckCircle, 
  HelpCircle,
  MoreVertical,
  Plus
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Staff Operator" | "BIM Manager" | "QC Engineer" | "Project Director";
  status: "active" | "inactive";
  permissions: string[];
}

const TEAM_DIRECTORY: TeamMember[] = [
  {
    id: "mem-01",
    name: "Staff Operator",
    email: "sidduchitiki@gmail.com",
    role: "Staff Operator",
    status: "active",
    permissions: ["Full BIM Navigation", "Computer Vision Inspection", "Compile Reports"]
  },
  {
    id: "mem-02",
    name: "Amit Sharma",
    email: "amit.sharma@buildtrace.in",
    role: "BIM Manager",
    status: "active",
    permissions: ["Model Upload (IFC)", "Coordinate Alignment", "Security Token Tuning"]
  },
  {
    id: "mem-03",
    name: "Rajesh Kumar",
    email: "rajesh.qc@buildtrace.in",
    role: "QC Engineer",
    status: "active",
    permissions: ["Open Quality Deviations", "Assign Remedies", "Verify Photogrammetry"]
  },
  {
    id: "mem-04",
    name: "Vikramaditya Birla",
    email: "v.birla@buildtrace.in",
    role: "Project Director",
    status: "active",
    permissions: ["Financial Approval", "Delete Project", "RERA Legal Affirmation"]
  }
];

export default function UsersView() {
  const [search, setSearch] = useState("");

  const filtered = TEAM_DIRECTORY.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="users-view">
      
      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Operators</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{TEAM_DIRECTORY.length} Members</span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Active in session</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">RERA Authority Clearance</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">Approved</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Verified RERA biometric clearance</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg shrink-0">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Scope Hierarchy Access</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">Tier-1 Secure</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Active SSL & AES-256 databases</p>
          </div>
        </div>

      </div>

      {/* Team Directory and permissions roster */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        
        {/* Controls bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Enterprise Team Authorization Matrix</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Configure spatial verification scopes and BIM edit clearances for verified project builders.</p>
          </div>
          
          <div className="flex gap-2 text-xs">
            {/* Search query directory */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Find operator..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-700 outline-none w-full"
              />
            </div>
            <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-bold hover:bg-indigo-750 transition flex items-center gap-1.5 shrink-0 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold">
                <th className="py-2.5">User Identity</th>
                <th className="py-2.5">Corporate Role</th>
                <th className="py-2.5">Authorized Scopes</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              {filtered.map(mem => (
                <tr key={mem.id} className="hover:bg-slate-50/50">
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 select-none">
                        {mem.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-900">{mem.name}</span>
                        <span className="text-[10px] text-slate-400">{mem.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-slate-800">
                    {mem.role}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {mem.permissions.map((perm, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200/50 text-[10px] text-slate-600 rounded font-semibold"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
