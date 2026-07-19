import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Gauge,
  Activity,
  AlertTriangle,
  Layers,
  ChevronRight,
  TrendingUp,
  Download,
  Database,
  BarChart4,
  RefreshCw,
  Plus,
  Sliders,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileCode,
  Shield,
  Clock,
  ArrowRight,
  GitCompare,
  SlidersHorizontal,
  Info,
  ExternalLink,
  ChevronDown,
  Monitor,
  Flame,
  Binary
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
  ComposedChart
} from "recharts";

// Interfaces for structured evaluation
export interface ModelMetrics {
  name: string;
  version: string;
  type: string;
  precision: number;
  recall: number;
  f1: number;
  mAP: number;
  iou: number;
  auc: number;
  ece: number; // Expected Calibration Error
  driftScore: number; // PSI score
}

export interface ClassEvaluation {
  className: string;
  support: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  falsePositives: number;
  falseNegatives: number;
}

export interface CurvePoint {
  threshold: number;
  precision: number;
  recall: number;
  tpr: number; // True Positive Rate (Sensitivity)
  fpr: number; // False Positive Rate (1 - Specificity)
  idealCalibration: number;
  actualCalibration: number;
  binConfidence: number;
}

export interface FailureCase {
  id: string;
  imageUrl: string;
  className: string;
  prediction: string;
  confidence: number;
  failureType: "False Positive" | "False Negative";
  rootCause: string;
  remedy: string;
  siteLocation: string;
}

// Initial Model evaluation metrics
const MODELS_EVAL_DATA: ModelMetrics[] = [
  {
    name: "Concrete Crack YOLOv8-Pro",
    version: "v3.2.1",
    type: "Object Detection",
    precision: 0.935,
    recall: 0.912,
    f1: 0.923,
    mAP: 0.918,
    iou: 0.842,
    auc: 0.952,
    ece: 0.024,
    driftScore: 0.082 // Stable
  },
  {
    name: "PPE Compliance YOLOv10-Base",
    version: "v2.0.0",
    type: "Object Detection",
    precision: 0.958,
    recall: 0.942,
    f1: 0.950,
    mAP: 0.941,
    iou: 0.875,
    auc: 0.978,
    ece: 0.015,
    driftScore: 0.125 // Minor Shift
  },
  {
    name: "BIM Structural Segmenter-ViT",
    version: "v1.1.0",
    type: "Semantic Segmentation",
    precision: 0.884,
    recall: 0.861,
    f1: 0.872,
    mAP: 0.865,
    iou: 0.794,
    auc: 0.914,
    ece: 0.048,
    driftScore: 0.285 // High Drift Warning
  }
];

// Per-Class Evaluation Metrics (for default selected model YOLOv8-Pro)
const CLASS_EVALUATION_MAP: Record<string, ClassEvaluation[]> = {
  "Concrete Crack YOLOv8-Pro": [
    { className: "Hairline Crack", support: 1250, precision: 0.94, recall: 0.89, f1: 0.91, accuracy: 0.92, falsePositives: 56, falseNegatives: 138 },
    { className: "Structural Crack", support: 840, precision: 0.96, recall: 0.95, f1: 0.95, accuracy: 0.96, falsePositives: 24, falseNegatives: 42 },
    { className: "Spalling Damage", support: 620, precision: 0.91, recall: 0.88, f1: 0.89, accuracy: 0.90, falsePositives: 38, falseNegatives: 74 },
    { className: "Rebar Exposure", support: 310, precision: 0.97, recall: 0.96, f1: 0.96, accuracy: 0.97, falsePositives: 8, falseNegatives: 12 },
    { className: "Concrete Honeycomb", support: 450, precision: 0.89, recall: 0.87, f1: 0.88, accuracy: 0.88, falsePositives: 46, falseNegatives: 58 }
  ],
  "PPE Compliance YOLOv10-Base": [
    { className: "Safety Helmet", support: 3200, precision: 0.97, recall: 0.96, f1: 0.96, accuracy: 0.97, falsePositives: 42, falseNegatives: 128 },
    { className: "Reflective Vest", support: 3100, precision: 0.98, recall: 0.97, f1: 0.97, accuracy: 0.98, falsePositives: 31, falseNegatives: 93 },
    { className: "Safety Harness", support: 950, precision: 0.92, recall: 0.89, f1: 0.90, accuracy: 0.91, falsePositives: 48, falseNegatives: 104 },
    { className: "Steel Toe Boots", support: 1400, precision: 0.94, recall: 0.91, f1: 0.92, accuracy: 0.93, falsePositives: 72, falseNegatives: 126 },
    { className: "Face Shield", support: 600, precision: 0.88, recall: 0.85, f1: 0.86, accuracy: 0.87, falsePositives: 51, falseNegatives: 90 }
  ],
  "BIM Structural Segmenter-ViT": [
    { className: "Reinforced Column", support: 1100, precision: 0.89, recall: 0.87, f1: 0.88, accuracy: 0.88, falsePositives: 85, falseNegatives: 143 },
    { className: "Concrete Slab", support: 1500, precision: 0.91, recall: 0.88, f1: 0.89, accuracy: 0.90, falsePositives: 74, falseNegatives: 180 },
    { className: "Load-bearing Wall", support: 920, precision: 0.86, recall: 0.84, f1: 0.85, accuracy: 0.85, falsePositives: 112, falseNegatives: 147 },
    { className: "Structural Beam", support: 1200, precision: 0.87, recall: 0.85, f1: 0.86, accuracy: 0.86, falsePositives: 98, falseNegatives: 180 },
    { className: "Retaining Wall", support: 450, precision: 0.82, recall: 0.79, f1: 0.80, accuracy: 0.81, falsePositives: 64, falseNegatives: 95 }
  ]
};

