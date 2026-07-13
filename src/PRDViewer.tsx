import React, { useState } from "react";
import { 
  BookOpen, 
  Target, 
  Cpu, 
  Workflow, 
  ShieldCheck, 
  Layers, 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Boxes
} from "lucide-react";

export default function PRDViewer() {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "features" | "stack" | "security">("overview");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* PRD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Product Requirements Document (PRD)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            BuildTrace India: AI-Driven Construction Site Progress Tracking & Verification System
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Status: Approved (v1.4)</span>
        </div>
      </div>

      {/* Horizontal Nav Bar */}
      <div className="flex border-b border-slate-100 overflow-x-auto gap-2 p-0.5 scrollbar-thin">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "overview" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Target className="w-4 h-4" />
          1. Vision & Objectives
        </button>
        <button
          onClick={() => setActiveSubTab("features")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "features" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Core Modules
        </button>
        <button
          onClick={() => setActiveSubTab("stack")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "stack" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Cpu className="w-4 h-4" />
          3. Technical Stack
        </button>
        <button
          onClick={() => setActiveSubTab("security")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "security" 
              ? "bg-slate-900 text-white shadow-sm" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          4. Security & SLAs
        </button>
      </div>

      {/* Sub-tab content */}
      <div className="min-h-[300px]">
        {activeSubTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Executive Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                BuildTrace India is a complete, enterprise-grade automated site progress verification system designed for the Indian infrastructure landscape. Under state-level **RERA** audit frameworks, developers suffer steep cash penalties for scheduling delays. 
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                By cross-referencing high-fidelity real-world orthomosaics with virtual 3D IFC models, BuildTrace replaces subjective human reporting with millimetric physical evidence.
              </p>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 mt-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>The tracprogress® Platform for India</span>
                </div>
                <p className="text-[11px] text-indigo-600 leading-relaxed">
                  Engineered specifically to solve the manual overhead of daily inspections on complex multi-tier projects. Supports deep structural rebar verification and MEP layout alignment checks.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Core Product Goals</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Automate On-site Inspections</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Ensure physical construction status maps 1-to-1 with structural steel and masonry timelines.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cross-domain Clash Identification</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Flag MEP design errors, conduit collisions, and HVAC duct misalignments prior to plastering stages.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Immutable RERA Auditing</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Store cryptographically secure site inspection reports to defend project compliance records.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "features" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Functional Modules Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">3D IFC.js Viewer Canvas</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Real-time rendering of complex virtual CAD geometry inside lightweight client web pages. Supports custom floor selections, trade toggles, clipping plane sliders, and automated AI highlight overlays.
                </p>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">Computer Vision & AI Alignment</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allows interactive 3D coordinate calibration ($x, y, z$, and yaw degrees). Uses Gemini 2.5 models to automatically generate actionable engineering remediation briefs based on detected spacing/alignment anomalies.
                </p>
              </div>

              <div className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Workflow className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">BullMQ Ingestion Architecture</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Robust, non-blocking asynchronous processing workers optimized for heavy drone files and helmet 360 sweeps. Powered by Redis queue managers and Python segmenting pipelines.
                </p>
              </div>

            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-2">Required Core Features Priority Map</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-700">IFC rendering (P0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-700">Trade filters (P0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-700">Clipping Planes (P1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-700">Gemini Correction (P1)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "stack" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Software Stack Integration</h3>
              
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-medium">Core Web Interface:</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">React 18 + Vite</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-medium">Interactive Graphics:</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">IFC.js WebEngine SDK</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-medium">Asynchronous Pipeline:</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">BullMQ & Redis</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-1.5">
                  <span className="text-slate-400 font-medium">Backend Models:</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">FastAPI & Python CUDA</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1.5">
                  <span className="text-slate-400 font-medium">Database Entity Manager:</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">Prisma ORM & PostgreSQL</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Architecture Model Schema</h3>
              <div className="p-4 bg-slate-950 text-slate-300 font-mono text-xs rounded-xl border border-slate-800">
                <div className="text-indigo-400">// BimElement Schema Representing Virtual Assets</div>
                <div>model BimElement &#123;</div>
                <div className="pl-4">id             String @id</div>
                <div className="pl-4">guid           String @unique</div>
                <div className="pl-4">name           String</div>
                <div className="pl-4">category       String <span className="text-slate-500">// MEP, Struct...</span></div>
                <div className="pl-4">status         String <span className="text-slate-500">// completed...</span></div>
                <div className="pl-4">lastUpdatedAt  DateTime @updatedAt</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Enterprise SLA Objectives</h3>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                  <div>
                    <strong className="text-slate-800">99.9% Engineering Portal Uptime:</strong>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">Maintain continuous portal accessibility for critical on-site coordinators during key pour/erection shifts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                  <div>
                    <strong className="text-slate-800">Millimetric Calibration Margin:</strong>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">The registration algorithm must align high-fidelity orthomosaic surfaces within 15mm of BIM coordinates.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Security Rules & Compliance</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col gap-2.5">
                <div className="flex gap-2 items-center text-slate-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Immutable Coordination Logs</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  All interactive coordinate changes, segment overlays, and active trade adjustments are cryptographic and signed to resist timeline tamper disputes under active RERA legislation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
