import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Cpu,
  Zap,
  Server,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  Gauge,
  Play,
  RotateCw,
  HardDrive,
  Flame,
  ShieldCheck,
  Code2,
  Box,
  Workflow
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
  Legend
} from "recharts";

interface GPUHardwareSpec {
  id: string;
  name: string;
  architecture: string;
  vramGb: number;
  tensorCores: number;
  fp16Tflops: number;
  interconnect: string;
  activeCount: number;
  status: "ONLINE" | "STANDBY" | "TRAINING";
  utilizationPct: number;
  tempCelsius: number;
}

interface FrameworkRuntime {
  id: string;
  name: string;
  version: string;
  badgeColor: string;
  keyFeatures: string[];
  status: "ACTIVE" | "READY";
}

const GPU_FLEET: GPUHardwareSpec[] = [
  {
    id: "h100",
    name: "NVIDIA H100 SXM5",
    architecture: "Hopper (Transformer Engine FP8)",
    vramGb: 80,
    tensorCores: 528,
    fp16Tflops: 1979,
    interconnect: "NVLink 900 GB/s",
    activeCount: 64,
    status: "TRAINING",
    utilizationPct: 88.4,
    tempCelsius: 61.2
  },
  {
    id: "a100",
    name: "NVIDIA A100 SXM4",
    architecture: "Ampere Tensor Core",
    vramGb: 80,
    tensorCores: 432,
    fp16Tflops: 312,
    interconnect: "NVLink 600 GB/s",
    activeCount: 32,
    status: "ONLINE",
    utilizationPct: 74.2,
    tempCelsius: 56.8
  },
  {
    id: "l40s",
    name: "NVIDIA L40S Ada",
    architecture: "Ada Lovelace Data Center",
    vramGb: 48,
    tensorCores: 568,
    fp16Tflops: 366,
    interconnect: "PCIe Gen 5 x16",
    activeCount: 16,
    status: "STANDBY",
    utilizationPct: 42.0,
    tempCelsius: 48.5
  },
  {
    id: "rtx4090",
    name: "NVIDIA RTX 4090",
    architecture: "Ada Lovelace (Edge / Dev Node)",
    vramGb: 24,
    tensorCores: 512,
    fp16Tflops: 330,
    interconnect: "PCIe Gen 4 x16",
    activeCount: 8,
    status: "ONLINE",
    utilizationPct: 25.5,
    tempCelsius: 44.1
  }
];

const FRAMEWORK_RUNTIMES: FrameworkRuntime[] = [
  {
    id: "pytorch",
    name: "PyTorch",
    version: "2.4.1 + cu124",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    keyFeatures: ["PyTorch 2.0 TorchCompile", "FSDP v2 (Fully Sharded)", "DDP Distributed", "AMP Autocast BF16"],
    status: "ACTIVE"
  },
  {
    id: "cuda",
    name: "CUDA Toolkit",
    version: "12.6 Update 1",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    keyFeatures: ["Driver 560.35.03", "Compute 9.0 (Hopper)", "Compute 8.0 (Ampere)", "Compute 8.9 (Ada)"],
    status: "ACTIVE"
  },
  {
    id: "cudnn",
    name: "cuDNN",
    version: "9.1.0",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    keyFeatures: ["FlashAttention-2 Fused Kernels", "Conv+BN+ReLU Fusion", "Fused GEMM Bias Matrix", "RNN/LSTM Primitives"],
    status: "ACTIVE"
  },
  {
    id: "tensorrt",
    name: "TensorRT",
    version: "10.1.0.27",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    keyFeatures: ["INT8 Entropy Calibrator 2", "FP16 Kernel Auto-Tuning", "C++ Engine Serialization", "Dynamic Shape Profiles"],
    status: "ACTIVE"
  },
  {
    id: "onnx",
    name: "ONNX Runtime",
    version: "1.18.1",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    keyFeatures: ["TensorrtExecutionProvider", "CUDAExecutionProvider", "Graph Constant Folding", "Cross-Platform Export"],
    status: "ACTIVE"
  }
];

const TELEMETRY_TIME_SERIES = [
  { time: "04:00", h100_util: 82, a100_util: 70, nvlink_gbps: 620, temp_c: 56 },
  { time: "04:03", h100_util: 89, a100_util: 75, nvlink_gbps: 710, temp_c: 59 },
  { time: "04:06", h100_util: 94, a100_util: 78, nvlink_gbps: 840, temp_c: 62 },
  { time: "04:09", h100_util: 88, a100_util: 74, nvlink_gbps: 780, temp_c: 60 },
  { time: "04:12", h100_util: 91, a100_util: 76, nvlink_gbps: 810, temp_c: 61 },
  { time: "04:15", h100_util: 88, a100_util: 74, nvlink_gbps: 760, temp_c: 58 }
];