// Confusion Matrices
const CONFUSION_MATRIX_MAP: Record<string, { labels: string[]; matrix: number[][] }> = {
  "Concrete Crack YOLOv8-Pro": {
    labels: ["Hairline", "Structural", "Spalling", "Rebar Exp", "Honeycomb"],
    matrix: [
      [94, 2, 2, 1, 1],
      [1, 96, 1, 1, 1],
      [3, 2, 91, 2, 2],
      [1, 1, 1, 97, 0],
      [4, 2, 3, 2, 89]
    ]
  },
  "PPE Compliance YOLOv10-Base": {
    labels: ["Helmet", "Vest", "Harness", "Boots", "Shield"],
    matrix: [
      [97, 1, 0, 1, 1],
      [1, 98, 0, 1, 0],
      [2, 2, 92, 2, 2],
      [1, 2, 1, 94, 2],
      [3, 2, 4, 3, 88]
    ]
  },
  "BIM Structural Segmenter-ViT": {
    labels: ["Column", "Slab", "Wall", "Beam", "Retaining"],
    matrix: [
      [89, 4, 3, 2, 2],
      [3, 91, 2, 3, 1],
      [5, 3, 86, 4, 2],
      [4, 4, 3, 87, 2],
      [6, 4, 5, 3, 82]
    ]
  }
};

// Simulated curves (ROC, PR, Calibration)
const generateCurveData = (modelName: string): CurvePoint[] => {
  const seed = modelName === "PPE Compliance YOLOv10-Base" ? 0.96 : modelName === "Concrete Crack YOLOv8-Pro" ? 0.92 : 0.86;
  return Array.from({ length: 21 }, (_, index) => {
    const threshold = Number((index * 0.05).toFixed(2));
    
    // Custom mathematical transformations to simulate realistic curves
    const recall = Number((1 - Math.pow(threshold, 2 * seed)).toFixed(3));
    const precision = Number((Math.min(1, seed + (1 - seed) * Math.sin(threshold * Math.PI / 2))).toFixed(3));
    
    const tpr = recall; // True Positive Rate = Recall
    const fpr = Number((Math.pow(1 - threshold, 2.5) * (1 - seed) * 1.5).toFixed(3)); // False Positive Rate
    
    // Calibration Curve metrics
    const idealCalibration = threshold;
    const actualCalibration = Number((threshold * seed + (1 - seed) * 0.5 * Math.sin(threshold * Math.PI)).toFixed(3));
    
    return {
      threshold,
      precision,
      recall,
      tpr,
      fpr,
      idealCalibration,
      actualCalibration,
      binConfidence: threshold
    };
  });
};

