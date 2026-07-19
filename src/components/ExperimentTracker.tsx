import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Cpu,
  History,
  FileCode,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Sliders,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  Layers,
  Database,
  BarChart4,
  Clock,
  ExternalLink,
  ChevronDown,
  Gauge,
  FolderOpen,
  FileText,
  Lock,
  Flame,
  Check
} from "lucide-react";
import {
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
  ZAxis
} from "recharts";

// TypeScript interfaces
export interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: string;
  backbone: string;
  weightDecay: number;
  dropout: number;
  augmentation: string;
}

export interface DatasetMeta {
  name: string;
  size: number;
  split: string;
  version: string;
  classes: string[];
}

export interface Metrics {
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  mAP: number;
  iou: number;
}

export interface SystemMetrics {
  gpuUtil: number;
  gpuTemp: number;
  gpuVram: number; // in GB
  cpuUtil: number;
  ramUsage: number; // in GB
}

export interface EpochRecord {
  epoch: number;
  loss: number;
  valLoss: number;
  accuracy: number;
  valAccuracy: number;
  mAP: number;
  iou: number;
  gpuTemp: number;
  gpuVram: number;
  gpuUtil: number;
}

export interface TrainingRun {
  id: string;
  name: string;
  experimentName: string;
  status: "Running" | "Finished" | "Failed";
  startedBy: string;
  startTime: string;
  duration: string;
  hyperparameters: Hyperparameters;
  dataset: DatasetMeta;
  metrics: Metrics;
  systemMetrics: SystemMetrics;
  epochHistory: EpochRecord[];
  confusionMatrix: number[][]; // 5x5 matrix
  logs: string[];
}

// Concrete Construction CV classes for Confusion Matrix
const CV_CLASSES_MAP: { [key: string]: string[] } = {
  "Concrete Crack YOLOv8": ["Background", "Hairline Crack", "Structural Crack", "Spalling", "Rebar Exposure"],
  "PPE Compliance YOLOv10": ["Background", "Helmet", "Safety Vest", "No Helmet", "No Vest"],
  "BIM Structural Segmenter": ["Background", "Column", "Beam", "Slab", "Wall"],
  "Rebar Grid Estimator": ["Background", "Rebar Node", "Tie Wire", "Rust Corrosion", "Spacing Fault"]
};

