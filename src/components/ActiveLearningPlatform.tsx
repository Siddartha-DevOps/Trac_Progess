import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Brain,
  Cpu,
  Layers,
  Search,
  Plus,
  Download,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  RefreshCw,
  Trash2,
  Calendar,
  Sparkles,
  Users,
  SlidersHorizontal,
  Target,
  TrendingUp,
  BarChart2,
  PieChart,
  Grid,
  List,
  Flame,
  Sliders,
  UserCheck,
  Play,
  ArrowRight,
  Shield,
  FileCode,
  Settings,
  HelpCircle,
  GitBranch,
  Zap,
  Check,
  X,
  ChevronRight,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from "recharts";

// TypeScript Interfaces for Active Learning Entities
interface UnlabeledImage {
  id: string;
  filename: string;
  captureTime: string;
  confidenceScore: number; // 0.0 - 1.0
  entropyScore: number;    // uncertainty metric (higher = more uncertain)
  diversityScore: number;  // spatial/embedding uniqueness score (higher = more unique)
  outlierFactor: number;   // anomaly factor (0.0 - 100.0)
  predictedClass: string;
  imageUrl: string;
  assignedTo: string | null;
  priorityScore: number;   // calculated dynamic rank score
  samplingReason: string;  // e.g. "Low Margin", "High Entropy", "Outlier Cluster"
  status: "unlabeled" | "in_queue" | "annotated";
}

interface ModelVersion {
  version: string;
  status: "production" | "candidate" | "deprecated";
  mapMetric: number; // mAP@0.5:0.95
  iouMetric: number;
  unlabeledScanned: number;
  retrainedOn: string;
  epochsRun: number;
}