// Failure cases visualizer for construction CV
const FAILURE_CASES_DATA: FailureCase[] = [
  {
    id: "fail-001",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=400",
    className: "Structural Crack",
    prediction: "Hairline Crack",
    confidence: 0.84,
    failureType: "False Positive",
    rootCause: "High-contrast shadow overlaying cement joint mimicked structural discontinuity.",
    remedy: "Inject multi-exposure high-dynamic-range (HDR) images into retraining cycles.",
    siteLocation: "Basement Slab B2, Zone F"
  },
  {
    id: "fail-002",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
    className: "Safety Helmet",
    prediction: "Background (None)",
    confidence: 0.42,
    failureType: "False Negative",
    rootCause: "Worker was carrying a large pipe, occluding the safety helmet bounding zone.",
    remedy: "Configure multi-frame temporal consensus filter (voting over 5 contiguous video frames).",
    siteLocation: "Stairwell Block C, Level 4"
  },
  {
    id: "fail-003",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400",
    className: "Spalling Damage",
    prediction: "Dirt Stain",
    confidence: 0.71,
    failureType: "False Negative",
    rootCause: "Surface moisture dark spots blended structural depth gradient, dropping model sensitivity.",
    remedy: "Augment training pipeline with Synthetic moisture/dust contrast-variation transformations.",
    siteLocation: "Exterior Load Wall, West elevation"
  },
  {
    id: "fail-004",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400",
    className: "Safety Helmet",
    prediction: "Baseball Cap",
    confidence: 0.89,
    failureType: "False Positive",
    rootCause: "Sub-contractor hat with reflective material closely matched standard helmet color metrics.",
    remedy: "Integrate specialized high-resolution patch classifier for cap vs. hardhat distinction.",
    siteLocation: "Material Sorting Area, Gate 2"
  }
];

// Model Drift telemetry over 8 historical evaluation checkpoints (Weeks)
const DRIFT_TREND_DATA = [
  { week: "Wk 27", "YOLOv8-Crack-mAP": 0.925, "YOLOv8-Crack-PSI": 0.05, "ViT-BIM-mAP": 0.885, "ViT-BIM-PSI": 0.08 },
  { week: "Wk 28", "YOLOv8-Crack-mAP": 0.922, "YOLOv8-Crack-PSI": 0.06, "ViT-BIM-mAP": 0.880, "ViT-BIM-PSI": 0.12 },
  { week: "Wk 29", "YOLOv8-Crack-mAP": 0.920, "YOLOv8-Crack-PSI": 0.07, "ViT-BIM-mAP": 0.871, "ViT-BIM-PSI": 0.18 },
  { week: "Wk 30", "YOLOv8-Crack-mAP": 0.918, "YOLOv8-Crack-PSI": 0.082, "ViT-BIM-mAP": 0.865, "ViT-BIM-PSI": 0.285 }
];