// Initial historical training runs
const INITIAL_RUNS: TrainingRun[] = [
  {
    id: "run-001",
    name: "yolov8-concrete-crack-baseline",
    experimentName: "Concrete Crack YOLOv8",
    status: "Finished",
    startedBy: "sidduchitiki@gmail.com",
    startTime: "2026-07-18 14:22:10",
    duration: "2h 15m 30s",
    hyperparameters: {
      learningRate: 0.01,
      batchSize: 16,
      epochs: 50,
      optimizer: "SGD",
      backbone: "YOLOv8n",
      weightDecay: 0.0005,
      dropout: 0.0,
      augmentation: "hsv + fliplr"
    },
    dataset: {
      name: "CrackDetect-V3",
      size: 8400,
      split: "80/10/10",
      version: "v3.1",
      classes: ["Background", "Hairline Crack", "Structural Crack", "Spalling", "Rebar Exposure"]
    },
    metrics: {
      loss: 0.21,
      accuracy: 0.92,
      precision: 0.91,
      recall: 0.89,
      mAP: 0.88,
      iou: 0.81
    },
    systemMetrics: {
      gpuUtil: 92,
      gpuTemp: 74,
      gpuVram: 10.4,
      cpuUtil: 45,
      ramUsage: 14.2
    },
    epochHistory: Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      loss: Number((0.8 * Math.exp(-i / 15) + 0.18 + Math.random() * 0.04).toFixed(3)),
      valLoss: Number((0.85 * Math.exp(-i / 15) + 0.20 + Math.random() * 0.03).toFixed(3)),
      accuracy: Number((0.5 + 0.42 * (1 - Math.exp(-i / 12)) + Math.random() * 0.01).toFixed(3)),
      valAccuracy: Number((0.48 + 0.43 * (1 - Math.exp(-i / 12)) + Math.random() * 0.015).toFixed(3)),
      mAP: Number((0.4 + 0.48 * (1 - Math.exp(-i / 15)) + Math.random() * 0.01).toFixed(3)),
      iou: Number((0.35 + 0.46 * (1 - Math.exp(-i / 15)) + Math.random() * 0.01).toFixed(3)),
      gpuTemp: 70 + Math.floor(Math.sin(i / 3) * 3) + Math.floor(Math.random() * 2),
      gpuVram: 10.4,
      gpuUtil: 90 + Math.floor(Math.random() * 5)
    })),
    confusionMatrix: [
      [92, 4, 2, 1, 1],
      [3, 89, 5, 2, 1],
      [1, 6, 88, 3, 2],
      [2, 3, 4, 86, 5],
      [1, 1, 3, 4, 91]
    ],
    logs: [
      "[INFO] 2026-07-18 14:22:11 - Initializing YOLOv8n detector pipeline...",
      "[INFO] Loading pre-trained COCO backbone model parameters.",
      "[DATASET] Parsing CrackDetect-V3 annotation files (8400 images loaded).",
      "[TRAIN] Ep 1/50 - loss: 0.982 | val_loss: 1.012 | mAP: 0.402 | IoU: 0.351",
      "[TRAIN] Ep 10/50 - loss: 0.612 | val_loss: 0.654 | mAP: 0.590 | IoU: 0.521",
      "[TRAIN] Ep 25/50 - loss: 0.342 | val_loss: 0.380 | mAP: 0.741 | IoU: 0.675",
      "[TRAIN] Ep 40/50 - loss: 0.245 | val_loss: 0.262 | mAP: 0.840 | IoU: 0.772",
      "[TRAIN] Ep 50/50 - loss: 0.210 | val_loss: 0.222 | mAP: 0.880 | IoU: 0.810",
      "[INFO] Saving model artifacts to ./runs/yolov8-concrete-crack-baseline/weights/best.pt",
      "[FINISHED] Run successfully finalized."
    ]
  },
  {
    id: "run-002",
    name: "yolov8-concrete-crack-heavy-aug",
    experimentName: "Concrete Crack YOLOv8",
    status: "Finished",
    startedBy: "sidduchitiki@gmail.com",
    startTime: "2026-07-18 17:30:00",
    duration: "3h 45m 12s",
    hyperparameters: {
      learningRate: 0.01,
      batchSize: 16,
      epochs: 50,
      optimizer: "SGD",
      backbone: "YOLOv8s", // larger backbone
      weightDecay: 0.0005,
      dropout: 0.1,
      augmentation: "hsv + fliplr + mixup + mosaic"
    },
    dataset: {
      name: "CrackDetect-V3",
      size: 8400,
      split: "80/10/10",
      version: "v3.1",
      classes: ["Background", "Hairline Crack", "Structural Crack", "Spalling", "Rebar Exposure"]
    },
    metrics: {
      loss: 0.18,
      accuracy: 0.94,
      precision: 0.93,
      recall: 0.92,
      mAP: 0.91,
      iou: 0.84
    },
    systemMetrics: {
      gpuUtil: 95,
      gpuTemp: 76,
      gpuVram: 12.1,
      cpuUtil: 52,
      ramUsage: 14.8
    },
    epochHistory: Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      loss: Number((0.95 * Math.exp(-i / 13) + 0.15 + Math.random() * 0.03).toFixed(3)),
      valLoss: Number((0.98 * Math.exp(-i / 13) + 0.17 + Math.random() * 0.02).toFixed(3)),
      accuracy: Number((0.45 + 0.49 * (1 - Math.exp(-i / 11)) + Math.random() * 0.01).toFixed(3)),
      valAccuracy: Number((0.43 + 0.50 * (1 - Math.exp(-i / 11)) + Math.random() * 0.012).toFixed(3)),
      mAP: Number((0.35 + 0.56 * (1 - Math.exp(-i / 13)) + Math.random() * 0.008).toFixed(3)),
      iou: Number((0.30 + 0.54 * (1 - Math.exp(-i / 13)) + Math.random() * 0.01).toFixed(3)),
      gpuTemp: 72 + Math.floor(Math.sin(i / 2) * 4) + Math.floor(Math.random() * 2),
      gpuVram: 12.1,
      gpuUtil: 94 + Math.floor(Math.random() * 3)
    })),
    confusionMatrix: [
      [95, 2, 2, 0, 1],
      [2, 92, 3, 2, 1],
      [1, 3, 91, 3, 2],
      [1, 2, 3, 90, 4],
      [1, 1, 2, 3, 93]
    ],
    logs: [
      "[INFO] 2026-07-18 17:30:02 - Initializing YOLOv8s with mosaic augmentation enabled...",
      "[INFO] Larger backbone parameters allocated to VRAM.",
      "[DATASET] Loading CrackDetect-V3 dataset split labels.",
      "[TRAIN] Ep 1/50 - loss: 1.120 | val_loss: 1.150 | mAP: 0.350 | IoU: 0.300",
      "[TRAIN] Ep 10/50 - loss: 0.542 | val_loss: 0.582 | mAP: 0.630 | IoU: 0.560",
      "[TRAIN] Ep 25/50 - loss: 0.280 | val_loss: 0.312 | mAP: 0.812 | IoU: 0.730",
      "[TRAIN] Ep 40/50 - loss: 0.201 | val_loss: 0.219 | mAP: 0.885 | IoU: 0.815",
      "[TRAIN] Ep 50/50 - loss: 0.180 | val_loss: 0.170 | mAP: 0.910 | IoU: 0.840",
      "[INFO] Model artifacts exported. Best weights located at: ./runs/yolov8-concrete-crack-heavy-aug/weights/best.pt"
    ]
  },
  {
    id: "run-003",
    name: "yolov8-concrete-crack-adamw",
    experimentName: "Concrete Crack YOLOv8",
    status: "Finished",
    startedBy: "sidduchitiki@gmail.com",
    startTime: "2026-07-18 21:40:00",
    duration: "3h 12m 05s",
    hyperparameters: {
      learningRate: 0.001,
      batchSize: 32,
      epochs: 50,
      optimizer: "AdamW",
      backbone: "YOLOv8s",
      weightDecay: 0.01,
      dropout: 0.1,
      augmentation: "hsv + fliplr"
    },
    dataset: {
      name: "CrackDetect-V3",
      size: 8400,
      split: "80/10/10",
      version: "v3.1",
      classes: ["Background", "Hairline Crack", "Structural Crack", "Spalling", "Rebar Exposure"]
    },
    metrics: {
      loss: 0.25,
      accuracy: 0.89,
      precision: 0.88,
      recall: 0.87,
      mAP: 0.85,
      iou: 0.78
    },
    systemMetrics: {
      gpuUtil: 91,
      gpuTemp: 71,
      gpuVram: 14.2,
      cpuUtil: 48,
      ramUsage: 15.1
    },
    epochHistory: Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      loss: Number((0.75 * Math.exp(-i / 18) + 0.24 + Math.random() * 0.03).toFixed(3)),
      valLoss: Number((0.78 * Math.exp(-i / 17) + 0.26 + Math.random() * 0.035).toFixed(3)),
      accuracy: Number((0.52 + 0.37 * (1 - Math.exp(-i / 15)) + Math.random() * 0.015).toFixed(3)),
      valAccuracy: Number((0.50 + 0.36 * (1 - Math.exp(-i / 15)) + Math.random() * 0.02).toFixed(3)),
      mAP: Number((0.38 + 0.47 * (1 - Math.exp(-i / 18)) + Math.random() * 0.012).toFixed(3)),
      iou: Number((0.32 + 0.46 * (1 - Math.exp(-i / 18)) + Math.random() * 0.015).toFixed(3)),
      gpuTemp: 68 + Math.floor(Math.sin(i / 4) * 3) + Math.floor(Math.random() * 1),
      gpuVram: 14.2,
      gpuUtil: 88 + Math.floor(Math.random() * 4)
    })),
    confusionMatrix: [
      [89, 4, 3, 2, 2],
      [4, 87, 5, 2, 2],
      [2, 5, 86, 4, 3],
      [3, 3, 5, 85, 4],
      [2, 2, 3, 5, 88]
    ],
    logs: [
      "[INFO] 2026-07-18 21:40:02 - Running YOLOv8s with AdamW optimizer...",
      "[INFO] Decoupled weight decay parameter: 0.01.",
      "[TRAIN] Ep 1/50 - loss: 0.990 | val_loss: 1.040 | mAP: 0.380 | IoU: 0.320",
      "[TRAIN] Ep 10/50 - loss: 0.654 | val_loss: 0.690 | mAP: 0.525 | IoU: 0.465",
      "[TRAIN] Ep 25/50 - loss: 0.381 | val_loss: 0.420 | mAP: 0.720 | IoU: 0.650",
      "[TRAIN] Ep 50/50 - loss: 0.250 | val_loss: 0.260 | mAP: 0.850 | IoU: 0.780"
    ]
  },
  {
    id: "run-004",
    name: "yolov10-ppe-baseline",
    experimentName: "PPE Compliance YOLOv10",
    status: "Finished",
    startedBy: "sidduchitiki@gmail.com",
    startTime: "2026-07-19 01:10:00",
    duration: "6h 20m 45s",
    hyperparameters: {
      learningRate: 0.01,
      batchSize: 32,
      epochs: 80,
      optimizer: "SGD",
      backbone: "YOLOv10m",
      weightDecay: 0.0005,
      dropout: 0.15,
      augmentation: "default"
    },
    dataset: {
      name: "PPE-Safety-V8",
      size: 12500,
      split: "70/20/10",
      version: "v8.0",
      classes: ["Background", "Helmet", "Safety Vest", "No Helmet", "No Vest"]
    },
    metrics: {
      loss: 0.15,
      accuracy: 0.96,
      precision: 0.95,
      recall: 0.96,
      mAP: 0.94,
      iou: 0.88
    },
    systemMetrics: {
      gpuUtil: 97,
      gpuTemp: 79,
      gpuVram: 15.3,
      cpuUtil: 58,
      ramUsage: 22.4
    },
    epochHistory: Array.from({ length: 80 }, (_, i) => ({
      epoch: i + 1,
      loss: Number((0.9 * Math.exp(-i / 22) + 0.14 + Math.random() * 0.02).toFixed(3)),
      valLoss: Number((0.92 * Math.exp(-i / 22) + 0.15 + Math.random() * 0.015).toFixed(3)),
      accuracy: Number((0.55 + 0.41 * (1 - Math.exp(-i / 18)) + Math.random() * 0.008).toFixed(3)),
      valAccuracy: Number((0.53 + 0.42 * (1 - Math.exp(-i / 18)) + Math.random() * 0.01).toFixed(3)),
      mAP: Number((0.42 + 0.52 * (1 - Math.exp(-i / 20)) + Math.random() * 0.008).toFixed(3)),
      iou: Number((0.38 + 0.50 * (1 - Math.exp(-i / 20)) + Math.random() * 0.01).toFixed(3)),
      gpuTemp: 74 + Math.floor(Math.sin(i / 5) * 5) + Math.floor(Math.random() * 2),
      gpuVram: 15.3,
      gpuUtil: 96 + Math.floor(Math.random() * 2)
    })),
    confusionMatrix: [
      [97, 1, 1, 0, 1],
      [1, 96, 1, 1, 1],
      [0, 1, 97, 1, 1],
      [1, 1, 1, 95, 2],
      [0, 1, 1, 2, 96]
    ],
    logs: [
      "[INFO] 2026-07-19 01:10:01 - Booting YOLOv10m pipeline for Personal Protective Equipment compliance.",
      "[DATASET] Loaded PPE-Safety-V8 (12,500 images total). Detectable classes: Helmet, Safety Vest.",
      "[TRAIN] Ep 1/80 - loss: 1.040 | val_loss: 1.070 | mAP: 0.420 | IoU: 0.380",
      "[TRAIN] Ep 20/80 - loss: 0.562 | val_loss: 0.590 | mAP: 0.685 | IoU: 0.612",
      "[TRAIN] Ep 40/80 - loss: 0.320 | val_loss: 0.341 | mAP: 0.812 | IoU: 0.741",
      "[TRAIN] Ep 60/80 - loss: 0.205 | val_loss: 0.220 | mAP: 0.890 | IoU: 0.824",
      "[TRAIN] Ep 80/80 - loss: 0.150 | val_loss: 0.150 | mAP: 0.940 | IoU: 0.880",
      "[INFO] Best model checkpoint stored at ./runs/yolov10-ppe-baseline/weights/best.pt"
    ]
  },
  {
    id: "run-005",
    name: "rebar-spacing-resnet",
    experimentName: "Rebar Grid Estimator",
    status: "Failed",
    startedBy: "sidduchitiki@gmail.com",
    startTime: "2026-07-19 05:20:00",
    duration: "48m 15s (Crashed)",
    hyperparameters: {
      learningRate: 0.005,
      batchSize: 8,
      epochs: 30,
      optimizer: "Adam",
      backbone: "ResNet50",
      weightDecay: 0.0001,
      dropout: 0.2,
      augmentation: "rotate + shear"
    },
    dataset: {
      name: "Rebar-Grid-V2",
      size: 4200,
      split: "80/10/10",
      version: "v2.0",
      classes: ["Background", "Rebar Node", "Tie Wire", "Rust Corrosion", "Spacing Fault"]
    },
    metrics: {
      loss: 0.65,
      accuracy: 0.61,
      precision: 0.58,
      recall: 0.54,
      mAP: 0.49,
      iou: 0.40
    },
    systemMetrics: {
      gpuUtil: 100,
      gpuTemp: 84,
      gpuVram: 15.9,
      cpuUtil: 85,
      ramUsage: 28.1
    },
    epochHistory: Array.from({ length: 11 }, (_, i) => ({
      epoch: i + 1,
      loss: Number((1.2 * Math.exp(-i / 8) + 0.45 + Math.random() * 0.1).toFixed(3)),
      valLoss: Number((1.25 * Math.exp(-i / 8) + 0.5 + Math.random() * 0.15).toFixed(3)),
      accuracy: Number((0.35 + 0.26 * (1 - Math.exp(-i / 10)) + Math.random() * 0.03).toFixed(3)),
      valAccuracy: Number((0.33 + 0.25 * (1 - Math.exp(-i / 10)) + Math.random() * 0.04).toFixed(3)),
      mAP: Number((0.25 + 0.24 * (1 - Math.exp(-i / 12)) + Math.random() * 0.03).toFixed(3)),
      iou: Number((0.20 + 0.20 * (1 - Math.exp(-i / 12)) + Math.random() * 0.03).toFixed(3)),
      gpuTemp: 78 + i * 1.5,
      gpuVram: 15.9,
      gpuUtil: 100
    })),
    confusionMatrix: [
      [62, 12, 10, 8, 8],
      [15, 58, 12, 8, 7],
      [12, 14, 54, 11, 9],
      [11, 10, 15, 52, 12],
      [9, 11, 12, 13, 55]
    ],
    logs: [
      "[INFO] 2026-07-19 05:20:01 - Initializing ResNet50 classifier for rebar structural analysis...",
      "[DATASET] Loaded Rebar-Grid-V2 dataset annotations (4200 images loaded).",
      "[TRAIN] Ep 1/30 - loss: 1.650 | val_loss: 1.750 | mAP: 0.250 | IoU: 0.200",
      "[TRAIN] Ep 5/30 - loss: 1.250 | val_loss: 1.340 | mAP: 0.350 | IoU: 0.280",
      "[TRAIN] Ep 10/30 - loss: 0.980 | val_loss: 1.120 | mAP: 0.450 | IoU: 0.370",
      "[TRAIN] Ep 11/30 - loss: 0.910 | val_loss: 1.050 | mAP: 0.490 | IoU: 0.400",
      "[SYSTEM] [WARNING] GPU core temperature reached 84°C (Throttling limit: 85°C).",
      "[SYSTEM] [CRITICAL] Out of Memory Exception (OOM). VRAM allocation request of 2.1 GB failed.",
      "[CRASH] Process terminated with exit code 137 (OOM Killed)."
    ]
  }
];

