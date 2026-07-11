import React, { useState } from "react";
import { 
  Settings, 
  Database, 
  Sliders, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  Key, 
  Check, 
  RefreshCw,
  Clock,
  HardDrive,
  Network
} from "lucide-react";

export default function SettingsView() {
  const [telemetryRate, setTelemetryRate] = useState<number>(1000);
  const [isCnvCacheActive, setIsCnvCacheActive] = useState<boolean>(true);
  const [apiGateway, setApiGateway] = useState<string>("https://api-gateway.bangalore.buildtrace.in/v1");
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  
  const triggerCopyKey = () => {
    navigator.clipboard.writeText("sk_live_rera_55d3dbef_e1d2_4340_a1d0_eab84ea2ded4");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="settings-view">
      
      {/* 1. Page Title header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">Enterprise Workspace Configuration</h2>
        <p className="text-xs text-slate-500 mt-0.5">Adjust database syncing, telemetry speed, active API keys, and spatial cache variables.</p>
      </div>

      {/* 2. Grid config panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column Settings controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Section: Telemetry & Polling Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                Drone Photogrammetry Telemetry Sync Rate
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Controls the frequency of point-cloud segmentation analysis calculations.</p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-700">
                <span>Polling Speed Interval</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{telemetryRate}ms</span>
              </div>
              <input 
                type="range" 
                min={200} 
                max={5000} 
                step={100}
                value={telemetryRate}
                onChange={(e) => setTelemetryRate(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Fast Real-time (200ms)</span>
                <span>Balanced Default (1000ms)</span>
                <span>Optimized Eco (5000ms)</span>
              </div>
            </div>
          </div>

          {/* Section: Cache Tuning */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                WebGL 3D Cache Settings
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Tune client-side browser performance during complex IFC layout rendering.</p>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Instance Segmentation Caching</span>
                <span className="text-[10px] text-slate-400 block max-w-lg">Caches recognized physical columns and slabs inside IndexDB. Dramatically speeds up week-to-week timeline scrubbing.</span>
              </div>
              <button 
                onClick={() => setIsCnvCacheActive(!isCnvCacheActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${isCnvCacheActive ? "bg-indigo-600" : "bg-slate-300"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isCnvCacheActive ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Section: API endpoints */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-4 h-4 text-indigo-500" />
                API Gateway Routes
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Route physical scan orthomosaic payloads through specific secure tunnels.</p>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Gateway Base Address</span>
              <input 
                type="text"
                value={apiGateway}
                onChange={(e) => setApiGateway(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-slate-600 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

        </div>

        {/* Right column credentials & status (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Credentials lock box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  RERA Authorized Keys
                </span>
                <Key className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Workspace Secure Secret</h3>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Use this token to feed point cloud data directly from drone photography systems or Procore webhooks into the BuildTrace compliance engine.
              </p>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] break-all select-all flex justify-between items-center gap-2">
                <span className="text-slate-400 truncate">sk_live_rera_55d3...</span>
                <button 
                  onClick={triggerCopyKey}
                  className="bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-[10px] font-bold text-white transition shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : "Copy"}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Encrypted on cluster</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
