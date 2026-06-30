import React, { useState, useEffect } from "react";
import { PipelineStep } from "../types";
import { Terminal, Cpu, Database, Compass, Layers, Radio, HelpCircle, Loader2 } from "lucide-react";

export default function TechArchitecture() {
  const [logs, setLogs] = useState<PipelineStep[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedTechSection, setSelectedTechSection] = useState<string>("cv");
  const [loading, setLoading] = useState(false);

  // Poll server endpoint for simulated Python FastAPI backend logs
  const fetchPipelineLogs = async () => {
    try {
      const res = await fetch("/api/pipeline/logs");
      const data = await res.json();
      if (data.pipelineSteps) {
        setLogs(data.pipelineSteps);
        setActiveStep(data.activeStepIndex);
      }
    } catch (err) {
      console.error("Failed to fetch pipeline logs:", err);
    }
  };

  useEffect(() => {
    fetchPipelineLogs();
    const interval = setInterval(fetchPipelineLogs, 4000); // refresh logs every 4s to simulate pipeline progress
    return () => clearInterval(interval);
  }, []);

  const pipelineStages = [
    { id: 0, label: "Drone Mapping", desc: "DJI Matrice High-Res Aerial Surveys", tech: "OpenCV, ExifData" },
    { id: 1, label: "Photogrammetry", desc: "Density Point Cloud Reconstruction", tech: "Python, Open3D, SIFT" },
    { id: 2, label: "IFC/BIM Parsing", desc: "Extrusion Geometry Construction", tech: "IfcOpenShell, Python" },
    { id: 3, label: "BIM Alignment", desc: "Iterative Closest Point Coordinate Sync", tech: "RANSAC, ICP Algorithm" },
    { id: 4, label: "Anomaly Search", desc: "PyTorch Bounding Segment Identification", tech: "ResNet, YOLO-v8, PyTorch" },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 shadow-md flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Technical Architecture & AI Engine
        </h3>
        <p className="text-xs text-slate-400">
          How BuildTrace India processes high-resolution drone scans, aligns coordinate grids, and tracks progress.
        </p>
      </div>

      {/* Grid: Tech Stack Explanations & Process Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Technical Process Pipe (4 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              Python Processing Pipeline
            </h4>
            
            <div className="flex flex-col gap-3 relative pl-4 border-l-2 border-slate-800">
              {pipelineStages.map((stage) => {
                const isCurrent = activeStep === stage.id;
                const isPassed = activeStep > stage.id;
                return (
                  <div key={stage.id} className="relative flex flex-col gap-1">
                    {/* Floating checkpoint node */}
                    <div className={`absolute -left-[25px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                      isCurrent 
                        ? "bg-indigo-600 border-indigo-400 text-white animate-pulse" 
                        : (isPassed ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-800 text-slate-500")
                    }`}>
                      {stage.id + 1}
                    </div>

                    <div className="pl-2">
                      <span className={`text-xs font-bold block ${isCurrent ? "text-indigo-400" : (isPassed ? "text-emerald-400" : "text-slate-400")}`}>
                        {stage.label}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal">{stage.desc}</p>
                      <span className="inline-block text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono mt-1">
                        {stage.tech}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Core Pipeline Explainer */}
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex flex-col gap-2">
            <span className="font-semibold text-slate-300">How Alignment Works:</span>
            <p className="text-[11px] leading-relaxed">
              We align drone point clouds with the digital BIM (IFC) schema by identifying anchor coordinates (lift shafts, core columns) using a <strong>RANSAC</strong> keypoint matcher, followed by <strong>ICP (Iterative Closest Point)</strong> geometry optimization. This yields sub-centimeter alignment accuracy on active sites.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Tech Stack Specs & Terminal logs (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Terminal Logs (Active Server output from FastAPI Celery Queue) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                <Terminal className="w-4 h-4 animate-pulse" />
                <span>celery-worker@buildtrace-fastapi:~ logs</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
            </div>

            <div className="p-4 font-mono text-[11px] text-slate-300 flex flex-col gap-2.5 min-h-[170px] bg-slate-950 max-h-[250px] overflow-y-auto select-none">
              <div className="text-slate-500">{"// Listening for incoming site orthophoto chunks..."}</div>
              
              {logs.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div key={idx} className={`p-2 rounded border transition-colors duration-300 ${
                    isActive ? "bg-indigo-950/40 border-indigo-900/60 text-white" : "border-transparent text-slate-400"
                  }`}>
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className={`font-semibold ${isActive ? "text-indigo-400" : "text-slate-400"}`}>{step.step}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        step.status === "Completed" ? "bg-emerald-950 text-emerald-400" : (step.status === "In Progress" ? "bg-indigo-900 text-indigo-300 animate-pulse" : "bg-slate-900 text-slate-500")
                      }`}>{step.status}</span>
                    </div>
                    <p className="leading-relaxed text-[10px] break-words">{step.log}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Tech Spec Tabs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex gap-2 border-b border-slate-800 pb-2 mb-3">
              <button
                onClick={() => setSelectedTechSection("cv")}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                  selectedTechSection === "cv" ? "bg-slate-800 text-white border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Computer Vision & AI
              </button>
              <button
                onClick={() => setSelectedTechSection("bim")}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                  selectedTechSection === "bim" ? "bg-slate-800 text-white border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Three.js BIM Engine
              </button>
              <button
                onClick={() => setSelectedTechSection("infra")}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition ${
                  selectedTechSection === "infra" ? "bg-slate-800 text-white border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Backend & Scaling
              </button>
            </div>

            {selectedTechSection === "cv" && (
              <div className="text-xs text-slate-400 flex flex-col gap-2 leading-relaxed">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" /> PyTorch Neural Vision Pipeline
                </span>
                <p>
                  Our automated discrepancy detector runs customized deep convolutional neural networks (Segment Anything Model & YOLO-v8 instance segmentation) optimized for industrial objects. The system segmentates items like concrete reinforcement bar arrays, partition drywalls, and HVAC electrical ducts from DJI drone orthomosaics and 360-degree site cameras.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-300 font-mono">
                  - <strong>Predictive Scheduling Model:</strong> Employs recurrent neural architectures (LSTM) to calculate completion trends, automatically alerting contractors of delays weeks before they materialize.
                </div>
              </div>
            )}

            {selectedTechSection === "bim" && (
              <div className="text-xs text-slate-400 flex flex-col gap-2 leading-relaxed">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" /> Web-Based IFC 3D Visuals
                </span>
                <p>
                  To deliver a robust web-based construction management deck, we parse federated BIM files (IFC standard) into high-performance Three.js buffer geometry. Instead of loading bulky 2GB CAD drawings in the browser, our custom exporter optimizes vertex hierarchies, rendering beautiful color-coded element groupings in real-time.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-300 font-mono">
                  - <strong>Point Cloud Rendering:</strong> Allows seamless overlays of 10-million vertex drone scans directly over the 3D model meshes, highlighting millimeter deviations interactively.
                </div>
              </div>
            )}

            {selectedTechSection === "infra" && (
              <div className="text-xs text-slate-400 flex flex-col gap-2 leading-relaxed">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" /> Python FastAPI + AWS S3 Cluster
                </span>
                <p>
                  The pipeline is powered by a high-throughput Python FastAPI backend. High-resolution orthomosaic drone photographs are broken down into tiles and processed asynchronously using a Celery task pipeline on GPU machines. Metadata, alignment matrices, and bounding coordinate data are stored in a PostgreSQL instance configured with PostGIS spatial extensions.
                </p>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-300 font-mono">
                  - <strong>Indian Edge Infrastructure:</strong> Deployed in AWS Mumbai region to secure ultra-low latency RERA audit lookups and localized CAD file processing conforming to Indian data residency requirements.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