export default function ActiveLearningPlatform() {
  // Navigation tabs for the Active Learning Suite
  const [activeTab, setActiveTab] = useState<"dashboard" | "sampling" | "queue" | "training" | "specifications">("dashboard");
  
  // Sampling config states
  const [samplingStrategy, setSamplingStrategy] = useState<"uncertainty" | "entropy" | "diversity" | "representative" | "outliers" | "hard-examples">("uncertainty");
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [entropyThreshold, setEntropyThreshold] = useState<number>(0.75);
  const [diversityWeight, setDiversityWeight] = useState<number>(50); // percentage weight
  const [outlierThreshold, setOutlierThreshold] = useState<number>(80); // percentile
  
  // Simulated DB state for Unlabeled pool / Priority queue
  const [images, setImages] = useState<UnlabeledImage[]>([
    {
      id: "al-img-201",
      filename: "Site_L2_North_Wall_C012.png",
      captureTime: "2026-07-19 04:12",
      confidenceScore: 0.38,
      entropyScore: 0.91,
      diversityScore: 0.88,
      outlierFactor: 84.5,
      predictedClass: "Reinforcement Steel (IfcRebar)",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      assignedTo: null,
      priorityScore: 94.2,
      samplingReason: "Least Confident + High Entropy",
      status: "unlabeled"
    },
    {
      id: "al-img-202",
      filename: "BIM_Mismatched_HVAC_S004.png",
      captureTime: "2026-07-19 03:45",
      confidenceScore: 0.45,
      entropyScore: 0.86,
      diversityScore: 0.94,
      outlierFactor: 92.1,
      predictedClass: "Duct segment (IfcDuctSegment)",
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&auto=format&fit=crop&q=80",
      assignedTo: "Sarah Jenkins (L2)",
      priorityScore: 91.8,
      samplingReason: "Severe Spatial Embedding Outlier",
      status: "in_queue"
    },
    {
      id: "al-img-203",
      filename: "Slab_Edge_Pour_L01_E082.png",
      captureTime: "2026-07-18 22:11",
      confidenceScore: 0.52,
      entropyScore: 0.78,
      diversityScore: 0.61,
      outlierFactor: 42.0,
      predictedClass: "Concrete Slab (IfcSlab)",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80",
      assignedTo: null,
      priorityScore: 78.5,
      samplingReason: "Uncertainty Margin Overlap",
      status: "unlabeled"
    },
    {
      id: "al-img-204",
      filename: "Scaffolding_Overload_Gate3.png",
      captureTime: "2026-07-18 19:30",
      confidenceScore: 0.31,
      entropyScore: 0.95,
      diversityScore: 0.73,
      outlierFactor: 76.2,
      predictedClass: "Safety Railing (IfcRailing)",
      imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80",
      assignedTo: "Alex Chen (L3)",
      priorityScore: 96.4,
      samplingReason: "Hard Negative - Scaffold Flicker",
      status: "in_queue"
    },
    {
      id: "al-img-205",
      filename: "Column_Joint_Pouring_L03_Col02.png",
      captureTime: "2026-07-18 15:40",
      confidenceScore: 0.59,
      entropyScore: 0.64,
      diversityScore: 0.52,
      outlierFactor: 38.4,
      predictedClass: "Concrete Column (IfcColumn)",
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&auto=format&fit=crop&q=80",
      assignedTo: null,
      priorityScore: 65.2,
      samplingReason: "Representative Diversity Gap",
      status: "unlabeled"
    },
    {
      id: "al-img-206",
      filename: "Drywall_Insulation_L02_W11.png",
      captureTime: "2026-07-18 11:20",
      confidenceScore: 0.88,
      entropyScore: 0.22,
      diversityScore: 0.35,
      outlierFactor: 12.5,
      predictedClass: "Drywall Wall (IfcWall)",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      assignedTo: null,
      priorityScore: 18.0,
      samplingReason: "Default Prediction Baseline",
      status: "unlabeled"
    }
  ]);

  // Model Retraining states
  const [isRetraining, setIsRetraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentLoss, setCurrentLoss] = useState<number>(0.42);
  const [currentMap, setCurrentMap] = useState<number>(78.4);
  const [hyperparameters, setHyperparameters] = useState({
    epochs: 45,
    learningRate: 0.001,
    batchSize: 16,
    optimizer: "AdamW",
    weightsBaseline: "BIM-ResNet101-COCO"
  });

  // Model Versions history
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([
    { version: "v2.4-stable", status: "production", mapMetric: 82.5, iouMetric: 79.1, unlabeledScanned: 14200, retrainedOn: "2026-07-12", epochsRun: 50 },
    { version: "v2.5-rc1", status: "candidate", mapMetric: 84.1, iouMetric: 81.3, unlabeledScanned: 18400, retrainedOn: "2026-07-18", epochsRun: 45 },
    { version: "v2.3-legacy", status: "deprecated", mapMetric: 76.8, iouMetric: 71.4, unlabeledScanned: 9200, retrainedOn: "2026-06-25", epochsRun: 30 }
  ]);

  // Production Spec tab states
  const [specSubTab, setSpecSubTab] = useState<"architecture" | "database" | "apis" | "workers" | "prompts">("architecture");

  // Filter and calculate images based on confidence slider
  const lowConfidenceCount = images.filter((img) => img.confidenceScore < confidenceThreshold).length;
  const inQueueCount = images.filter((img) => img.status === "in_queue").length;
  const unlabeledPoolCount = images.filter((img) => img.status === "unlabeled").length;

  // Real-time confidence spectrum distribution chart data
  const distributionData = [
    { range: "0.0-0.2", count: images.filter(img => img.confidenceScore < 0.2).length + 1, name: "Severe Uncertainty" },
    { range: "0.2-0.4", count: images.filter(img => img.confidenceScore >= 0.2 && img.confidenceScore < 0.4).length + 3, name: "Active Sampling" },
    { range: "0.4-0.6", count: images.filter(img => img.confidenceScore >= 0.4 && img.confidenceScore < 0.6).length + 4, name: "Boundary Decors" },
    { range: "0.6-0.8", count: images.filter(img => img.confidenceScore >= 0.6 && img.confidenceScore < 0.8).length + 6, name: "Moderate Conf" },
    { range: "0.8-1.0", count: images.filter(img => img.confidenceScore >= 0.8).length + 8, name: "Automated Hold" }
  ];

  // Live Loss Curve visual
  const lossCurveData = [
    { epoch: 1, loss: 0.85, mAP: 52.4 },
    { epoch: 10, loss: 0.62, mAP: 64.1 },
    { epoch: 20, loss: 0.48, mAP: 71.8 },
    { epoch: 30, loss: 0.39, mAP: 76.5 },
    { epoch: 40, loss: 0.32, mAP: 81.2 },
    { epoch: hyperparameters.epochs, loss: currentLoss, mAP: currentMap }
  ];

  // Handles adding an unlabeled item dynamically to the Priority Queue
  const handleAddToQueue = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: "in_queue" } : img))
    );
  };

  // Handles auto-prioritizing the pool based on threshold triggers
  const handleAutoTriggerPrioritization = () => {
    setImages((prev) =>
      prev.map((img) => {
        // Automatically queue items matching selected sampling metric thresholds
        const shouldQueue =
          img.confidenceScore < confidenceThreshold ||
          img.entropyScore > entropyThreshold ||
          img.outlierFactor > outlierThreshold;
        return shouldQueue ? { ...img, status: "in_queue" as const } : img;
      })
    );
    alert("Active Learning sampler finished. Low confidence & high-entropy images committed to Priority Queue!");
  };

  // Handlers for simulated retraining trigger
  const triggerRetraining = () => {
    setIsRetraining(true);
    setTrainingProgress(0);
    setCurrentLoss(0.72);
    setCurrentMap(65.0);
  };

  useEffect(() => {
    let timer: any;
    if (isRetraining) {
      timer = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsRetraining(false);
            // Push new version to state
            const newVersionNum = `v2.5-rc${modelVersions.length + 1}`;
            const newVer: ModelVersion = {
              version: newVersionNum,
              status: "candidate",
              mapMetric: 85.8,
              iouMetric: 82.1,
              unlabeledScanned: 24200,
              retrainedOn: "Just now",
              epochsRun: hyperparameters.epochs
            };
            setModelVersions([newVer, ...modelVersions]);
            alert(`Model Retraining Completed successfully! Candidate ${newVersionNum} registered with 85.8% mAP.`);
            return 100;
          }
          // Dynamic simulation values
          setCurrentLoss((loss) => Math.max(0.18, Number((loss - 0.045).toFixed(3))));
          setCurrentMap((map) => Math.min(88.5, Number((map + 1.25).toFixed(1))));
          return prev + 10;
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isRetraining]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="active-learning-platform">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Enterprise Active Learning & Hard Example Mining Hub</h2>
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">LoopEngine Production</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Continuous MLOps active loop. Mine boundary uncertainties, out-of-distribution outliers, and automatic label queue generation synced with model endpoints.</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: "dashboard", label: "Loop Dashboard", icon: BarChart2 },
            { id: "sampling", label: "Mining Stratum", icon: SlidersHorizontal },
            { id: "queue", label: "Annotation & Priority Queues", icon: Flame },
            { id: "training", label: "Model Retraining Pipeline", icon: Cpu },
            { id: "specifications", label: "System Specifications", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD METRICS & SPECTRUM */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Loop Status KPIs (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
                    <Database className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">Unlabeled Image Reservoir</span>
                  <span className="text-3xl font-extrabold font-mono text-white mt-1">48,204 <span className="text-xs font-normal text-slate-500">imgs</span></span>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Raw telemetry ingested continuously from Reality Capture, LIDAR feeds, and camera sequences awaiting model uncertainty scanning.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
                    <Flame className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Active Annotation Queue</span>
                  <span className="text-3xl font-extrabold font-mono text-indigo-400 mt-1">{inQueueCount} <span className="text-xs font-normal text-slate-500">mining tasks</span></span>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Prioritized hard-examples queued up for expert review. Automatically sorted by highest active sampling value.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
                    <TrendingUp className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Estimated Loop Efficiency Gain</span>
                  <span className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">4.2x <span className="text-xs font-normal text-slate-500">label savings</span></span>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Active Learning selects only the boundary points that maximize model loss information backpropagation. Replaces random labeling completely.
                  </p>
                </div>
              </div>

              {/* Real-time confidence spectrum distribution chart & dynamic confidence threshold filter (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span>Interactive Inference Confidence Spectrum & Mining Thresholds</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Model inferences falling inside target uncertainty ranges are dynamically selected for priority annotations.</p>
                  </div>
                  <button 
                    onClick={handleAutoTriggerPrioritization}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Run Sampler Queueing</span>
                  </button>
                </div>

                {/* Inference distribution chart */}
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="range" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }}
                        labelStyle={{ color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}
                      />
                      <Bar dataKey="count" fill="url(#blueGradient)" radius={[4, 4, 0, 0]}>
                        <defs>
                          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sliding controls panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Low-Confidence Uncertainty Boundary:</span>
                      <span className="text-indigo-400 font-bold">{confidenceThreshold * 100}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.30" 
                      max="0.85" 
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono">
                      *Scan for prediction confidence limits below {confidenceThreshold}. Encompasses {lowConfidenceCount} matching images.
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Entropy Information Threshold:</span>
                      <span className="text-emerald-400 font-bold">{(entropyThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.40" 
                      max="0.95" 
                      step="0.05"
                      value={entropyThreshold}
                      onChange={(e) => setEntropyThreshold(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono">
                      *Identify boundary samples with multi-class distribution entropy exceeding {entropyThreshold}.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACTIVE MINING STRATEGIES */}
          {activeTab === "sampling" && (
            <motion.div
              key="sampling"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Sampling Strategy Chooser (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Loop Strategies</span>
                </h3>

                {[
                  { id: "uncertainty", label: "Uncertainty Sampling", desc: "Select items near boundary margins with highest confusion probability across class logits." },
                  { id: "entropy", label: "Entropy Sampling", desc: "Target high Shannon entropy vectors representing flat prediction density spreads." },
                  { id: "diversity", label: "Diversity Sampling", desc: "Compute cosine distances of latent space embeddings to select diverse, non-redundant scenes." },
                  { id: "representative", label: "Representative Sampling", desc: "Weight items by spatial cluster density maps to capture true structural population modes." },
                  { id: "outliers", label: "Outlier Detection", desc: "Identify high reconstruction error anomalies or distant centroids indicative of novel objects." },
                  { id: "hard-examples", label: "Hard Example Mining", desc: "Capture high loss vectors, Grad-CAM attention edge cases, and temporal coordinate flickers." }
                ].map((strat) => (
                  <button
                    key={strat.id}
                    onClick={() => setSamplingStrategy(strat.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      samplingStrategy === strat.id
                        ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{strat.label}</span>
                      {samplingStrategy === strat.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">{strat.desc}</p>
                  </button>
                ))}
              </div>

              {/* Right Column: Interactive sampling playground visualization & simulated clustering map (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span>Active Stratum Latent-Space Embedding Clusters</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Algorithm: TSNE-Projection + K-Means</span>
                </div>

                {/* Simulated Interactive Cluster Plot */}
                <div className="h-64 rounded-xl bg-slate-950 relative overflow-hidden border border-slate-850 flex items-center justify-center">
                  <div className="absolute top-3 left-3 bg-slate-900/80 p-2 rounded text-[8px] font-mono border border-slate-850 z-10 flex flex-col gap-0.5">
                    <span className="text-white font-bold uppercase">Embedding Cluster Mapping</span>
                    <span>● BLUE: High Confidence (Automated Ingest)</span>
                    <span className="text-amber-400">● AMBER: Low Confidence Boundary (Sample candidates)</span>
                    <span className="text-emerald-400">● GREEN: High Outlier Latent Density</span>
                  </div>

                  <svg className="w-full h-full absolute inset-0">
                    <line x1="10%" y1="50%" x2="90%" y2="50%" className="stroke-slate-900 stroke-1" />
                    <line x1="50%" y1="10%" x2="50%" y2="90%" className="stroke-slate-900 stroke-1" />

                    {/* Generate mock embedding nodes scattered */}
                    {Array.from({ length: 45 }).map((_, i) => {
                      const angle = (i / 45) * Math.PI * 2;
                      const rad = (i % 3 === 0 ? 30 : i % 3 === 1 ? 75 : 120) + Math.sin(angle) * 15;
                      const cx = 50 + (Math.cos(angle) * rad) / 6;
                      const cy = 50 + (Math.sin(angle) * rad) / 4;
                      
                      const type = i % 3 === 0 ? "high" : i % 3 === 1 ? "boundary" : "outlier";
                      const color = type === "high" 
                        ? "fill-indigo-600/40 hover:fill-indigo-400" 
                        : type === "boundary"
                        ? "fill-amber-500 hover:fill-amber-300 animate-pulse" 
                        : "fill-emerald-500/60 hover:fill-emerald-400";

                      return (
                        <circle 
                          key={i} 
                          cx={`${cx}%`} 
                          cy={`${cy}%`} 
                          r={type === "boundary" ? "5" : "3.5"} 
                          className={`${color} cursor-pointer transition-all`}
                        />
                      );
                    })}
                  </svg>

                  <div className="absolute bottom-3 right-3 bg-indigo-900/40 border border-indigo-500/20 rounded p-1.5 text-[9px] font-mono text-indigo-300">
                    Active selection highlighted with red bounds.
                  </div>
                </div>

                {/* Strategy configuration controllers details */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase block">Stratum Parametric Toggles</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400">Diversity Weights:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="10" 
                          max="90" 
                          value={diversityWeight}
                          onChange={(e) => setDiversityWeight(Number(e.target.value))}
                          className="flex-1 accent-indigo-500" 
                        />
                        <span className="text-white font-bold">{diversityWeight}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400">Outlier Percentile:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="50" 
                          max="95" 
                          value={outlierThreshold}
                          onChange={(e) => setOutlierThreshold(Number(e.target.value))}
                          className="flex-1 accent-emerald-500" 
                        />
                        <span className="text-white font-bold">{outlierThreshold}th</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400">Samplers Pipeline:</span>
                      <div className="flex items-center text-slate-300 text-[11px]">
                        <span className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 font-bold uppercase text-emerald-400">GPU-Accelerated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ANNOTATION QUEUES & PRIORITY ASSIGNMENT */}
          {activeTab === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Loop Queue Controls header */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-indigo-400" />
                    <span>Dynamic Priority Queue & Expert Human Assignment</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">High priority tasks mapped dynamically to the expert annotator workforce matching expertise grades (L1, L2, L3, Principal).</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={handleAutoTriggerPrioritization}
                    className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Auto-Prioritize Queue
                  </button>
                </div>
              </div>

              {/* Priority Image List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img) => (
                  <div key={img.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative group">
                    
                    {/* Visual Priority ribbon indicator */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full uppercase shadow-md ${
                        img.priorityScore > 90 
                          ? "bg-rose-950/85 border border-rose-500/40 text-rose-400" 
                          : img.priorityScore > 70
                          ? "bg-amber-950/85 border border-amber-500/40 text-amber-400"
                          : "bg-slate-950/85 border border-slate-800 text-slate-400"
                      }`}>
                        Priority Score: {img.priorityScore}%
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded shadow ${
                        img.status === "in_queue" ? "bg-emerald-600 text-white" : "bg-slate-950/80 text-slate-400"
                      }`}>
                        {img.status === "in_queue" ? "QUEUED (Active)" : "UNASSIGNED"}
                      </span>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="h-40 relative bg-slate-950 overflow-hidden">
                      <img 
                        src={img.imageUrl} 
                        alt={img.filename} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                      
                      <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono">{img.id}</span>
                        <strong className="text-white text-xs block truncate mt-0.5">{img.filename}</strong>
                      </div>
                    </div>

                    {/* Detailed sampling metrics metrics */}
                    <div className="p-4 flex flex-col gap-3 flex-1 bg-slate-900">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-slate-950 p-2 rounded border border-slate-850">
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[8px] uppercase">Conf</span>
                          <span className={`font-bold ${img.confidenceScore < 0.5 ? "text-rose-400" : "text-slate-300"}`}>
                            {img.confidenceScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[8px] uppercase">Entropy</span>
                          <span className={`font-bold ${img.entropyScore > 0.8 ? "text-rose-400" : "text-slate-300"}`}>
                            {img.entropyScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 text-[8px] uppercase">Outlier</span>
                          <span className="font-bold text-slate-300">{img.outlierFactor.toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sampling Reason:</span>
                          <span className="text-indigo-400 font-bold font-mono">{img.samplingReason}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prediction Box:</span>
                          <span className="text-white truncate max-w-[140px]">{img.predictedClass}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-slate-500">Assignee:</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span className="text-slate-300 font-bold">{img.assignedTo || "Auto Queue Match"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Assignment controls */}
                      <div className="mt-2 pt-2 border-t border-slate-800 flex gap-2">
                        {img.status !== "in_queue" ? (
                          <button 
                            onClick={() => handleAddToQueue(img.id)}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono rounded uppercase flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Queue for human edit</span>
                          </button>
                        ) : (
                          <div className="flex-1 py-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-center font-bold text-[10px] font-mono rounded uppercase flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Assigned & Active</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => {
                            // Assign manually
                            const annotators = ["Sarah Jenkins (L2)", "Alex Chen (L3)", "Clara Mercer (Senior)"];
                            const randomAnnotator = annotators[Math.floor(Math.random() * annotators.length)];
                            setImages(prev => prev.map(item => item.id === img.id ? { ...item, assignedTo: randomAnnotator, status: "in_queue" } : item));
                            alert(`Manually routed task to senior expert ${randomAnnotator}!`);
                          }}
                          className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-slate-300 cursor-pointer"
                          title="Change Expert Assignee"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SIMULATED RETRAINING PIPELINE & VERSION CONTROLS */}
          {activeTab === "training" && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Hyperparameter Settings & Retrain action (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Loop Retraining Parameters</span>
                </h3>

                <p className="text-[11px] text-slate-400">
                  Select epochs run scale, target learning weights and loss backprop threshold to fine-tune the YOLOv8 or ResNet detector.
                </p>

                <div className="flex flex-col gap-3 font-mono text-[10px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500">Epochs Count:</span>
                    <input 
                      type="number" 
                      value={hyperparameters.epochs}
                      onChange={(e) => setHyperparameters({ ...hyperparameters, epochs: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-850 rounded p-2 text-white font-bold" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500">Learning Rate:</span>
                    <select 
                      value={hyperparameters.learningRate}
                      onChange={(e) => setHyperparameters({ ...hyperparameters, learningRate: Number(e.target.value) })}
                      className="bg-slate-950 border border-slate-850 rounded p-2 text-white font-bold"
                    >
                      <option value="0.001">0.001 (Recommended)</option>
                      <option value="0.0001">0.0001 (Fine-tune)</option>
                      <option value="0.005">0.005 (Coarse)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500">Weights Baseline:</span>
                    <select 
                      value={hyperparameters.weightsBaseline}
                      onChange={(e) => setHyperparameters({ ...hyperparameters, weightsBaseline: e.target.value })}
                      className="bg-slate-950 border border-slate-850 rounded p-2 text-white font-bold"
                    >
                      <option value="BIM-ResNet101-COCO">BIM-ResNet101-COCO</option>
                      <option value="YOLOv8-ConcreteLarge">YOLOv8-ConcreteLarge</option>
                      <option value="InternImage-3D-Pointcloud">InternImage-3D-Pointcloud</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={triggerRetraining}
                  disabled={isRetraining}
                  className={`mt-2 p-3 font-bold text-xs rounded-lg uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isRetraining 
                      ? "bg-slate-800 text-slate-500 border border-slate-700" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md font-extrabold"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRetraining ? "animate-spin" : ""}`} />
                  <span>{isRetraining ? `Retraining Progress: ${trainingProgress}%` : "Deploy Retraining Event"}</span>
                </button>
              </div>

              {/* Training Progress Loss Curve plots (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-400" />
                      <span>Live Backpropagation Loss & mAP Accuracy Curves</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Simulated metrics of GPU training validation performance inside the production training server.</p>
                  </div>

                  {isRetraining && (
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse uppercase">
                      RUNNING TRAIN EVENT...
                    </span>
                  )}
                </div>

                {/* Progress bar container */}
                {isRetraining && (
                  <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Epoch {Math.round((trainingProgress / 100) * hyperparameters.epochs)} of {hyperparameters.epochs}</span>
                      <span className="text-indigo-400 font-bold">{trainingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${trainingProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Training Chart curves */}
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} fontFamily="monospace" label={{ value: "Epochs scale", position: "insideBottom", offset: -5 }} />
                      <YAxis yAxisId="left" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                      <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155" }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" name="Cross-Entropy Loss" strokeWidth={2} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="mAP" stroke="#10b981" name="mAP@0.5:0.95" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Registered model versions registry */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Model Version Control Registry</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[10px]">
                    {modelVersions.map((ver, index) => (
                      <div key={index} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-white text-xs">{ver.version}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase ${
                            ver.status === "production" 
                              ? "bg-emerald-950/60 border border-emerald-500/20 text-emerald-400" 
                              : ver.status === "candidate"
                              ? "bg-indigo-950/60 border border-indigo-500/20 text-indigo-400"
                              : "bg-slate-900 border border-slate-800 text-slate-500"
                          }`}>
                            {ver.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Validation mAP:</span>
                          <strong className="text-white">{ver.mapMetric}%</strong>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Images Scanned:</span>
                          <strong className="text-white">{ver.unlabeledScanned}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ENTERPRISE ARCHITECTURE, APIs, DATABASE, AND PROMPTS */}
          {activeTab === "specifications" && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Code Panel Switcher Header */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto self-start">
                {[
                  { id: "architecture", label: "Loop Architecture" },
                  { id: "database", label: "PostgreSQL Schema (Drizzle)" },
                  { id: "apis", label: "FastAPI Endpoint Routes" },
                  { id: "workers", label: "Celery Loop Workers" },
                  { id: "prompts", label: "Claude Code Prompts" }
                ].map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => setSpecSubTab(spec.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      specSubTab === spec.id 
                        ? "bg-indigo-600 text-white font-extrabold" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>

              {/* RENDER SPEC PANEL */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex flex-col gap-4">
                
                {/* 1. Loop Architecture overview */}
                {specSubTab === "architecture" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        LoopEngine production Active Learning Topology
                      </h4>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">LoopEngine v1.0</span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This production architecture uses a continuous, event-driven backprop pipeline. Low confidence predictions from the main inference engine are sent directly to Redis queues, triggering the sampler scheduler. Matches are packaged as human tasks, review-approved, and written to training splits.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <strong className="text-indigo-400 block mb-1">1. Ingest & Predict</strong>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          YOLOv8 / ResNet pipelines output bbox logits and latent vector arrays, pushing raw inference payloads directly to Cloud Storage and PostgreSQL.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <strong className="text-indigo-400 block mb-1">2. Active Learning Sampler</strong>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          Celery workers run uncertainty, entropy, and cosine-distance clustering algorithms on embeddings to flag priority samples.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                        <strong className="text-indigo-400 block mb-1">3. Human Review & Training</strong>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          Quality reviewers approve bbox edits, triggering automatic training jobs in PyTorch Core to update production checkpoints.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Drizzle PostgreSQL database structure */}
                {specSubTab === "database" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        Drizzle Schema Declarations for Active Learning Tables
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">schema.ts</span>
                    </div>

                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-72 select-all leading-normal">
{`import { pgTable, uuid, varchar, doublePrecision, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// Raw inference predictions tracking
export const inferences = pgTable("inferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: varchar("image_id", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 1024 }).notNull(),
  predictedClass: varchar("predicted_class", { length: 255 }).notNull(),
  confidence: doublePrecision("confidence").notNull(),
  entropy: doublePrecision("entropy").notNull(),
  diversityScore: doublePrecision("diversity_score"),
  outlierFactor: doublePrecision("outlier_factor"),
  status: varchar("status", { length: 50 }).default("unlabeled"), // unlabeled, in_queue, annotated
  createdAt: timestamp("created_at").defaultNow(),
});

// Priority Annotation Queue
export const priorityQueue = pgTable("priority_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  inferenceId: uuid("inference_id").references(() => inferences.id),
  priorityScore: doublePrecision("priority_score").notNull(),
  samplingReason: varchar("sampling_reason", { length: 255 }).notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  annotatorGrade: varchar("annotator_grade", { length: 20 }).default("L2"), // L1, L2, L3, Principal
  qualityScore: doublePrecision("quality_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Retraining Experiments logs
export const retrainingEvents = pgTable("retraining_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: varchar("version", { length: 50 }).notNull(),
  epochsRun: integer("epochs_run").notNull(),
  learningRate: doublePrecision("learning_rate").notNull(),
  weightsBaseline: varchar("weights_baseline", { length: 255 }).notNull(),
  finalLoss: doublePrecision("final_loss").notNull(),
  finalMap: doublePrecision("final_map").notNull(),
  status: varchar("status", { length: 50 }).default("candidate"),
  completedAt: timestamp("completed_at").defaultNow(),
});`}
                    </pre>
                  </div>
                )}

                {/* 3. FastAPI route handlers code */}
                {specSubTab === "apis" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        FastAPI Loop Ingestion & Active Sampler Router
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">main.py</span>
                    </div>

                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-72 select-all leading-normal">
{`from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="LoopEngine Active Learning API")

class InferencePayload(BaseModel):
    image_id: str
    image_url: str
    predicted_class: str
    confidence: float
    entropy: float
    embedding_vector: List[float]

@app.post("/api/inferences/ingest")
async def ingest_inference(payload: InferencePayload, background_tasks: BackgroundTasks):
    # Log raw inference prediction to database
    # Trigger background outlier and entropy evaluation
    background_tasks.add_task(evaluate_active_learning_score, payload)
    return {"status": "ok", "message": "Inference payload queued for active learning evaluation."}

async def evaluate_active_learning_score(payload: InferencePayload):
    # Calculate margin bounds and check clustering distances
    confidence = payload.confidence
    entropy = payload.entropy
    
    # Uncertainty margin sampling condition
    if confidence < 0.65 or entropy > 0.75:
        # Pushes dynamically to Redis Priority Queue
        enqueue_for_expert_labeling(payload)

def enqueue_for_expert_labeling(payload: InferencePayload):
    # Trigger priority queue record insertion
    print(f"COMMITTED to human review loop: {payload.image_id} (Uncertainty high)")`}
                    </pre>
                  </div>
                )}

                {/* 4. Celery background workers tasks */}
                {specSubTab === "workers" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        Celery Embedding Clustering & Hard Example Mining Task
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">tasks.py</span>
                    </div>

                    <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-[10px] font-mono text-amber-300 overflow-x-auto max-h-72 select-all leading-normal">
{`from celery import Celery
from sklearn.cluster import KMeans
import numpy as np

celery_app = Celery("loop_tasks", broker="redis://localhost:6379/0")

@celery_app.task(name="tasks.compute_diversity_sampling")
def compute_diversity_sampling(embedding_list: list, k_clusters: int = 10):
    """
    Computes K-Means clustering centers on vector embeddings.
    Selects cluster centroids (representatives) and edge outliers for the active loop.
    """
    embeddings = np.array(embedding_list)
    kmeans = KMeans(n_clusters=k_clusters, random_state=42)
    kmeans.fit(embeddings)
    
    # Calculate distance from each point to its cluster centroid
    centroids = kmeans.cluster_centers_
    selected_indices = []
    
    for i in range(k_clusters):
        cluster_points_idx = np.where(kmeans.labels_ == i)[0]
        if len(cluster_points_idx) == 0:
            continue
        # Get point closest to centroid (Representative Sampling)
        distances = np.linalg.norm(embeddings[cluster_points_idx] - centroids[i], axis=1)
        closest_idx = cluster_points_idx[np.argmin(distances)]
        selected_indices.append(int(closest_idx))
        
        # Get furthest point (Outlier Mining)
        furthest_idx = cluster_points_idx[np.argmax(distances)]
        selected_indices.append(int(furthest_idx))
        
    return {"sampled_image_indices": selected_indices}`}
                    </pre>
                  </div>
                )}

                {/* 5. Claude AI Code Generation Prompts */}
                {specSubTab === "prompts" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        Expert Prompts for AI-Driven Loop Automation
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">prompts.json</span>
                    </div>

                    <p className="text-slate-400 text-xs">
                      Copy these custom prompts to configure AI agents (like Claude or Gemini) to write backprop code, evaluate labeling metrics, or debug PyTorch training baseline performance.
                    </p>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 text-xs text-indigo-200 font-mono flex flex-col gap-1 select-all">
                      <strong className="text-white">Hard-Example Mining Prompt:</strong>
                      <p className="text-[10px] text-slate-400 mt-1">
                        "Write a PyTorch training hook that monitors custom cross-entropy loss values for a ResNet101 multi-label object detector. Identify the batch items representing the top 5% highest loss values ('hard examples'), serialize their raw coordinate bounding boxes, and generate a secure REST JSON payload to push them to an external PostgreSQL / FastAPI Active Learning pipeline."
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