export default function ExperimentTracker() {
  // Navigation inside component
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "compare" | "details">("dashboard");
  const [runs, setRuns] = useState<TrainingRun[]>(INITIAL_RUNS);
  
  // Experiment selection
  const [selectedExperiment, setSelectedExperiment] = useState<string>("All Experiments");
  const experimentsList = ["All Experiments", ...Array.from(new Set(runs.map(r => r.experimentName)))];

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");

  // Selection for Details and Comparison
  const [selectedRunId, setSelectedRunId] = useState<string>("run-001");
  const [compareIds, setCompareIds] = useState<string[]>(["run-001", "run-002"]);

  // Live simulation states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState("yolov8-concrete-crack-pro");
  const [simExperiment, setSimExperiment] = useState("Concrete Crack YOLOv8");
  const [simLR, setSimLR] = useState(0.01);
  const [simBatchSize, setSimBatchSize] = useState(16);
  const [simBackbone, setSimBackbone] = useState("YOLOv8x");
  const [simOptimizer, setSimOptimizer] = useState("AdamW");
  const [simEpochs, setSimEpochs] = useState(10);
  
  const [simulating, setSimulating] = useState(false);
  const [simEpoch, setSimEpoch] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simHistory, setSimHistory] = useState<EpochRecord[]>([]);
  const [simGpuTemp, setSimGpuTemp] = useState(65);
  const [simGpuUtil, setSimGpuUtil] = useState(0);
  const [simGpuVram, setSimGpuVram] = useState(2.1);

  // Confusion matrix calculation hover state
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);

  // Selected Artifact File
  const [selectedArtifact, setSelectedArtifact] = useState<string>("weights/best.pt");

  // Terminal scroll handler
  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  // Selected Run Object helper
  const selectedRun = runs.find(r => r.id === selectedRunId) || runs[0];

  // Filtered runs
  const filteredRuns = runs.filter(run => {
    const matchesExp = selectedExperiment === "All Experiments" || run.experimentName === selectedExperiment;
    const matchesStatus = statusFilter === "All Statuses" || run.status === statusFilter;
    const matchesSearch = run.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          run.hyperparameters.backbone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesExp && matchesStatus && matchesSearch;
  });

  // Toggle Compare Run
  const handleToggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(item => item !== id));
    } else {
      setCompareIds([...compareIds, id]);
    }
  };

  // Run a live training simulation
  const startSimulation = () => {
    setSimulating(true);
    setSimEpoch(0);
    setSimHistory([]);
    setSimGpuTemp(68);
    setSimGpuUtil(85);
    setSimGpuVram(4.2);
    setSimLogs([
      `[SYSTEM] 2026-07-19 08:20:00 - Initializing MLFlow-W&B Client Agent...`,
      `[SYSTEM] Allocating cluster resources... GPU: 1x NVIDIA L4 VRAM (24GB).`,
      `[DATA] Pre-fetching dataset splits for ${simExperiment === "Concrete Crack YOLOv8" ? "CrackDetect-V3" : "Generic-CV-Set"}...`,
      `[MODEL] Constructing backbone target graph using ${simBackbone}...`,
      `[HYPERPARAMS] Learning Rate: ${simLR} | Batch Size: ${simBatchSize} | Optimizer: ${simOptimizer} | Weight Decay: 0.0005`,
      `[TRAIN] Beginning model training across ${simEpochs} simulation epochs.`
    ]);

    let currentEpoch = 0;
    const localHistory: EpochRecord[] = [];

    const interval = setInterval(() => {
      currentEpoch++;
      if (currentEpoch > simEpochs) {
        clearInterval(interval);
        setSimulating(false);
        
        // Finalize logs and append finalized run to runs
        const finalMetrics: Metrics = {
          loss: localHistory[localHistory.length - 1].loss,
          accuracy: localHistory[localHistory.length - 1].accuracy,
          precision: Number((localHistory[localHistory.length - 1].accuracy - 0.01).toFixed(3)),
          recall: Number((localHistory[localHistory.length - 1].accuracy - 0.02).toFixed(3)),
          mAP: localHistory[localHistory.length - 1].mAP,
          iou: localHistory[localHistory.length - 1].iou
        };

        const newRun: TrainingRun = {
          id: `run-${Date.now().toString().slice(-3)}`,
          name: simName,
          experimentName: simExperiment,
          status: "Finished",
          startedBy: "sidduchitiki@gmail.com",
          startTime: new Date().toISOString().replace("T", " ").slice(0, 19),
          duration: `${Math.floor(simEpochs * 1.5)}m 00s (Simulated)`,
          hyperparameters: {
            learningRate: simLR,
            batchSize: simBatchSize,
            epochs: simEpochs,
            optimizer: simOptimizer,
            backbone: simBackbone,
            weightDecay: 0.0005,
            dropout: 0.1,
            augmentation: "hsv + fliplr + scale"
          },
          dataset: {
            name: simExperiment === "Concrete Crack YOLOv8" ? "CrackDetect-V3" : "PPE-Safety-V8",
            size: simExperiment === "Concrete Crack YOLOv8" ? 8400 : 12500,
            split: "80/10/10",
            version: "v3.1",
            classes: CV_CLASSES_MAP[simExperiment] || ["Class 0", "Class 1", "Class 2", "Class 3", "Class 4"]
          },
          metrics: finalMetrics,
          systemMetrics: {
            gpuUtil: 94,
            gpuTemp: 75,
            gpuVram: Number(simGpuVram.toFixed(1)),
            cpuUtil: 48,
            ramUsage: 14.8
          },
          epochHistory: [...localHistory],
          confusionMatrix: [
            [94, 2, 2, 1, 1],
            [2, 93, 2, 2, 1],
            [1, 2, 95, 1, 1],
            [2, 2, 2, 92, 2],
            [1, 1, 1, 1, 96]
          ],
          logs: [
            `[SYSTEM] Initialized tracking node for run ${simName}`,
            `[HYPERPARAMS] lr: ${simLR}, optimizer: ${simOptimizer}, batch: ${simBatchSize}`,
            ...localHistory.map(h => `[TRAIN] Ep ${h.epoch}/${simEpochs} - loss: ${h.loss} | val_loss: ${h.valLoss} | mAP: ${h.mAP} | IoU: ${h.iou}`),
            `[FINAL] Run compiled successfully. Best checkpoint exported.`
          ]
        };

        setRuns(prev => [newRun, ...prev]);
        setSelectedRunId(newRun.id);
        setSimLogs(prev => [...prev, `[SUCCESS] Run finalized! Run added to project tracking ledger: ${newRun.id}.`]);
        return;
      }

      // Generate realistic converging training variables
      const currentLoss = Number((0.95 * Math.exp(-currentEpoch / 4) + 0.12 + Math.random() * 0.05).toFixed(3));
      const currentValLoss = Number((0.98 * Math.exp(-currentEpoch / 4) + 0.14 + Math.random() * 0.03).toFixed(3));
      const currentAcc = Number((0.50 + 0.45 * (1 - Math.exp(-currentEpoch / 3.5)) + Math.random() * 0.01).toFixed(3));
      const currentValAcc = Number((0.48 + 0.44 * (1 - Math.exp(-currentEpoch / 3.5)) + Math.random() * 0.015).toFixed(3));
      const currentMAP = Number((0.35 + 0.58 * (1 - Math.exp(-currentEpoch / 4)) + Math.random() * 0.01).toFixed(3));
      const currentIOU = Number((0.30 + 0.55 * (1 - Math.exp(-currentEpoch / 4)) + Math.random() * 0.012).toFixed(3));
      
      const updatedGpuTemp = 70 + Math.floor(Math.sin(currentEpoch) * 4) + Math.floor(Math.random() * 2);
      const updatedGpuUtil = 88 + Math.floor(Math.random() * 8);
      const updatedGpuVram = Math.min(24.0, 4.2 + (currentEpoch * 0.4) + Math.random() * 0.1);

      const epochRecord: EpochRecord = {
        epoch: currentEpoch,
        loss: currentLoss,
        valLoss: currentValLoss,
        accuracy: currentAcc,
        valAccuracy: currentValAcc,
        mAP: currentMAP,
        iou: currentIOU,
        gpuTemp: updatedGpuTemp,
        gpuVram: Number(updatedGpuVram.toFixed(1)),
        gpuUtil: updatedGpuUtil
      };

      localHistory.push(epochRecord);
      setSimEpoch(currentEpoch);
      setSimHistory([...localHistory]);
      setSimGpuTemp(updatedGpuTemp);
      setSimGpuUtil(updatedGpuUtil);
      setSimGpuVram(updatedGpuVram);

      setSimLogs(prev => [
        ...prev,
        `[TRAIN] Epoch ${currentEpoch}/${simEpochs} - loss: ${currentLoss} | val_loss: ${currentValLoss} | mAP: ${currentMAP} | IoU: ${currentIOU} [GPU: ${updatedGpuTemp}°C, VRAM: ${updatedGpuVram.toFixed(1)} GB]`
      ]);
    }, 1200);

    return () => clearInterval(interval);
  };

  // High level system summaries
  const totalRuns = runs.length;
  const finishedRunsCount = runs.filter(r => r.status === "Finished").length;
  const activeRunsCount = runs.filter(r => r.status === "Running").length;
  const bestMAP = Math.max(...runs.filter(r => r.status === "Finished").map(r => r.metrics.mAP));

  return (
    <div className="w-full flex flex-col gap-6" id="experiment-tracker-tab">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 text-violet-700 rounded-lg">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Enterprise Experiment Tracking Platform
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                W&B / MLflow Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Compute, track, evaluate, and compare construction Computer Vision model hyperparameters & metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setSimName(`yolov8-crack-v3-dev_${Date.now().toString().slice(-4)}`);
              setShowSimulateModal(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Launch Live Training Run
          </button>
        </div>
      </div>

      {/* TOP SYSTEM KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Total Project Runs</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalRuns}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <History className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold block">Finished Checklist</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{finishedRunsCount} / {totalRuns}</span>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-violet-500 font-bold block">Best Evaluated mAP</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{bestMAP.toFixed(2)}</span>
          </div>
          <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold block">Active Compute Status</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              GPU CLUSTER ONLINE
            </span>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* COMPONENT BODY */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: EXPERIMENTS SIDEBAR (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-500" />
              Project Experiments
            </h3>
            
            <div className="flex flex-col gap-1.5">
              {experimentsList.map(expName => (
                <button
                  key={expName}
                  onClick={() => setSelectedExperiment(expName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedExperiment === expName
                      ? "bg-violet-50 text-violet-700 font-bold border-l-3 border-violet-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{expName}</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                    {expName === "All Experiments" ? runs.length : runs.filter(r => r.experimentName === expName).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              Quick Filters
            </h3>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Run Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Finished">Finished</option>
                <option value="Failed">Failed</option>
                <option value="Running">Running</option>
              </select>
            </div>
          </div>

          {/* Comparison Bucket */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Comparison Queue ({compareIds.length})
              </h3>
              {compareIds.length > 0 && (
                <button
                  onClick={() => setCompareIds([])}
                  className="text-[10px] text-red-500 hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {compareIds.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No runs checked for comparison. Check runs below to overlay curves.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {compareIds.map(id => {
                  const r = runs.find(run => run.id === id);
                  if (!r) return null;
                  return (
                    <div key={id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[120px]">{r.name}</span>
                      <button
                        onClick={() => handleToggleCompare(id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => setActiveSubTab("compare")}
                  className="w-full py-1.5 mt-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Compare Side-by-Side
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RUN WORKSPACE TABBED VIEW (9 Cols) */}
        <div className="xl:col-span-9 flex flex-col gap-4">
          
          {/* TAB CONTROLS */}
          <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl border border-b-0 border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveSubTab("dashboard")}
              className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "dashboard"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart4 className="w-4 h-4" />
              Runs Ledger & Leaderboard
            </button>
            <button
              onClick={() => setActiveSubTab("compare")}
              className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "compare"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sliders className="w-4 h-4" />
              Run Comparer & Plots
            </button>
            <button
              onClick={() => setActiveSubTab("details")}
              className={`px-4 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "details"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Database className="w-4 h-4" />
              Run Deep-Metric Workspace
            </button>
          </div>

          {/* TAB 1 CONTENT: RUNS LEDGER & LEADERBOARD */}
          {activeSubTab === "dashboard" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Training Runs Register</h2>
                  <p className="text-[11px] text-slate-500">Overview of checked, finalized, and running machine learning processes.</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Showing {filteredRuns.length} of {runs.length} runs</span>
              </div>

              {/* RUNS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-3 w-8">Comp</th>
                      <th className="py-3 px-3">Run Name & ID</th>
                      <th className="py-3 px-3">Experiment</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Hyperparameters</th>
                      <th className="py-3 px-3">mAP</th>
                      <th className="py-3 px-3">IoU</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRuns.map(run => (
                      <tr 
                        key={run.id} 
                        className={`hover:bg-slate-50 transition-all ${selectedRunId === run.id ? "bg-indigo-50/20" : ""}`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={compareIds.includes(run.id)}
                            onChange={() => handleToggleCompare(run.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold">
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                setSelectedRunId(run.id);
                                setActiveSubTab("details");
                              }}
                              className="text-slate-900 font-bold hover:text-indigo-600 text-left hover:underline truncate max-w-[200px]"
                            >
                              {run.name}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{run.id} • {run.startedBy.split("@")[0]}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px] truncate max-w-[150px]">{run.experimentName}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            run.status === "Finished"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : run.status === "Failed"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                          }`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1 flex-wrap text-[10px] max-w-[220px]">
                            <span className="bg-slate-100 px-1 py-0.5 rounded font-mono" title="Backbone">{run.hyperparameters.backbone}</span>
                            <span className="bg-slate-100 px-1 py-0.5 rounded font-mono" title="Batch Size">b={run.hyperparameters.batchSize}</span>
                            <span className="bg-slate-100 px-1 py-0.5 rounded font-mono" title="Optimizer">{run.hyperparameters.optimizer}</span>
                            <span className="bg-slate-100 px-1 py-0.5 rounded font-mono" title="Learning Rate">lr={run.hyperparameters.learningRate}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-indigo-600 font-mono">{run.status === "Failed" ? "N/A" : run.metrics.mAP.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-700 font-mono">{run.status === "Failed" ? "N/A" : run.metrics.iou.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{run.duration}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedRunId(run.id);
                              setActiveSubTab("details");
                            }}
                            className="p-1 px-2.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-all cursor-pointer"
                          >
                            Inspect Run
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredRuns.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                          No runs matching your active filters. Try launching a simulated training run!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: RUN COMPARER & PLOTS */}
          {activeSubTab === "compare" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5 shadow-xs flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Side-by-Side Model Comparison</h2>
                <p className="text-[11px] text-slate-500">
                  Contrast hyperparameters and key target metrics across checked runs. Check runs in the sidebar comparison list.
                </p>
              </div>

              {compareIds.length < 2 ? (
                <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Please check at least two runs in the sidebar Comparison Queue to enable differential telemetry.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  
                  {/* PARAMETERS & METRICS COMPARATIVE MATRIX */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-2 px-3 font-bold text-slate-500 w-48">Parameter / Metric</th>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return (
                              <th key={id} className="py-2 px-3 font-bold text-slate-800 border-l border-slate-200 min-w-[150px] truncate">
                                {r?.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Static Hyperparams */}
                        <tr className="bg-slate-50/50"><td colSpan={compareIds.length + 1} className="py-1 px-3 text-[10px] uppercase font-bold text-indigo-600">Model Configuration</td></tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Backbone Model</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.hyperparameters.backbone}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Optimizer</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.hyperparameters.optimizer}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Learning Rate</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.hyperparameters.learningRate}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Batch Size</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.hyperparameters.batchSize}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Weight Decay</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.hyperparameters.weightDecay}</td>;
                          })}
                        </tr>

                        {/* Static Dataset info */}
                        <tr className="bg-slate-50/50"><td colSpan={compareIds.length + 1} className="py-1 px-3 text-[10px] uppercase font-bold text-violet-600">Dataset Specs</td></tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Dataset Name</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 border-l border-slate-200">{r?.dataset.name} ({r?.dataset.version})</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Total Images</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.dataset.size.toLocaleString()}</td>;
                          })}
                        </tr>

                        {/* Evaluation Metrics */}
                        <tr className="bg-slate-50/50"><td colSpan={compareIds.length + 1} className="py-1 px-3 text-[10px] uppercase font-bold text-emerald-600">Evaluation Metrics</td></tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500 font-bold">mAP (mean Avg Precision)</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            const bestVal = Math.max(...compareIds.map(cid => runs.find(ru => ru.id === cid)?.metrics.mAP || 0));
                            const isBest = r?.metrics.mAP === bestVal;
                            return (
                              <td key={id} className={`py-2 px-3 font-mono font-bold border-l border-slate-200 ${isBest ? "text-emerald-600 bg-emerald-50/50" : "text-slate-700"}`}>
                                {r?.status === "Failed" ? "FAILED" : r?.metrics.mAP.toFixed(2)}
                                {isBest && r?.status !== "Failed" && " 🏆 (Best)"}
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Intersection over Union (IoU)</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.status === "Failed" ? "FAILED" : r?.metrics.iou.toFixed(2)}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Accuracy</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.status === "Failed" ? "FAILED" : r?.metrics.accuracy.toFixed(2)}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Precision</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.status === "Failed" ? "FAILED" : r?.metrics.precision.toFixed(2)}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Recall</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200">{r?.status === "Failed" ? "FAILED" : r?.metrics.recall.toFixed(2)}</td>;
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-500">Final Validation Loss</td>
                          {compareIds.map(id => {
                            const r = runs.find(run => run.id === id);
                            return <td key={id} className="py-2 px-3 font-mono border-l border-slate-200 text-rose-600">{r?.metrics.loss.toFixed(2)}</td>;
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* TELEMETRY CHARTS overlay */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* OVERLAY CHART: Loss curves */}
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                        Loss Comparative Overlay Curves
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="epoch" type="number" domain={[1, 'auto']} name="Epoch" />
                            <YAxis domain={[0, 'auto']} />
                            <Tooltip />
                            <Legend />
                            {compareIds.map((id, index) => {
                              const r = runs.find(run => run.id === id);
                              if (!r || r.status === "Failed") return null;
                              const colors = ["#4f46e5", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899"];
                              return (
                                <Line
                                  key={id}
                                  data={r.epochHistory}
                                  type="monotone"
                                  dataKey="valLoss"
                                  name={`${r.name} (val)`}
                                  stroke={colors[index % colors.length]}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* OVERLAY CHART: mAP curves */}
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        mAP (mean Avg Precision) Comparative Overlay Curves
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="epoch" type="number" domain={[1, 'auto']} name="Epoch" />
                            <YAxis domain={[0.3, 1.0]} />
                            <Tooltip />
                            <Legend />
                            {compareIds.map((id, index) => {
                              const r = runs.find(run => run.id === id);
                              if (!r || r.status === "Failed") return null;
                              const colors = ["#4f46e5", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899"];
                              return (
                                <Line
                                  key={id}
                                  data={r.epochHistory}
                                  type="monotone"
                                  dataKey="mAP"
                                  name={`${r.name}`}
                                  stroke={colors[index % colors.length]}
                                  strokeWidth={2}
                                  dot={false}
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* PARAM VS METRIC SCATTER PLOT */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-violet-500" />
                        Hyperparameter Coordinate Map (Batch Size vs. mAP)
                      </h4>
                      <p className="text-[10px] text-slate-500 mb-3">Interactive mapping of training batch sizes against validation mAP performance metrics.</p>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="batchSize" name="Batch Size" unit="" domain={[0, 40]} />
                            <YAxis type="number" dataKey="mAP" name="mAP" unit="" domain={[0.5, 1.0]} />
                            <ZAxis type="number" dataKey="lrZ" range={[100, 400]} name="LR scale" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter 
                              name="Completed Runs" 
                              data={runs.filter(r => r.status === "Finished").map(r => ({
                                name: r.name,
                                batchSize: r.hyperparameters.batchSize,
                                mAP: r.metrics.mAP,
                                lrZ: r.hyperparameters.learningRate * 10000
                              }))} 
                              fill="#6366f1" 
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3 CONTENT: DEEP METRIC WORKSPACE */}
          {activeSubTab === "details" && (
            <div className="flex flex-col gap-6">
              
              {/* RUN SELECTOR ACCORDION HEADER */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      Target Workspace Node
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedRun.status === "Finished" ? "bg-emerald-500" : "bg-rose-500 animate-ping"}`}></span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">{selectedRun.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Experiment: <span className="text-indigo-400 font-semibold">{selectedRun.experimentName}</span> • Started at: {selectedRun.startTime}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Select Run:</span>
                  <select
                    value={selectedRunId}
                    onChange={(e) => setSelectedRunId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    {runs.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CORE PARAMETERS AND DATASET CARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hyperparameter Config Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    Model Configuration & Hyperparameters
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Backbone network</span>
                      <span className="font-bold text-slate-800">{selectedRun.hyperparameters.backbone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Optimizer</span>
                      <span className="font-bold text-slate-800">{selectedRun.hyperparameters.optimizer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Learning rate</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.hyperparameters.learningRate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch Size</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.hyperparameters.batchSize}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Epochs</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.hyperparameters.epochs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Weight Decay</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.hyperparameters.weightDecay}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Dropout rate</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.hyperparameters.dropout}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Augmentation policy</span>
                      <span className="font-bold text-slate-800 capitalize truncate block" title={selectedRun.hyperparameters.augmentation}>
                        {selectedRun.hyperparameters.augmentation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dataset Metadata Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Database className="w-4 h-4 text-violet-500" />
                    Dataset Lineage & Parameters
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Dataset name</span>
                      <span className="font-bold text-slate-800">{selectedRun.dataset.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Dataset Version</span>
                      <span className="font-bold text-indigo-600 font-mono">{selectedRun.dataset.version}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total images</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.dataset.size.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Train / Val / Test Split</span>
                      <span className="font-mono font-bold text-slate-800">{selectedRun.dataset.split}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">Registered Dataset Classes</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedRun.dataset.classes.map((cls, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* DYNAMIC METRIC CHARTS & VALIDATION CURVES */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Validation Convergence Curves (Training History)
                </h3>

                {selectedRun.status === "Failed" && selectedRun.epochHistory.length < 15 ? (
                  <div className="py-6 bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800">Incomplete Training Convergence Data</h4>
                      <p className="text-[11px] text-rose-600 mt-1">
                        This run crashed early during training at epoch {selectedRun.epochHistory.length} due to hardware / system constraints. Showing partial logs.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                  
                  {/* Loss convergence */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Training Loss vs. Validation Loss</h4>
                    <div className="h-60 bg-slate-50/50 border border-slate-100 rounded-lg p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedRun.epochHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="epoch" name="Epoch" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="loss" stroke="#ef4444" name="Train Loss" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="valLoss" stroke="#3b82f6" name="Val Loss" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Accuracy and mAP curves */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Evaluation Performance (mAP & IoU)</h4>
                    <div className="h-60 bg-slate-50/50 border border-slate-100 rounded-lg p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedRun.epochHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="epoch" name="Epoch" />
                          <YAxis domain={[0, 1.0]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="mAP" stroke="#8b5cf6" name="Mean Average Precision (mAP)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="iou" stroke="#10b981" name="Intersection over Union (IoU)" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>

              {/* TWO COLUMN GRID: CONFUSION MATRIX & HARDWARE SYSTEM TELEMETRY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* INTERACTIVE CONFUSION MATRIX (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-violet-500" />
                        Aesthetic Confusion Matrix ({selectedRun.experimentName})
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-sm">
                        Normalized %
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Grid comparing actual ground truth labels (rows) vs predicted classification output (columns). Hover on squares to reveal evaluation parameters.
                    </p>

                    {/* CONFUSION MATRIX GRID */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex">
                        
                        {/* Y-AXIS label (rotated) */}
                        <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                          Ground Truth Actual Class
                        </div>

                        {/* Outer frame */}
                        <div className="flex flex-col">
                          
                          {/* Main grid table */}
                          <div className="grid grid-cols-5 gap-1.5">
                            {selectedRun.confusionMatrix.map((row, rIdx) => 
                              row.map((val, cIdx) => {
                                // Calculate bg opacity based on percent value
                                const opacity = (val / 100).toFixed(2);
                                const isDiagonal = rIdx === cIdx;
                                const isHovered = hoveredCell && hoveredCell.r === rIdx && hoveredCell.c === cIdx;
                                return (
                                  <div
                                    key={`${rIdx}-${cIdx}`}
                                    onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-mono font-bold rounded-lg border text-xs cursor-crosshair transition-all ${
                                      isDiagonal 
                                        ? "border-emerald-200 hover:scale-105" 
                                        : "border-slate-100 hover:scale-105"
                                    } ${
                                      isHovered 
                                        ? "ring-2 ring-indigo-500 z-10 scale-105 shadow-sm" 
                                        : ""
                                    }`}
                                    style={{
                                      backgroundColor: isDiagonal 
                                        ? `rgba(16, 185, 129, ${opacity})` 
                                        : `rgba(239, 68, 68, ${opacity})`,
                                      color: val > 45 ? "#ffffff" : "#1e293b"
                                    }}
                                  >
                                    <span>{val}%</span>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* X-AXIS LABELS */}
                          <div className="grid grid-cols-5 gap-1.5 mt-2">
                            {selectedRun.dataset.classes.map((cls, idx) => (
                              <span key={idx} className="w-14 md:w-16 text-[8px] text-slate-500 font-bold truncate text-center" title={cls}>
                                {cls}
                              </span>
                            ))}
                          </div>
                          
                          <div className="text-center text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mt-3">
                            Model Predicted Class Label
                          </div>

                        </div>
                        
                        {/* Right Hand: Y-AXIS Labels */}
                        <div className="flex flex-col gap-1.5 justify-around pl-3 pb-8 h-[290px] md:h-[330px]">
                          {selectedRun.dataset.classes.map((cls, idx) => (
                            <span key={idx} className="text-[9px] text-slate-500 font-bold truncate w-20" title={cls}>
                              ← {cls}
                            </span>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* CELL TELEMETRY METRIC BLOCK (Interactive Formula representation) */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {hoveredCell ? (
                      <div className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">
                            Actual: <span className="text-indigo-600">{selectedRun.dataset.classes[hoveredCell.r]}</span> • 
                            Predicted: <span className="text-indigo-600">{selectedRun.dataset.classes[hoveredCell.c]}</span>
                          </span>
                          <span className="font-mono bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-sm">
                            {hoveredCell.val}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {hoveredCell.r === hoveredCell.c 
                            ? "Correct classification. Counts as a True Positive (TP) segment inside the localization evaluation ledger."
                            : "Misclassification. Counts as a False Positive (FP) relative to the prediction label and False Negative (FN) to real target label."}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center">
                        Hover over confusion matrix grid squares to calculate class-specific Precision/Recall coordinates.
                      </p>
                    )}
                  </div>
                </div>

                {/* GPU HARDWARE RESOURCE MONITORING (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Cpu className="w-4 h-4 text-amber-500" />
                    GPU Telemetry & Hardware Logs
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">GPU VRAM Allocated</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-bold text-slate-800">{selectedRun.systemMetrics.gpuVram} GB</span>
                        <span className="text-[10px] text-slate-400">/ 16.0 GB</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: `${(selectedRun.systemMetrics.gpuVram / 16.0) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">GPU Core Temperature</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl font-bold text-slate-800">{selectedRun.systemMetrics.gpuTemp}°C</span>
                        <span className="text-[10px] text-rose-500 font-semibold">Max: 85°C</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${selectedRun.systemMetrics.gpuTemp > 78 ? "bg-rose-500" : "bg-amber-500"}`} 
                          style={{ width: `${(selectedRun.systemMetrics.gpuTemp / 85.0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* GPU Historical Graph */}
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">GPU Core Utilization History (%)</h4>
                    <div className="h-40 bg-slate-50/50 border border-slate-100 rounded-lg p-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedRun.epochHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="epoch" name="Epoch" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="gpuUtil" stroke="#f59e0b" name="GPU %" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="gpuTemp" stroke="#ef4444" name="Temp °C" strokeWidth={1} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Average Training Time per Epoch: <strong className="font-mono text-slate-700">{(runs.find(r => r.id === selectedRunId)?.epochHistory.length ? "2.7 seconds" : "0.0s")}</strong></span>
                  </div>
                </div>

              </div>

              {/* THREE COLUMN GRID BOTTOM: LOGS & ARTIFACT EXPLORER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SYSTEM TERMINAL LOGS (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-xl p-5 shadow-xs border border-slate-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                      <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Standard Out Console Streams
                    </h3>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-sm font-mono">
                      bash stdout
                    </span>
                  </div>

                  <div className="bg-slate-950 font-mono text-[11px] h-60 overflow-y-auto text-emerald-400/90 leading-relaxed p-1 rounded-md flex flex-col gap-1">
                    {selectedRun.logs.map((log, idx) => {
                      let color = "text-slate-300";
                      if (log.includes("[INFO]")) color = "text-blue-400";
                      if (log.includes("[DATASET]") || log.includes("[DATA]")) color = "text-violet-400";
                      if (log.includes("[TRAIN]")) color = "text-emerald-400";
                      if (log.includes("[WARNING]")) color = "text-amber-400 font-semibold";
                      if (log.includes("[CRITICAL]") || log.includes("[CRASH]") || log.includes("[FAILED]")) color = "text-rose-400 font-bold";
                      if (log.includes("[SUCCESS]")) color = "text-emerald-300 font-bold";
                      
                      return (
                        <div key={idx} className={color}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ARTIFACT TREE EXPLORER (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 mb-3">
                    <FolderOpen className="w-4 h-4 text-violet-500" />
                    Model Artifacts Tree
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="text-slate-400 font-bold flex items-center gap-1 py-1">
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>runs/{selectedRun.id}/</span>
                    </div>

                    <div className="pl-4 flex flex-col gap-1">
                      <button 
                        onClick={() => setSelectedArtifact("weights/best.pt")}
                        className={`flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          selectedArtifact === "weights/best.pt" 
                            ? "bg-violet-50 text-violet-700 font-bold" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5" />
                          weights/best.pt
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">14.8 MB</span>
                      </button>

                      <button 
                        onClick={() => setSelectedArtifact("weights/last.pt")}
                        className={`flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          selectedArtifact === "weights/last.pt" 
                            ? "bg-violet-50 text-violet-700 font-bold" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5" />
                          weights/last.pt
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">14.8 MB</span>
                      </button>

                      <button 
                        onClick={() => setSelectedArtifact("confusion_matrix.json")}
                        className={`flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          selectedArtifact === "confusion_matrix.json" 
                            ? "bg-violet-50 text-violet-700 font-bold" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          confusion_matrix.json
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">1.2 KB</span>
                      </button>

                      <button 
                        onClick={() => setSelectedArtifact("dataset_manifest.yaml")}
                        className={`flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          selectedArtifact === "dataset_manifest.yaml" 
                            ? "bg-violet-50 text-violet-700 font-bold" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          dataset_manifest.yaml
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">420 B</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Selected Artifact Details</span>
                    <p className="text-[11px] text-indigo-700 leading-normal">
                      {selectedArtifact === "weights/best.pt" && "Binary weights file containing neural network bias parameters and trained weights optimized on the target validation index."}
                      {selectedArtifact === "weights/last.pt" && "Latest weights file saved at the end of the final training epoch to allow resume training runs."}
                      {selectedArtifact === "confusion_matrix.json" && "Key metric JSON dictionary mapping actual classes and prediction values for normalized telemetry parsing."}
                      {selectedArtifact === "dataset_manifest.yaml" && "Standard configuration file pointing to file directories, label classes, and background parameters."}
                    </p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                        <FileText className="w-3 h-3" /> Download Artifact
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* LIVE SIMULATION MODAL OVERLAY */}
      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-slate-100 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]"
            >
              
              {/* MODAL HEADER */}
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <span className="font-bold text-xs md:text-sm uppercase tracking-wider">
                    Compute Simulator & Hyperparameter Node Config
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (simulating) {
                      if (confirm("Are you sure you want to kill the active training process? Progress will be discarded.")) {
                        setSimulating(false);
                        setShowSimulateModal(false);
                      }
                    } else {
                      setShowSimulateModal(false);
                    }
                  }}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL CONTENT CONTAINER */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-6">
                
                {/* CONFIGURATOR CONTROLS (Only editable before training starts) */}
                {!simulating && simHistory.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                        Run Identifiers
                      </h4>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Target Run Name</label>
                        <input
                          type="text"
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Target Experiment Node</label>
                        <select
                          value={simExperiment}
                          onChange={(e) => setSimExperiment(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Concrete Crack YOLOv8">Concrete Crack YOLOv8</option>
                          <option value="PPE Compliance YOLOv10">PPE Compliance YOLOv10</option>
                          <option value="BIM Structural Segmenter">BIM Structural Segmenter</option>
                          <option value="Rebar Grid Estimator">Rebar Grid Estimator</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                        Hyperparameters Configuration
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Backbone Architecture</label>
                          <select
                            value={simBackbone}
                            onChange={(e) => setSimBackbone(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="YOLOv8n">YOLOv8n (Nano)</option>
                            <option value="YOLOv8s">YOLOv8s (Small)</option>
                            <option value="YOLOv8x">YOLOv8x (X-Large)</option>
                            <option value="YOLOv10m">YOLOv10m (Medium)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Optimizer</label>
                          <select
                            value={simOptimizer}
                            onChange={(e) => setSimOptimizer(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="AdamW">AdamW</option>
                            <option value="SGD">SGD</option>
                            <option value="Adam">Adam</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Learning Rate</label>
                          <input
                            type="number"
                            step="0.001"
                            value={simLR}
                            onChange={(e) => setSimLR(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Batch Size</label>
                          <select
                            value={simBatchSize}
                            onChange={(e) => setSimBatchSize(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value={8}>8</option>
                            <option value={16}>16</option>
                            <option value={32}>32</option>
                          </select>
                        </div>

                        <div className="col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Training Epochs (Max 10)</label>
                          <input
                            type="range"
                            min="5"
                            max="10"
                            value={simEpochs}
                            onChange={(e) => setSimEpochs(Number(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-2"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>5 epochs</span>
                            <span className="text-white font-bold">{simEpochs} epochs</span>
                            <span>10 epochs</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ) : null}

                {/* SIMULATING COMPUTING WORKSPACE */}
                {(simulating || simHistory.length > 0) ? (
                  <div className="flex flex-col gap-6">
                    
                    {/* TELEMETRY HEADS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Active Epoch</span>
                        <span className="text-lg font-bold text-white mt-1 block">
                          {simEpoch} / {simEpochs}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">mAP Accuracy</span>
                        <span className="text-lg font-bold text-emerald-400 mt-1 block">
                          {simHistory.length ? simHistory[simHistory.length - 1].mAP.toFixed(3) : "0.000"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">GPU UTILIZATION</span>
                        <span className="text-lg font-bold text-amber-400 mt-1 block">
                          {simGpuUtil}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">GPU VRAM LOAD</span>
                        <span className="text-lg font-bold text-white mt-1 block">
                          {simGpuVram.toFixed(1)} GB
                        </span>
                      </div>
                    </div>

                    {/* LIVE CHARTS VIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Live Chart 1: Metrics */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-2">Live Epoch Convergence Curves</span>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={simHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="epoch" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} name="Loss" dot={false} />
                              <Line type="monotone" dataKey="mAP" stroke="#10b981" strokeWidth={2} name="mAP" dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Live Chart 2: System */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block mb-2">Live Hardware GPU Telemetry</span>
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={simHistory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="epoch" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Line type="monotone" dataKey="gpuTemp" stroke="#f97316" strokeWidth={1.5} name="Temp °C" dot={false} />
                              <Line type="monotone" dataKey="gpuUtil" stroke="#eab308" strokeWidth={1.5} name="Util %" dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>

                    {/* LIVE LOG STREAM */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-800 pb-2 mb-2 font-mono">
                        Bash Console Output Stream
                      </span>
                      <div className="font-mono text-[10px] text-emerald-400/90 leading-relaxed h-40 overflow-y-auto flex flex-col gap-1">
                        {simLogs.map((log, index) => (
                          <div key={index} className={log.includes("[TRAIN]") ? "text-emerald-400" : log.includes("[SYSTEM]") ? "text-blue-400" : "text-white"}>
                            {log}
                          </div>
                        ))}
                        <div ref={terminalEndRef} />
                      </div>
                    </div>

                  </div>
                ) : null}

              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3">
                {!simulating && simHistory.length === 0 ? (
                  <>
                    <button
                      onClick={() => setShowSimulateModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startSimulation}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 animate-pulse" />
                      Boot Compute Node
                    </button>
                  </>
                ) : simulating ? (
                  <div className="w-full flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 animate-pulse text-indigo-400 font-semibold font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      RUN TRAINING NODE COMPUTING ACTIVE...
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Kill active run?")) {
                          setSimulating(false);
                          setShowSimulateModal(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Kill Run
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowSimulateModal(false);
                      setActiveSubTab("details");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close & Review Ledger
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