export default function AIEvaluationDashboard() {
  const [activeTab, setActiveTab] = useState<"performance" | "curves" | "failure" | "drift" | "architecture">("performance");
  const [selectedModelName, setSelectedModelName] = useState<string>("Concrete Crack YOLOv8-Pro");
  
  // Interactive Threshold Sliders for ROC/PR Trade-off
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.50);
  
  // Temperature scaling factor for calibration diagram simulation
  const [temperatureScaling, setTemperatureScaling] = useState<number>(1.0);

  // Failure visual filter
  const [failTypeFilter, setFailTypeFilter] = useState<string>("All");

  // Selected evaluation model object
  const selectedModel = useMemo(() => {
    return MODELS_EVAL_DATA.find(m => m.name === selectedModelName) || MODELS_EVAL_DATA[0];
  }, [selectedModelName]);

  // Derived Curve points for active model
  const curvePoints = useMemo(() => {
    return generateCurveData(selectedModelName);
  }, [selectedModelName]);

  // Interpolated metrics based on selected decision threshold
  const thresholdMetrics = useMemo(() => {
    const targetIdx = Math.min(20, Math.max(0, Math.round(decisionThreshold / 0.05)));
    const pt = curvePoints[targetIdx] || { precision: 0.9, recall: 0.9, tpr: 0.9, fpr: 0.1 };
    
    return {
      precision: pt.precision,
      recall: pt.recall,
      f1: Number(((2 * pt.precision * pt.recall) / (pt.precision + pt.recall || 1)).toFixed(3)),
      tpr: pt.tpr,
      fpr: pt.fpr
    };
  }, [decisionThreshold, curvePoints]);

  // Per-class metrics table
  const perClassMetrics = useMemo(() => {
    return CLASS_EVALUATION_MAP[selectedModelName] || CLASS_EVALUATION_MAP["Concrete Crack YOLOv8-Pro"];
  }, [selectedModelName]);

  // Confusion matrix layout data
  const confusionMatrixData = useMemo(() => {
    return CONFUSION_MATRIX_MAP[selectedModelName] || CONFUSION_MATRIX_MAP["Concrete Crack YOLOv8-Pro"];
  }, [selectedModelName]);

  // Hover Cell State for Confusion Matrix
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);

  // Filtered Failures list
  const filteredFailures = useMemo(() => {
    if (failTypeFilter === "All") return FAILURE_CASES_DATA;
    return FAILURE_CASES_DATA.filter(f => f.failureType === failTypeFilter);
  }, [failTypeFilter]);

  // Drift alarm thresholds
  const driftAlarmTriggered = selectedModel.driftScore > 0.25;

  return (
    <div className="w-full flex flex-col gap-6" id="ai-evaluation-dashboard">
      
      {/* ENTERPRISE TITLE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Gauge className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Enterprise AI Model Evaluation Suite
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                STATISTICAL TESTING v2
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Rigorous model validation pipelines, confidence calibration, spatial fail-case diagnostics, and statistical drift alarms.
            </p>
          </div>
        </div>

        {/* SELECT SYSTEM CONTROLLER */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Model:</span>
          <select
            value={selectedModelName}
            onChange={(e) => setSelectedModelName(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 max-w-[250px] shrink cursor-pointer"
          >
            {MODELS_EVAL_DATA.map(m => (
              <option key={m.name} value={m.name}>{m.name} ({m.version})</option>
            ))}
          </select>
        </div>
      </div>

      {/* THREE-WAY COMPARATIVE TOP LEDGER CARD */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            Comparison Ledger & Performance Indicators
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
            Live Precision Trade-offs Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODELS_EVAL_DATA.map(model => {
            const isActive = model.name === selectedModelName;
            return (
              <div
                key={model.name}
                onClick={() => setSelectedModelName(model.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{model.version} • {model.type}</span>
                    <h3 className="text-xs font-bold text-slate-800 truncate max-w-[170px] mt-0.5">{model.name}</h3>
                  </div>
                  {model.driftScore > 0.25 ? (
                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-mono font-bold px-1.5 py-0.5 animate-pulse">
                      DRIFT ALARM
                    </span>
                  ) : (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-mono font-semibold px-1.5 py-0.5">
                      STABLE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block">F1 Score</span>
                    <span className="text-sm font-bold text-slate-900">{model.f1.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block">mAP@0.5</span>
                    <span className="text-sm font-bold text-indigo-600">{model.mAP.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block">Mean IoU</span>
                    <span className="text-sm font-bold text-slate-900">{model.iou.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRIMARY TABULAR WORKSPACE CONTROLS */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl border border-b-0 border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "performance"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Gauge className="w-4 h-4" />
          Per-Class Accuracy & Confusion Matrix
        </button>
        <button
          onClick={() => setActiveTab("curves")}
          className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "curves"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          ROC, Precision-Recall & Calibration Curves
        </button>
        <button
          onClick={() => setActiveTab("failure")}
          className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "failure"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Diagnostic Failure Analysis (FN / FP)
        </button>
        <button
          onClick={() => setActiveTab("drift")}
          className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "drift"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Model Drift & PSI Tracking
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "architecture"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Production Evaluation Architecture
        </button>
      </div>

      {/* ACTIVE TAB DISPLAY PORTAL */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs min-h-[500px]">
        
        {/* TAB 1: PER-CLASS ACCURACY & CONFUSION MATRIX */}
        {activeTab === "performance" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Categorical Evaluation Metrics</h2>
                <p className="text-[11px] text-slate-500">Fine-grained per-class precision, recall, and exact confusion distributions.</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] text-slate-600 font-semibold">Decision Threshold:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={decisionThreshold}
                  onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
                  className="w-24 accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-indigo-700">{decisionThreshold.toFixed(2)}</span>
              </div>
            </div>

            {/* DYNAMIC KPI GRID FOR DECISION THRESHOLD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Threshold-tuned Precision</span>
                <span className="text-xl font-bold text-indigo-600 font-mono mt-0.5 block">
                  {thresholdMetrics.precision.toFixed(3)}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Derived from confidence boundaries</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Threshold-tuned Recall</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                  {thresholdMetrics.recall.toFixed(3)}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">True Positive sensitivity index</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Balanced F1 Measure</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                  {thresholdMetrics.f1.toFixed(3)}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Harmonic mean of custom settings</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">FPR Rate</span>
                <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
                  {thresholdMetrics.fpr.toFixed(3)}
                </span>
                <span className="text-[9px] text-red-500 font-semibold">False Positive Alarm frequency</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PER-CLASS TABLE (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-violet-500" />
                  Per-Class Validation Matrix
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-[10px] uppercase">
                        <th className="py-2.5 px-3">Target Class</th>
                        <th className="py-2.5 px-3">Support</th>
                        <th className="py-2.5 px-3">Precision</th>
                        <th className="py-2.5 px-3">Recall</th>
                        <th className="py-2.5 px-3">F1-Score</th>
                        <th className="py-2.5 px-3">Accuracy</th>
                        <th className="py-2.5 px-3 text-red-600">FP / FN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {perClassMetrics.map(cls => (
                        <tr key={cls.className} className="hover:bg-slate-50/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{cls.className}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{cls.support.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono font-medium">{(cls.precision * (1.02 - decisionThreshold * 0.04)).toFixed(3)}</td>
                          <td className="py-2.5 px-3 font-mono font-medium">{(cls.recall * (0.98 + (0.5 - decisionThreshold) * 0.06)).toFixed(3)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{cls.f1.toFixed(3)}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{cls.accuracy.toFixed(3)}</td>
                          <td className="py-2.5 px-3 font-mono text-red-500 font-semibold">
                            {cls.falsePositives} / {cls.falseNegatives}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONFUSION MATRIX GRAPHICAL GRID (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Heatmap Confusion Matrix (%)
                  </span>
                  <span className="text-[10px] text-slate-400 italic">Normalized over predictions</span>
                </h3>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                  <div className="w-full grid grid-cols-6 gap-1 text-center font-mono text-[9px] font-bold text-slate-400 mb-1">
                    <div></div>
                    {confusionMatrixData.labels.map(l => (
                      <div key={l} className="truncate" title={l}>{l}</div>
                    ))}
                  </div>

                  {confusionMatrixData.matrix.map((row, rIdx) => (
                    <div key={rIdx} className="w-full grid grid-cols-6 gap-1 text-center items-center h-10">
                      <div className="text-left font-mono text-[9px] font-bold text-slate-400 truncate pr-1" title={confusionMatrixData.labels[rIdx]}>
                        {confusionMatrixData.labels[rIdx]}
                      </div>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        // Color intensity based on value
                        const bgClass = isDiagonal 
                          ? val > 90 ? "bg-indigo-600 text-white" : "bg-indigo-500 text-white"
                          : val > 5 ? "bg-red-200 text-red-900 font-bold" : val > 2 ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-400";

                        return (
                          <div
                            key={cIdx}
                            onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`h-full flex items-center justify-center rounded text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer ${bgClass}`}
                          >
                            {val}%
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* MATRIX DIAGNOSTIC LEGEND */}
                  <div className="w-full flex justify-between items-center mt-4 border-t border-slate-200 pt-2 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded"></span>
                      <span>True Positives</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-200 rounded"></span>
                      <span>Leakage (Crossover)</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {hoveredCell && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 p-2 bg-slate-900 text-slate-100 text-[11px] rounded-lg w-full flex items-center justify-between"
                      >
                        <span className="font-semibold">
                          Ground Truth: <span className="text-violet-400">{confusionMatrixData.labels[hoveredCell.r]}</span>
                        </span>
                        <span>➔</span>
                        <span className="font-semibold">
                          Predicted: <span className="text-indigo-400">{confusionMatrixData.labels[hoveredCell.c]}</span>
                        </span>
                        <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-yellow-400 font-bold">{hoveredCell.val}%</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROC, PR CURVE & CALIBRATION */}
        {activeTab === "curves" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Advanced Diagnostic Evaluation Curves</h2>
                <p className="text-[11px] text-slate-500">
                  Assess trade-offs via ROC curves, Precision-Recall surfaces, and probability reliability diagrams.
                </p>
              </div>

              {/* Temp scaling simulator for calibration diagram */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] text-slate-600 font-semibold">Reliability Temp Scaling (T):</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={temperatureScaling}
                  onChange={(e) => setTemperatureScaling(parseFloat(e.target.value))}
                  className="w-20 accent-amber-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-amber-700">{temperatureScaling.toFixed(1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ROC CURVE PANEL */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Receiver Operating Characteristic (ROC)</h3>
                  <span className="text-[10px] font-mono font-bold text-indigo-600">AUC: {selectedModel.auc.toFixed(3)}</span>
                </div>
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={curvePoints}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="fpr" label={{ value: "False Positive Rate (FPR)", position: "insideBottom", offset: -5, fontSize: 10 }} fontSize={10} />
                      <YAxis label={{ value: "True Positive Rate (TPR)", angle: -90, position: "insideLeft", fontSize: 10 }} fontSize={10} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CurvePoint;
                            return (
                              <div className="bg-slate-900 text-slate-100 p-2 rounded text-[10px] font-mono shadow-md">
                                <div>Threshold: {data.threshold}</div>
                                <div>FPR: {data.fpr}</div>
                                <div className="text-indigo-400 font-bold">TPR (Recall): {data.tpr}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.06} />
                      {/* Random guess diagonal baseline */}
                      <Line type="monotone" dataKey="threshold" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                  Ideal ROC hug top-left. Current TPR/FPR ratio is optimized for safety critical detection.
                </p>
              </div>

              {/* PRECISION-RECALL CURVE PANEL */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Precision-Recall (PR) Curve</h3>
                  <span className="text-[10px] font-mono font-bold text-indigo-600">Avg Prec: {selectedModel.mAP.toFixed(3)}</span>
                </div>
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={curvePoints}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="recall" label={{ value: "Recall (Sensitivity)", position: "insideBottom", offset: -5, fontSize: 10 }} fontSize={10} />
                      <YAxis label={{ value: "Precision", angle: -90, position: "insideLeft", fontSize: 10 }} fontSize={10} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CurvePoint;
                            return (
                              <div className="bg-slate-900 text-slate-100 p-2 rounded text-[10px] font-mono shadow-md">
                                <div>Threshold: {data.threshold}</div>
                                <div className="text-emerald-400 font-bold">Precision: {data.precision}</div>
                                <div>Recall: {data.recall}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                  Optimal threshold of <span className="font-bold text-indigo-600">{decisionThreshold}</span> yields Precision: {thresholdMetrics.precision} & Recall: {thresholdMetrics.recall}.
                </p>
              </div>

              {/* CALIBRATION CURVE (RELIABILITY DIAGRAM) */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Calibration Diagram</h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-600">ECE: {(selectedModel.ece * temperatureScaling).toFixed(3)}</span>
                </div>
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={curvePoints.map(p => ({
                        ...p,
                        // Simulate post-temperature scaling effect on confidence calibration
                        actualCalibration: Number((p.actualCalibration * (1 / temperatureScaling)).toFixed(3))
                      }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="binConfidence" label={{ value: "Mean Predicted Confidence", position: "insideBottom", offset: -5, fontSize: 10 }} fontSize={10} />
                      <YAxis label={{ value: "Observed Accuracy", angle: -90, position: "insideLeft", fontSize: 10 }} fontSize={10} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CurvePoint;
                            return (
                              <div className="bg-slate-900 text-slate-100 p-2 rounded text-[10px] font-mono shadow-md">
                                <div>Bin Confidence: {data.binConfidence}</div>
                                <div>Perfect Accuracy: {data.idealCalibration}</div>
                                <div className="text-amber-400 font-bold">Observed Accuracy: {data.actualCalibration}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="idealCalibration" stroke="#94a3b8" strokeDasharray="3 3" dot={false} name="Ideal" />
                      <Line type="monotone" dataKey="actualCalibration" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 2 }} name="Observed Model" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic text-center">
                  Close to the diagonal indicates perfect probabilistic matching. ECE is minimized when T = 1.0.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: DIAGNOSTIC FAILURE ANALYSIS */}
        {activeTab === "failure" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Diagnostic Edge-Case Diagnostics</h2>
                <p className="text-[11px] text-slate-500">Interactive telemetry profiling False Positives (FP) and False Negatives (FN) to suggest targeted dataset augmentations.</p>
              </div>

              {/* Fail Filter buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {["All", "False Positive", "False Negative"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFailTypeFilter(f)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      failTypeFilter === f
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {f}s
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE FAILURE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFailures.map((item, idx) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
                  
                  {/* Mock image preview with overlay box */}
                  <div className="relative w-full md:w-44 h-44 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-300">
                    <img referrerPolicy="no-referrer" src={item.imageUrl} alt={item.className} className="w-full h-full object-cover opacity-75" />
                    
                    {/* Simulated Annotation box overlays */}
                    <div className={`absolute inset-x-4 inset-y-8 border-2 ${
                      item.failureType === "False Positive" ? "border-red-500 bg-red-500/10" : "border-yellow-500 border-dashed bg-yellow-500/10"
                    } flex items-start p-1`}>
                      <span className={`text-[8px] font-bold text-white px-1 rounded ${
                        item.failureType === "False Positive" ? "bg-red-600" : "bg-yellow-600"
                      }`}>
                        {item.prediction} ({Math.round(item.confidence * 100)}%)
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-[9px] text-white p-1 rounded">
                      📍 {item.siteLocation}
                    </div>
                  </div>

                  {/* Failure descriptions */}
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] uppercase font-extrabold font-mono px-2 py-0.5 rounded border ${
                          item.failureType === "False Positive"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {item.failureType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {item.id}</span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 mt-2">
                        Label Target: <span className="text-indigo-600">{item.className}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        <span className="font-bold text-slate-700">Root Cause:</span> {item.rootCause}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 bg-indigo-50/20 p-2 rounded-lg">
                      <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider block">Recommended Remedy</span>
                      <p className="text-[11px] text-indigo-900 font-medium mt-0.5 leading-snug">{item.remedy}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MODEL DRIFT & PSI TRACKING */}
        {activeTab === "drift" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Telemetry Data & Model Drift Alarms</h2>
                <p className="text-[11px] text-slate-500">
                  Track Population Stability Index (PSI) and feature shift anomalies across successive site camera checkpoint runs.
                </p>
              </div>

              {driftAlarmTriggered && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  Drift Warning: Retraining Sequence Required
                </div>
              )}
            </div>

            {/* DYNAMIC TREND CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>8-Checkpoint Metric Shift Comparison</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">Comparing mAP Validation Decay</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={DRIFT_TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" fontSize={11} />
                      <YAxis yAxisId="left" label={{ value: "mAP Metric Trend", angle: -90, position: "insideLeft", fontSize: 10 }} fontSize={10} domain={[0.8, 1.0]} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: "PSI Drift Score", angle: 90, position: "insideRight", fontSize: 10 }} fontSize={10} domain={[0, 0.4]} />
                      <Tooltip />
                      <Legend fontSize={10} />
                      <Line yAxisId="left" type="monotone" dataKey="YOLOv8-Crack-mAP" stroke="#4f46e5" strokeWidth={2.5} name="YOLOv8 mAP" />
                      <Line yAxisId="left" type="monotone" dataKey="ViT-BIM-mAP" stroke="#ec4899" strokeWidth={2.5} name="ViT BIM mAP" />
                      <Bar yAxisId="right" dataKey="YOLOv8-Crack-PSI" fill="#818cf8" opacity={0.3} name="YOLOv8 PSI Score" />
                      <Bar yAxisId="right" dataKey="ViT-BIM-PSI" fill="#f472b6" opacity={0.3} name="ViT BIM PSI Score" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 items-center justify-center mt-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#4f46e5]"></span>YOLOv8 mAP</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-[#ec4899]"></span>ViT BIM mAP</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#818cf8] opacity-30"></span>YOLOv8 PSI</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f472b6] opacity-30"></span>ViT BIM PSI</span>
                </div>
              </div>

              {/* COVARIATE & CONCEPT DRIFT EXPLANATIONS */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Population Stability index (PSI)
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    PSI measures shift in predicted distribution over baseline. It signals when new construction footage profiles diverge from initial weights.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[10px]">
                    <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
                      <span className="font-bold text-emerald-800 block">PSI &lt; 0.1</span>
                      <span className="text-[8px] text-emerald-600 mt-0.5">Stable</span>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
                      <span className="font-bold text-amber-800 block">0.1 - 0.25</span>
                      <span className="text-[8px] text-amber-600 mt-0.5">Moderate Shift</span>
                    </div>
                    <div className="bg-rose-50 p-1.5 rounded border border-rose-100">
                      <span className="font-bold text-rose-800 block">PSI &gt; 0.25</span>
                      <span className="text-[8px] text-rose-600 mt-0.5">High Shift</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Identified Drift Anomaly Causes</h3>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="p-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-mono font-bold mt-0.5">01</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Covariate Shift (Weather & Seasons)</span>
                        <span className="text-[10px] text-slate-500 block">Monsoon rain & heavy shadows caused 12% pixel contrast distribution shift.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="p-1 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-mono font-bold mt-0.5">02</span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Prior Probability Shift (Phase Transitions)</span>
                        <span className="text-[10px] text-slate-500 block">Structural column pouring shifted to electrical conduit overlays, altering target density.</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTION EVALUATION ARCHITECTURE */}
        {activeTab === "architecture" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Enterprise AI Continuous Evaluation Architecture</h2>
              <p className="text-[11px] text-slate-500">
                System flow, pipelines, schema validation triggers, and policy security specifications.
              </p>
            </div>

            {/* FLOWCHART LAYOUT */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">Automated Evaluation Flow & Orchestrated Drift Mitigation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between items-center shadow-2xs">
                  <span className="p-1.5 bg-violet-100 text-violet-700 rounded-md mb-2"><Database className="w-4 h-4" /></span>
                  <span className="text-xs font-bold text-slate-900 block">1. Data Ingestion & Schema Check</span>
                  <p className="text-[10px] text-slate-400 mt-1">Accepts live camera stream. Checks schema compliance (EXIF meta, contrast, resolution).</p>
                </div>

                <div className="flex items-center justify-center text-slate-300">➔</div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between items-center shadow-2xs">
                  <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md mb-2"><Monitor className="w-4 h-4" /></span>
                  <span className="text-xs font-bold text-slate-900 block">2. Shadow Deployment Run</span>
                  <p className="text-[10px] text-slate-400 mt-1">Feeds frames to both Active and Candidate models in parallel, measuring metrics silently.</p>
                </div>

                <div className="flex items-center justify-center text-slate-300">➔</div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between items-center shadow-2xs">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-md mb-2"><Activity className="w-4 h-4" /></span>
                  <span className="text-xs font-bold text-slate-900 block">3. Statistical Monitoring Node</span>
                  <p className="text-[10px] text-slate-400 mt-1">Calculates real-time AUC, PR curve trade-offs, and PSI drift indexes hourly.</p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-5 border-t border-slate-200/80">
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Security & Data Policy
                  </h4>
                  <ul className="text-[11px] text-slate-500 flex flex-col gap-2 list-disc pl-4 leading-relaxed">
                    <li>Strict adherence to <span className="font-semibold">ISO/IEC 42001 AI Security Standard</span> parameters.</li>
                    <li>Automatic redacting/blurring of non-essential personnel faces inside raw training bounding boxes.</li>
                    <li>Federated model evaluators operating entirely in containerized VPC boundaries.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    Automated Retrain Trigger Policy
                  </h4>
                  <ul className="text-[11px] text-slate-500 flex flex-col gap-2 list-disc pl-4 leading-relaxed">
                    <li>Trigger when <span className="font-semibold">PSI Drift exceeding 0.25</span> over a rolling 72-hour window.</li>
                    <li>Trigger when <span className="font-semibold">IoU / mAP drops &gt; 5%</span> compared to baseline Golden Evaluation set.</li>
                    <li>Auto-pull curated negative samples directly from edge-case pipeline failures.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-slate-700" />
                    Evaluation Orchestration Snippet
                  </h4>
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[9px] overflow-x-auto leading-relaxed max-h-[120px]">
                    <span className="text-violet-400">import</span> eval_engine<br/>
                    <span className="text-slate-400"># Calculate population metrics</span><br/>
                    psi_metric = eval_engine.psi(y_baseline, y_incoming)<br/>
                    <span className="text-yellow-400">if</span> psi_metric &gt;= <span className="text-amber-400">0.25</span>:<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;orchestration.trigger_workflow(<span className="text-emerald-400">"yolo_retrain"</span>)<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;logger.warn(<span className="text-emerald-400">"Model Drift Alarm Activated"</span>)
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