export const AITrainingInfrastructure: React.FC = () => {
  const [selectedGpu, setSelectedGpu] = useState<string>("h100");
  const [isCompilingTrt, setIsCompilingTrt] = useState(false);
  const [trtLog, setTrtLog] = useState<string[]>([]);
  const [precision, setPrecision] = useState<"FP16" | "INT8">("FP16");
  const [isLaunchingJob, setIsLaunchingJob] = useState(false);
  const [activeJobStatus, setActiveJobStatus] = useState<any>(null);

  const handleCompileTensorRT = () => {
    setIsCompilingTrt(true);
    setTrtLog(["[TensorRT 10.1] Loading PyTorch FX Graph...", "Parsing weights & operators into ONNX opset 18..."]);

    setTimeout(() => {
      setTrtLog(prev => [...prev, "[ONNX Runtime 1.18] Executing Constant Folding & Layer Fusion..."]);
    }, 800);

    setTimeout(() => {
      setTrtLog(prev => [...prev, `[TensorRT 10.1] Auto-tuning 840 kernel candidates on CUDA 12.6 + cuDNN 9.1 for ${precision}...`]);
    }, 1600);

    setTimeout(() => {
      setTrtLog(prev => [
        ...prev,
        `[TensorRT 10.1] Engine successfully compiled into FP16/INT8 binary!`,
        "Latency: 3.4 ms (12.6x Speedup vs PyTorch Eager FP32)",
        "VRAM Footprint: 1,240 MB"
      ]);
      setIsCompilingTrt(false);
    }, 2500);
  };

  const handleLaunchJob = () => {
    setIsLaunchingJob(true);
    setTimeout(() => {
      setActiveJobStatus({
        jobId: `tr-job-${Date.now()}`,
        name: "YOLOv11 Multi-Trade Segmentation (FSDP)",
        fleet: "NVIDIA H100 SXM5 Cluster (64x GPUs)",
        status: "TRAINING_RUNNING",
        epoch: "12 / 100",
        loss: 0.142,
        map50: "94.8%",
        throughput: "4,850 samples/sec"
      });
      setIsLaunchingJob(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              GPU HARDWARE & DEEP LEARNING RUNTIMES
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              9.21 TB CLUSTER VRAM ONLINE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            AI Training & Acceleration Infrastructure
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise GPU Fleet Management (A100, H100, L40S, RTX 4090) with PyTorch 2.4, CUDA 12.6, cuDNN 9.1, TensorRT 10.1 & ONNX Runtime
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCompileTensorRT}
            disabled={isCompilingTrt}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isCompilingTrt ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Compile TensorRT Engine
          </button>
          <button
            onClick={handleLaunchJob}
            disabled={isLaunchingJob}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLaunchingJob ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Launch FSDP Training Job
          </button>
        </div>
      </div>

      {/* GPU Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {GPU_FLEET.map(gpu => {
          const isSelected = selectedGpu === gpu.id;
          return (
            <motion.div
              key={gpu.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedGpu(gpu.id)}
              className={`p-5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? "bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/5"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {gpu.activeCount}x GPUs
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    gpu.status === "TRAINING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                      : gpu.status === "ONLINE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {gpu.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-400" />
                {gpu.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">{gpu.architecture}</p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">VRAM per GPU:</span>
                  <span className="font-semibold text-white">{gpu.vramGb} GB GDDR6X/HBM3</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Interconnect:</span>
                  <span className="font-semibold text-amber-300">{gpu.interconnect}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">FP16 Tensor TFLOPS:</span>
                  <span className="font-semibold text-emerald-400">{gpu.fp16Tflops} TFLOPS</span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-amber-400" /> SM Tensor Core Load
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{gpu.utilizationPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                      style={{ width: `${gpu.utilizationPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Runtimes & Telemetry Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Framework Runtimes Panel */}
        <div className="lg:col-span-1 p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Workflow className="w-5 h-5 text-purple-400" />
            Deep Learning Framework Runtimes
          </h3>

          <div className="space-y-3">
            {FRAMEWORK_RUNTIMES.map(fw => (
              <div
                key={fw.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">{fw.name}</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${fw.badgeColor}`}>
                    {fw.version}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {fw.keyFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Cluster Telemetry Chart & TensorRT Compiler Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Telemetry Chart */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                Live Cluster Telemetry (NVLink Bandwidth & SM Utilization)
              </h3>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> NVLink 900 GB/s Interconnect Operational
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TELEMETRY_TIME_SERIES}>
                  <defs>
                    <linearGradient id="h100Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="a100Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="h100_util" name="H100 Utilization %" stroke="#f59e0b" fillOpacity={1} fill="url(#h100Grad)" />
                  <Area type="monotone" dataKey="a100_util" name="A100 Utilization %" stroke="#10b981" fillOpacity={1} fill="url(#a100Grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TensorRT Engine Quantization Compiler Console */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                TensorRT v10.1 & ONNX Runtime Engine Quantization Workbench
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Precision:</span>
                <button
                  onClick={() => setPrecision("FP16")}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                    precision === "FP16" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  FP16
                </button>
                <button
                  onClick={() => setPrecision("INT8")}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                    precision === "INT8" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  INT8
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 rounded-lg border border-slate-800 min-h-[120px] space-y-1">
              {trtLog.length === 0 ? (
                <div className="text-slate-500 italic flex items-center gap-2">
                  <Box className="w-4 h-4 text-slate-600" />
                  Click "Compile TensorRT Engine" above to trigger PyTorch -&gt; ONNX -&gt; TensorRT quantization pipeline.
                </div>
              ) : (
                trtLog.map((logLine, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-purple-300">
                    <span className="text-purple-500">&gt;</span>
                    {logLine}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Job Modal / Status Card */}
      {activeJobStatus && (
        <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-base font-bold text-white">Active Distributed Training Job: {activeJobStatus.name}</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {activeJobStatus.jobId}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Target Cluster</span>
              <span className="font-semibold text-white">{activeJobStatus.fleet}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Current Epoch</span>
              <span className="font-semibold text-amber-400">{activeJobStatus.epoch}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Validation mAP@50</span>
              <span className="font-semibold text-emerald-400">{activeJobStatus.map50}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Training Throughput</span>
              <span className="font-semibold text-purple-400">{activeJobStatus.throughput}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
