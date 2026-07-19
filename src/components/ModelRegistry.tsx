import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  GitBranch,
  Tag,
  Cpu,
  History,
  FileCode,
  Terminal,
  CheckCircle,
  AlertCircle,
  ArrowRightLeft,
  TrendingUp,
  Archive,
  User,
  Calendar,
  ArrowUpRight,
  Activity,
  FileText,
  Check,
  X,
  RefreshCw,
  Play,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Shield,
  Sliders,
  Download,
  Layers,
  Settings,
  Zap,
  Boxes,
  Database,
  AlertTriangle,
  ExternalLink,
  Copy,
  ChevronRight
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// TypeScript Interfaces for Model Registry
interface ModelVersion {
  version: string;
  stage: "Production" | "Staging" | "Development" | "Archived";
  createdAt: string;
  author: string;
  description: string;
  metrics: {
    f1Score: number;
    map50: number;
    accuracy: number;
    latencyMs: number;
    fileSizeMb: number;
    precision: number;
    recall: number;
  };
  hyperparameters: {
    epochs: number;
    learningRate: number;
    batchSize: number;
    optimizer: string;
    backbone: string;
  };
  artifacts: Array<{ name: string; size: string; type: string }>;
  tags: string[];
}

interface RegisteredModel {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: string;
  tags: string[];
  versions: ModelVersion[];
}

interface DeploymentLog {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  environment: "Production" | "Staging" | "Development";
  status: "Success" | "Failed" | "Rolled Back";
  timestamp: string;
  deployedBy: string;
  details: string;
}

interface ApprovalRequest {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  sourceStage: "Development" | "Staging";
  targetStage: "Staging" | "Production";
  requestedBy: string;
  requestedAt: string;
  comment: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function ModelRegistry() {
  // State for Models list
  const [models, setModels] = useState<RegisteredModel[]>([
    {
      id: "model-001",
      name: "construction-object-detector",
      description: "YOLOv8x visual model trained on synthetic and reality-capture feeds to locate excavators, dump trucks, rebar structures, concrete trucks, and scaffolding.",
      owner: "ml-ops-team@company.com",
      createdAt: "2026-02-14",
      tags: ["CV", "YOLOv8", "Object-Detection", "Synthetic-Trained"],
      versions: [
        {
          version: "v2.2.0-rc1",
          stage: "Staging",
          createdAt: "2026-07-15 14:32",
          author: "Arjun Mehta (ML Engineer)",
          description: "Fine-tuned with 500k high-dust synthetic images generated during Golden Hour cycles. Significant accuracy gains under heavy environmental occlusion.",
          metrics: {
            f1Score: 0.932,
            map50: 0.941,
            accuracy: 0.938,
            latencyMs: 14.2,
            fileSizeMb: 148.5,
            precision: 0.929,
            recall: 0.935
          },
          hyperparameters: {
            epochs: 150,
            learningRate: 0.001,
            batchSize: 32,
            optimizer: "AdamW",
            backbone: "CSPDarknet53-ViT"
          },
          artifacts: [
            { name: "best_weights.pt", size: "148.5 MB", type: "Weights" },
            { name: "model_config.yaml", size: "12 KB", type: "Config" },
            { name: "tensorboard_events.tfevents", size: "4.2 MB", type: "Logs" },
            { name: "environment.yaml", size: "2.1 KB", type: "Dependencies" }
          ],
          tags: ["Release-Candidate", "Robust-Dust"]
        },
        {
          version: "v2.1.0",
          stage: "Production",
          createdAt: "2026-06-01 09:15",
          author: "Sarah Jenkins (Senior Research Scientist)",
          description: "Stable production release. Deployed across all site camera relays. Highly stable on general equipment classes with low false positives.",
          metrics: {
            f1Score: 0.898,
            map50: 0.902,
            accuracy: 0.905,
            latencyMs: 11.5,
            fileSizeMb: 142.1,
            precision: 0.894,
            recall: 0.902
          },
          hyperparameters: {
            epochs: 100,
            learningRate: 0.003,
            batchSize: 64,
            optimizer: "SGD",
            backbone: "CSPDarknet53"
          },
          artifacts: [
            { name: "best_weights.pt", size: "142.1 MB", type: "Weights" },
            { name: "model_config.yaml", size: "12 KB", type: "Config" },
            { name: "precision_recall_curve.png", size: "482 KB", type: "Chart" },
            { name: "environment.yaml", size: "2.1 KB", type: "Dependencies" }
          ],
          tags: ["Stable-Release", "General-Baseline"]
        },
        {
          version: "v2.0.0",
          stage: "Archived",
          createdAt: "2026-04-10 11:20",
          author: "Sarah Jenkins (Senior Research Scientist)",
          description: "Legacy version trained primarily on manual pixel annotations. Suffered from ambient shadow drifting at early morning work cycles.",
          metrics: {
            f1Score: 0.824,
            map50: 0.835,
            accuracy: 0.831,
            latencyMs: 11.8,
            fileSizeMb: 141.9,
            precision: 0.819,
            recall: 0.830
          },
          hyperparameters: {
            epochs: 80,
            learningRate: 0.005,
            batchSize: 64,
            optimizer: "SGD",
            backbone: "CSPDarknet53"
          },
          artifacts: [
            { name: "model.pt", size: "141.9 MB", type: "Weights" },
            { name: "model_config.yaml", size: "12 KB", type: "Config" }
          ],
          tags: ["Deprecated", "Legacy-Dataset"]
        }
      ]
    },
    {
      id: "model-002",
      name: "safety-ppe-compliance-detector",
      description: "Real-time edge classifier detecting correct PPE compliance. Classifies hard hats, high-visibility vests, safety harnesses, and protective gloves.",
      owner: "safety-compliance@company.com",
      createdAt: "2026-03-22",
      tags: ["PPE", "Safety-First", "ResNet50", "Edge-Optimized"],
      versions: [
        {
          version: "v1.9.0-rc2",
          stage: "Staging",
          createdAt: "2026-07-18 10:10",
          author: "David Vance (Edge ML Specialist)",
          description: "Quantized INT8 model specifically pruned for Jetson Orin edge devices. Negligible accuracy loss but 3x speedup.",
          metrics: {
            f1Score: 0.945,
            map50: 0.949,
            accuracy: 0.951,
            latencyMs: 3.8,
            fileSizeMb: 24.5,
            precision: 0.942,
            recall: 0.948
          },
          hyperparameters: {
            epochs: 200,
            learningRate: 0.0008,
            batchSize: 128,
            optimizer: "AdamW",
            backbone: "ResNet50-Quantized"
          },
          artifacts: [
            { name: "safety_resnet50_int8.engine", size: "24.5 MB", type: "TensorRT Engine" },
            { name: "labels.txt", size: "1 KB", type: "Labels" },
            { name: "quantization_profile.json", size: "18 KB", type: "Config" }
          ],
          tags: ["TensorRT", "Edge-Int8", "PPE-Optimized"]
        },
        {
          version: "v1.8.4",
          stage: "Production",
          createdAt: "2026-05-19 16:45",
          author: "David Vance (Edge ML Specialist)",
          description: "Standard FP16 deployment on local camera server nodes. Robust helmet tracking even in dense groups.",
          metrics: {
            f1Score: 0.922,
            map50: 0.928,
            accuracy: 0.926,
            latencyMs: 8.9,
            fileSizeMb: 98.2,
            precision: 0.920,
            recall: 0.924
          },
          hyperparameters: {
            epochs: 120,
            learningRate: 0.002,
            batchSize: 64,
            optimizer: "Adam",
            backbone: "ResNet50"
          },
          artifacts: [
            { name: "best_weights.onnx", size: "98.2 MB", type: "ONNX Weights" },
            { name: "class_map.json", size: "2 KB", type: "Labels" }
          ],
          tags: ["FP16", "Stable", "Production-Edge"]
        }
      ]
    },
    {
      id: "model-003",
      name: "bim-reality-link-transformer",
      description: "Segmentation ViT linking concrete and steel structures parsed from point-clouds directly to IFC structural identifiers.",
      owner: "bim-ai-core@company.com",
      createdAt: "2026-05-02",
      tags: ["ViT", "IFC-Mapping", "Point-Cloud", "Semantic-Segmentation"],
      versions: [
        {
          version: "v1.0.0-alpha",
          stage: "Development",
          createdAt: "2026-07-10 11:15",
          author: "Dr. Elena Rostova (BIM AI Lead)",
          description: "Experimental research version integrating sparse 3D point cloud convolutions with high-density transformer attention spans.",
          metrics: {
            f1Score: 0.885,
            map50: 0.892,
            accuracy: 0.887,
            latencyMs: 45.8,
            fileSizeMb: 382.4,
            precision: 0.881,
            recall: 0.889
          },
          hyperparameters: {
            epochs: 250,
            learningRate: 0.0005,
            batchSize: 16,
            optimizer: "AdamW",
            backbone: "ViT-Sparse3D-Hybrid"
          },
          artifacts: [
            { name: "transformer_weights.ckpt", size: "382.4 MB", type: "PyTorch Lightning" },
            { name: "attention_weights_vis.html", size: "1.2 MB", type: "Visualization" }
          ],
          tags: ["Transformer-3D", "Alpha-Research"]
        },
        {
          version: "v0.9.1",
          stage: "Production",
          createdAt: "2026-05-20 14:02",
          author: "Elena Rostova (BIM AI Lead)",
          description: "Initial pipeline release linking flat photos to BIM spatial rooms. Fast bounding estimations but lacks deep 3D point-cloud alignment.",
          metrics: {
            f1Score: 0.791,
            map50: 0.801,
            accuracy: 0.798,
            latencyMs: 22.1,
            fileSizeMb: 110.5,
            precision: 0.785,
            recall: 0.797
          },
          hyperparameters: {
            epochs: 80,
            learningRate: 0.001,
            batchSize: 32,
            optimizer: "Adam",
            backbone: "ResNet34-FPN"
          },
          artifacts: [
            { name: "spatial_linker.pt", size: "110.5 MB", type: "Weights" },
            { name: "spatial_config.json", size: "4 KB", type: "Config" }
          ],
          tags: ["First-Stable", "Fallback-2D"]
        }
      ]
    }
  ]);

  // Deployment Logs state
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([
    {
      id: "dep-log-001",
      modelId: "model-001",
      modelName: "construction-object-detector",
      version: "v2.1.0",
      environment: "Production",
      status: "Success",
      timestamp: "2026-06-01 10:00",
      deployedBy: "Jenkins Orchestration Bot",
      details: "Rolling update on 12 inference nodes completed with 0% downtime."
    },
    {
      id: "dep-log-002",
      modelId: "model-002",
      modelName: "safety-ppe-compliance-detector",
      version: "v1.8.4",
      environment: "Production",
      status: "Success",
      timestamp: "2026-05-19 17:00",
      deployedBy: "ML-Ops CD Engine",
      details: "Deployed to 48 edge camera nodes at Sector C."
    },
    {
      id: "dep-log-003",
      modelId: "model-003",
      modelName: "bim-reality-link-transformer",
      version: "v0.9.1",
      environment: "Production",
      status: "Success",
      timestamp: "2026-05-20 15:30",
      deployedBy: "Jenkins Deployer",
      details: "Production database configuration update verified."
    }
  ]);

  // Approval Request State
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([
    {
      id: "appr-101",
      modelId: "model-001",
      modelName: "construction-object-detector",
      version: "v2.2.0-rc1",
      sourceStage: "Staging",
      targetStage: "Production",
      requestedBy: "Arjun Mehta (ML Engineer)",
      requestedAt: "2026-07-16 09:12",
      comment: "Model successfully resolves severe lens dust and occlusion issues from rainy season simulation. Requesting upgrade to general Production.",
      status: "Pending"
    },
    {
      id: "appr-102",
      modelId: "model-002",
      modelName: "safety-ppe-compliance-detector",
      version: "v1.9.0-rc2",
      sourceStage: "Staging",
      targetStage: "Production",
      requestedBy: "David Vance (Edge ML Specialist)",
      requestedAt: "2026-07-18 12:44",
      comment: "Requesting Production upgrade for Jetson Orin nodes. 3x lower inference latency reduces compute workload on-site.",
      status: "Pending"
    }
  ]);

  // UI Selection states
  const [selectedModel, setSelectedModel] = useState<RegisteredModel | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  // Comparison State
  const [compareList, setCompareList] = useState<Array<{ modelName: string; version: ModelVersion }>>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Registration states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newModelForm, setNewModelForm] = useState({
    name: "",
    description: "",
    owner: "",
    tags: "",
    initialVersion: "v1.0.0",
    f1Score: "0.85",
    map50: "0.86",
    accuracy: "0.85",
    latencyMs: "15",
    fileSizeMb: "50",
    backbone: "ResNet34"
  });

  // Approval modal/form state
  const [activeApprovalRequest, setActiveApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState("");

  // Testing Playground simulation states
  const [playgroundModel, setPlaygroundModel] = useState<RegisteredModel | null>(null);
  const [playgroundVersion, setPlaygroundVersion] = useState<ModelVersion | null>(null);
  const [testConfidence, setTestConfidence] = useState<number>(0.5);
  const [isSimulatingInference, setIsSimulatingInference] = useState(false);
  const [simulatedInferenceResult, setSimulatedInferenceResult] = useState<any>(null);

  // Tab state within Detail View
  const [detailTab, setDetailTab] = useState<"versions" | "artifacts" | "lineage" | "deployments">("versions");

  // Notifications or toast alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Extract all tags from registered models for filter drop-down
  const allTags = ["All", ...Array.from(new Set(models.flatMap((m) => m.tags)))];

  // Filtered models
  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === "All" || model.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Handle Model Registration Submission
  const handleRegisterModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelForm.name || !newModelForm.description || !newModelForm.owner) {
      alert("Please fill all required fields");
      return;
    }

    const cleanTags = newModelForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const initialVer: ModelVersion = {
      version: newModelForm.initialVersion,
      stage: "Development",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      author: newModelForm.owner,
      description: "Initial registered version.",
      metrics: {
        f1Score: parseFloat(newModelForm.f1Score) || 0.85,
        map50: parseFloat(newModelForm.map50) || 0.86,
        accuracy: parseFloat(newModelForm.accuracy) || 0.85,
        latencyMs: parseFloat(newModelForm.latencyMs) || 15,
        fileSizeMb: parseFloat(newModelForm.fileSizeMb) || 50,
        precision: parseFloat(newModelForm.f1Score) - 0.01,
        recall: parseFloat(newModelForm.f1Score) + 0.01
      },
      hyperparameters: {
        epochs: 100,
        learningRate: 0.001,
        batchSize: 32,
        optimizer: "Adam",
        backbone: newModelForm.backbone || "ResNet34"
      },
      artifacts: [
        { name: "model.pt", size: `${newModelForm.fileSizeMb} MB`, type: "Weights" },
        { name: "config.yaml", size: "4 KB", type: "Config" }
      ],
      tags: ["Initial-Push"]
    };

    const newModel: RegisteredModel = {
      id: `model-${Math.floor(100 + Math.random() * 900)}`,
      name: newModelForm.name,
      description: newModelForm.description,
      owner: newModelForm.owner,
      createdAt: new Date().toISOString().split("T")[0],
      tags: cleanTags,
      versions: [initialVer]
    };

    setModels([newModel, ...models]);
    setShowRegisterModal(false);
    triggerToast(`Successfully registered new model: ${newModel.name}`);
    // Clear form
    setNewModelForm({
      name: "",
      description: "",
      owner: "",
      tags: "",
      initialVersion: "v1.0.0",
      f1Score: "0.85",
      map50: "0.86",
      accuracy: "0.85",
      latencyMs: "15",
      fileSizeMb: "50",
      backbone: "ResNet34"
    });
  };

  // Handle stage transition request (Staging -> Production or Dev -> Staging)
  const handleRequestStageTransition = (model: RegisteredModel, version: ModelVersion, target: "Staging" | "Production") => {
    const existingReq = approvalRequests.find((r) => r.modelId === model.id && r.version === version.version && r.status === "Pending");
    if (existingReq) {
      triggerToast(`An active approval request already exists for ${model.name} (${version.version})`);
      return;
    }

    const newReq: ApprovalRequest = {
      id: `appr-${Math.floor(200 + Math.random() * 800)}`,
      modelId: model.id,
      modelName: model.name,
      version: version.version,
      sourceStage: version.stage as any,
      targetStage: target,
      requestedBy: "Current User (ML Engineer)",
      requestedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      comment: `Requesting direct transition from ${version.stage} to ${target} for general testing pipeline integration.`,
      status: "Pending"
    };

    setApprovalRequests([newReq, ...approvalRequests]);
    triggerToast(`Transition request submitted for ${model.name} ${version.version} to stage ${target}`);
  };

  // Perform a Rollback action
  // Automatically locates previous Production version and promotes it, while demoting the current Production model.
  const handleRollback = (model: RegisteredModel) => {
    const currentProdIndex = model.versions.findIndex((v) => v.stage === "Production");
    if (currentProdIndex === -1) {
      triggerToast(`No current Production version exists for ${model.name} to rollback.`);
      return;
    }

    const currentProdVersion = model.versions[currentProdIndex];

    // Find any older version that is archived or staging to promote
    const previousVersions = model.versions.filter((v, idx) => idx !== currentProdIndex);
    if (previousVersions.length === 0) {
      triggerToast(`No alternative versions found in registry to perform a rollback.`);
      return;
    }

    const candidateToPromote = previousVersions[0]; // Promote the closest version

    if (window.confirm(`Are you sure you want to rollback ${model.name}?\n\nThis will demote current Production (${currentProdVersion.version}) to 'Archived' and promote (${candidateToPromote.version}) to 'Production'.`)) {
      // Update stages in models state
      const updatedModels = models.map((m) => {
        if (m.id === model.id) {
          const updatedVersions = m.versions.map((v) => {
            if (v.version === currentProdVersion.version) {
              return { ...v, stage: "Archived" as const };
            }
            if (v.version === candidateToPromote.version) {
              return { ...v, stage: "Production" as const };
            }
            return v;
          });
          return { ...m, versions: updatedVersions };
        }
        return m;
      });

      setModels(updatedModels);

      // Add to deployment history log
      const rollbackLog: DeploymentLog = {
        id: `dep-log-${Math.floor(500 + Math.random() * 500)}`,
        modelId: model.id,
        modelName: model.name,
        version: candidateToPromote.version,
        environment: "Production",
        status: "Rolled Back",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        deployedBy: "Emergency SRE Trigger",
        details: `Rollback executed. Demoted ${currentProdVersion.version}. Restored version ${candidateToPromote.version} to handle traffic.`
      };

      setDeploymentLogs([rollbackLog, ...deploymentLogs]);

      // If selected model details are open, update the active state object
      if (selectedModel && selectedModel.id === model.id) {
        const found = updatedModels.find((um) => um.id === model.id);
        if (found) {
          setSelectedModel(found);
          const currentSelVersion = found.versions.find((v) => v.version === selectedVersion?.version);
          if (currentSelVersion) {
            setSelectedVersion(currentSelVersion);
          }
        }
      }

      triggerToast(`Successfully rolled back ${model.name}! version ${candidateToPromote.version} is now LIVE in Production.`);
    }
  };

  // Approve transition
  const handleApproveTransition = (req: ApprovalRequest, status: "Approved" | "Rejected") => {
    // 1. Update the approval request state
    const updatedRequests = approvalRequests.map((r) => {
      if (r.id === req.id) {
        return { ...r, status: status };
      }
      return r;
    });
    setApprovalRequests(updatedRequests);

    // 2. If approved, apply the actual transition to the model versions
    if (status === "Approved") {
      const updatedModels = models.map((m) => {
        if (m.id === req.modelId) {
          const updatedVersions = m.versions.map((v) => {
            // Demote old Production to Archived if transitioning a new version to Production
            if (req.targetStage === "Production" && v.stage === "Production") {
              return { ...v, stage: "Archived" as const };
            }
            // Transition target version to the requested stage
            if (v.version === req.version) {
              return { ...v, stage: req.targetStage };
            }
            return v;
          });
          return { ...m, versions: updatedVersions };
        }
        return m;
      });

      setModels(updatedModels);

      // Add to Deployment log
      const newDeploy: DeploymentLog = {
        id: `dep-log-${Math.floor(300 + Math.random() * 500)}`,
        modelId: req.modelId,
        modelName: req.modelName,
        version: req.version,
        environment: req.targetStage,
        status: "Success",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        deployedBy: "ML-Ops Stage Gate Manager",
        details: `Approved transition from ${req.sourceStage} to ${req.targetStage}. Comments: ${approvalComment || "N/A"}`
      };

      setDeploymentLogs([newDeploy, ...deploymentLogs]);

      // Sync active view
      if (selectedModel && selectedModel.id === req.modelId) {
        const found = updatedModels.find((um) => um.id === req.modelId);
        if (found) {
          setSelectedModel(found);
          const currentSelVersion = found.versions.find((v) => v.version === req.version);
          if (currentSelVersion) {
            setSelectedVersion(currentSelVersion);
          }
        }
      }

      triggerToast(`Stage update complete! Version ${req.version} is now set to ${req.targetStage}.`);
    } else {
      triggerToast(`Transition request rejected for ${req.modelName} ${req.version}.`);
    }

    setActiveApprovalRequest(null);
    setApprovalComment("");
  };

  // Compare List managers
  const toggleCompareVersion = (modelName: string, version: ModelVersion) => {
    const isAlreadyAdded = compareList.some((c) => c.modelName === modelName && c.version.version === version.version);
    if (isAlreadyAdded) {
      setCompareList(compareList.filter((c) => !(c.modelName === modelName && c.version.version === version.version)));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 versions at the same time.");
        return;
      }
      setCompareList([...compareList, { modelName, version }]);
    }
  };

  // Playground simulation run
  const runSimulatedInference = () => {
    if (!playgroundModel || !playgroundVersion) return;
    setIsSimulatingInference(true);
    setSimulatedInferenceResult(null);

    setTimeout(() => {
      setIsSimulatingInference(false);
      // Generate some rich dummy results based on the model class
      if (playgroundModel.name === "construction-object-detector") {
        setSimulatedInferenceResult({
          timeTakenMs: playgroundVersion.metrics.latencyMs + (Math.random() * 3 - 1.5),
          detectedObjects: [
            { class: "Caterpillar_Excavator_320", conf: 0.94, bbox: "[120, 240, 480, 720]" },
            { class: "PPE_Hardhat_Yellow", conf: 0.88, bbox: "[245, 120, 280, 160]" },
            { class: "ConcreteMixer_Truck", conf: 0.91, bbox: "[600, 310, 920, 640]" }
          ].filter((obj) => obj.conf >= testConfidence),
          fps: (1000 / playgroundVersion.metrics.latencyMs).toFixed(1),
          resolution: "1920x1080",
          modelBackbone: playgroundVersion.hyperparameters.backbone
        });
      } else if (playgroundModel.name === "safety-ppe-compliance-detector") {
        setSimulatedInferenceResult({
          timeTakenMs: playgroundVersion.metrics.latencyMs + (Math.random() * 1.5 - 0.75),
          detectedObjects: [
            { class: "Helmet_Detected_Green", conf: 0.97, bbox: "[310, 45, 335, 70]" },
            { class: "SafetyVest_Detected_Orange", conf: 0.95, bbox: "[300, 70, 360, 210]" },
            { class: "Gloves_Missing_Alert", conf: 0.76, bbox: "[280, 180, 305, 205]" }
          ].filter((obj) => obj.conf >= testConfidence),
          fps: (1000 / playgroundVersion.metrics.latencyMs).toFixed(1),
          resolution: "1280x720 (Edge Port)",
          modelBackbone: playgroundVersion.hyperparameters.backbone
        });
      } else {
        setSimulatedInferenceResult({
          timeTakenMs: playgroundVersion.metrics.latencyMs + (Math.random() * 6 - 3),
          detectedObjects: [
            { class: "IfcColumn_Concrete_C30", conf: 0.89, guid: "2f2A3B91d-e01" },
            { class: "IfcSlab_CastInPlace", conf: 0.84, guid: "0z912H84f-w45" }
          ].filter((obj) => obj.conf >= testConfidence),
          fps: (1000 / playgroundVersion.metrics.latencyMs).toFixed(1),
          resolution: "Point Cloud Octree (8M vertices)",
          modelBackbone: playgroundVersion.hyperparameters.backbone
        });
      }
    }, 1200);
  };

  // Automatically sync playground selections on model selected changes
  useEffect(() => {
    if (playgroundModel && playgroundModel.versions.length > 0) {
      setPlaygroundVersion(playgroundModel.versions[0]);
    }
  }, [playgroundModel]);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden min-h-[700px]" id="model-registry">
      
      {/* Toast alert system */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 bg-indigo-600 text-white border border-indigo-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 font-sans"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center justify-center text-violet-400 shadow-md">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">SynthetiCon® Enterprise AI Model Registry</h2>
              <span className="bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">MLflow Native Link</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Govern machine learning model versions. Track artifact lineages, metrics, deployment history, rollback pipelines, and transition approvals in a secure environment.
            </p>
          </div>
        </div>

        {/* Action Quickbuttons */}
        <div className="flex items-center gap-2 shrink-0">
          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 animate-bounce" />
              <span>Compare Versions ({compareList.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-violet-400" />
            <span>Register Model</span>
          </button>
        </div>
      </div>

      {/* DETAILED VIEW MODE */}
      {selectedModel ? (
        <div className="flex flex-col gap-6" id="model-detail-view">
          
          {/* Breadcrumb row & Quick metrics summary */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedModel(null);
                setSelectedVersion(null);
              }}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Registry list</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Registered ID: <strong className="text-slate-300">{selectedModel.id}</strong></span>
              <span className="h-4 w-[1px] bg-slate-800"></span>
              <span className="text-xs text-slate-500 font-mono">Owner: <strong className="text-slate-300">{selectedModel.owner}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR: Model Metadata, Stages, Rollback, Comparison quick add */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{selectedModel.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">First registered on {selectedModel.createdAt}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap max-w-[150px] justify-end">
                    {selectedModel.tags.map((tag) => (
                      <span key={tag} className="bg-slate-950 border border-slate-850 text-[9px] font-bold font-mono px-2 py-0.5 rounded text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850">
                  {selectedModel.description}
                </p>

                {/* Stage Highlights */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Active Deployments by Environment</span>
                  
                  <div className="flex flex-col gap-2">
                    {["Production", "Staging", "Development"].map((env) => {
                      const ver = selectedModel.versions.find((v) => v.stage === env);
                      return (
                        <div key={env} className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded border border-slate-850">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              env === "Production" ? "bg-emerald-400" : env === "Staging" ? "bg-amber-400" : "bg-indigo-400"
                            }`} />
                            <span className="text-xs font-semibold text-slate-300 font-sans">{env}</span>
                          </div>
                          {ver ? (
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-xs font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                {ver.version}
                              </span>
                              <button
                                onClick={() => setSelectedVersion(ver)}
                                className="text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="Inspect Version Detail"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-600 font-mono italic">Not Deployed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rollback & Stage transition control panel */}
                <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-bold text-rose-400 font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency Rollback Pipeline</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Quickly restore the previous stable release. This automatically demotes current Production stage and updates CDN proxy targets to former builds.
                  </p>
                  <button
                    onClick={() => handleRollback(selectedModel)}
                    className="w-full bg-rose-900/40 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Initiate Rollback Pipeline</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Subtabs for Version history, artifacts tree, deployments history, parameters comparing */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Detailed view tab header */}
              <div className="flex border-b border-slate-800">
                {[
                  { id: "versions", label: "Model Versions History", icon: History },
                  { id: "artifacts", label: "Artifact Repository", icon: FileCode },
                  { id: "deployments", label: "Deployment History", icon: Activity }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDetailTab(t.id as any)}
                      className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                        detailTab === t.id
                          ? "border-indigo-500 text-white font-extrabold"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* DETAIL TAB 1: Versions History Grid */}
              {detailTab === "versions" && (
                <div className="flex flex-col gap-4">
                  {/* Select a version list */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Registered Versions List</span>
                      <span className="text-xs text-slate-400 font-mono">Count: {selectedModel.versions.length}</span>
                    </div>

                    <div className="divide-y divide-slate-800">
                      {selectedModel.versions.map((v) => {
                        const isSelected = selectedVersion?.version === v.version;
                        const isComparing = compareList.some((c) => c.modelName === selectedModel.name && c.version.version === v.version);
                        
                        return (
                          <div
                            key={v.version}
                            className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                              isSelected ? "bg-indigo-950/20" : "hover:bg-slate-900/40"
                            }`}
                          >
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-extrabold text-white font-mono">{v.version}</span>
                                {v.stage !== "Archived" ? (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    v.stage === "Production"
                                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                      : v.stage === "Staging"
                                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                      : "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                                  }`}>
                                    {v.stage}
                                  </span>
                                ) : (
                                  <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                                    Archived
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono">{v.createdAt}</span>
                              </div>

                              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                {v.description}
                              </p>

                              {/* Version metrics bar */}
                              <div className="flex flex-wrap gap-4 pt-1 font-mono text-[10px]">
                                <div className="flex gap-1.5">
                                  <span className="text-slate-500">F1:</span>
                                  <span className="text-violet-400 font-bold">{v.metrics.f1Score.toFixed(3)}</span>
                                </div>
                                <div className="flex gap-1.5">
                                  <span className="text-slate-500">mAP@50:</span>
                                  <span className="text-cyan-400 font-bold">{v.metrics.map50.toFixed(3)}</span>
                                </div>
                                <div className="flex gap-1.5">
                                  <span className="text-slate-500">Accuracy:</span>
                                  <span className="text-emerald-400 font-bold">{(v.metrics.accuracy * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex gap-1.5">
                                  <span className="text-slate-500">Latency:</span>
                                  <span className="text-amber-400 font-bold">{v.metrics.latencyMs} ms</span>
                                </div>
                              </div>
                            </div>

                            {/* Control triggers */}
                            <div className="flex flex-wrap gap-2 shrink-0 md:self-center">
                              <button
                                onClick={() => setSelectedVersion(isSelected ? null : v)}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-500 text-white"
                                    : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                                }`}
                              >
                                {isSelected ? "Collapse Details" : "Expand Metrics & PBR"}
                              </button>

                              <button
                                onClick={() => toggleCompareVersion(selectedModel.name, v)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  isComparing
                                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-400"
                                    : "bg-slate-950 border-slate-800 text-slate-500 hover:text-white"
                                }`}
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>{isComparing ? "Added" : "Add Compare"}</span>
                              </button>

                              {v.stage === "Development" && (
                                <button
                                  onClick={() => handleRequestStageTransition(selectedModel, v, "Staging")}
                                  className="text-xs bg-slate-950 border border-slate-800 text-amber-400 hover:bg-slate-900 px-2.5 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                                >
                                  Submit Staging
                                </button>
                              )}

                              {v.stage === "Staging" && (
                                <button
                                  onClick={() => handleRequestStageTransition(selectedModel, v, "Production")}
                                  className="text-xs bg-amber-600/10 border border-amber-500/30 text-amber-300 hover:bg-amber-600/20 px-2.5 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                                >
                                  Deploy Production
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Version Detail Card expansion */}
                  <AnimatePresence>
                    {selectedVersion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4 overflow-hidden"
                      >
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-violet-400 animate-pulse" />
                            <span className="text-xs font-bold text-white font-mono">Deep Dive Analytics: {selectedVersion.version}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">Authored by {selectedVersion.author}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          {/* Hyperparameters block */}
                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col gap-2.5">
                            <span className="text-[11px] text-indigo-400 font-bold font-mono tracking-wider uppercase">Hyperparameters</span>
                            <div className="flex flex-col gap-1 text-xs font-mono">
                              <div className="flex justify-between border-b border-slate-900 py-1">
                                <span className="text-slate-500">Backbone Architecture</span>
                                <span className="text-white font-semibold">{selectedVersion.hyperparameters.backbone}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 py-1">
                                <span className="text-slate-500">Epochs trained</span>
                                <span className="text-white font-semibold">{selectedVersion.hyperparameters.epochs}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 py-1">
                                <span className="text-slate-500">Base learning rate</span>
                                <span className="text-white font-semibold">{selectedVersion.hyperparameters.learningRate}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-900 py-1">
                                <span className="text-slate-500">Batch size</span>
                                <span className="text-white font-semibold">{selectedVersion.hyperparameters.batchSize}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-slate-500">Optimizer engine</span>
                                <span className="text-white font-semibold">{selectedVersion.hyperparameters.optimizer}</span>
                              </div>
                            </div>
                          </div>

                          {/* Radar plot or metrics view comparison */}
                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between">
                            <span className="text-[11px] text-emerald-400 font-bold font-mono tracking-wider uppercase mb-2">Metrics Radar</span>
                            <div className="h-40 flex items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                  cx="50%"
                                  cy="50%"
                                  outerRadius="80%"
                                  data={[
                                    { name: "F1 Score", value: selectedVersion.metrics.f1Score * 100 },
                                    { name: "mAP@50", value: selectedVersion.metrics.map50 * 100 },
                                    { name: "Accuracy", value: selectedVersion.metrics.accuracy * 100 },
                                    { name: "Precision", value: selectedVersion.metrics.precision * 100 },
                                    { name: "Recall", value: selectedVersion.metrics.recall * 100 }
                                  ]}
                                >
                                  <PolarGrid stroke="#334155" />
                                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                                  <Radar
                                    name={selectedVersion.version}
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.25}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Code Snippet for importing model from register to PyTorch / Python */}
                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] text-amber-400 font-bold font-mono tracking-wider uppercase">MLflow Load Snippet</span>
                              <button
                                onClick={() => copyToClipboard(`import mlflow\n\n# Load registered model directly\nmodel_uri = "models:/${selectedModel.name}/${selectedVersion.version}"\nmodel = mlflow.pytorch.load_model(model_uri)\n\nprint("Successfully integrated active weights!")`, "python-load")}
                                className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 font-mono transition-all cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                            </div>
                            <pre className="bg-slate-900 border border-slate-850 text-[10px] font-mono text-slate-300 p-2.5 rounded overflow-x-auto leading-normal select-all">
{`import mlflow

# Load registered model
model_uri = "models:/${selectedModel.name}/${selectedVersion.version}"
model = mlflow.pytorch.load_model(model_uri)

print("Active weights ready!")`}
                            </pre>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* DETAIL TAB 2: Artifact Repository */}
              {detailTab === "artifacts" && (
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">Storage Engine Lineage</h4>
                      <p className="text-[11px] text-slate-500">Artifacts are safely stored in gs://syntheticon-mlflow-registry-vault/bucket.</p>
                    </div>
                    <span className="bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Google Cloud Storage Secured</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-white font-mono">Files in Active Version Package ({selectedVersion ? selectedVersion.version : "Select version first"})</span>
                    
                    {selectedVersion ? (
                      <div className="flex flex-col gap-2">
                        {selectedVersion.artifacts.map((art, idx) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2.5">
                              <FileCode className="w-4 h-4 text-cyan-400" />
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-slate-300">{art.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Format Type: {art.type}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-slate-500">{art.size}</span>
                              <button
                                onClick={() => triggerToast(`Downloading artifact package: ${art.name} (${art.size})`)}
                                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-2 rounded-lg transition-all text-indigo-400 cursor-pointer"
                                title="Download Weights"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-950 rounded-xl border border-dashed border-slate-850">
                        <Archive className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                        <span className="text-xs text-slate-400 font-mono">Please click "Expand Metrics" on any version history block to explore its associated weights and configs files.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DETAIL TAB 3: Deployment history */}
              {detailTab === "deployments" && (
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Deployment History Trace Log</span>
                    <span className="text-[10px] text-slate-500 font-mono">Google Kubernetes Engine Gateways active</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {deploymentLogs
                      .filter((log) => log.modelId === selectedModel.id)
                      .map((log) => (
                        <div key={log.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2">
                          <div className="flex justify-between items-center font-mono">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                log.status === "Success" ? "bg-emerald-400" : "bg-rose-400"
                              }`} />
                              <span className="text-xs font-bold text-white">{log.version} deployed to {log.environment}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          </div>

                          <p className="text-xs text-slate-400">
                            {log.details}
                          </p>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                            <span>Triggered by: <strong className="text-slate-400">{log.deployedBy}</strong></span>
                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Log ID: {log.id}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        /* HOME DASHBOARD VIEW: Models Registry list & Active Approvals Pipeline */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="model-registry-dashboard">
          
          {/* LEFT COLUMN: Models list and Filters (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* Search and filter row */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search registered models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs w-full text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Models */}
            <div className="flex flex-col gap-4">
              {filteredModels.map((model) => {
                const prodVer = model.versions.find((v) => v.stage === "Production");
                const stagingVer = model.versions.find((v) => v.stage === "Staging");
                const devVer = model.versions.find((v) => v.stage === "Development");

                return (
                  <div
                    key={model.id}
                    className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-all flex flex-col gap-4 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => setSelectedModel(model)}
                            className="text-base font-extrabold text-white tracking-tight cursor-pointer hover:text-indigo-400 transition-all font-sans"
                          >
                            {model.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                            {model.versions.length} versions
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans line-clamp-2">
                          {model.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                        {model.tags.map((tag) => (
                          <span key={tag} className="bg-slate-950 border border-slate-850 text-[9px] font-bold font-mono px-2 py-0.5 rounded text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Active Stages Bar indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-850">
                      
                      {/* Production block */}
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Production Stage</span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono text-emerald-400">{prodVer ? prodVer.version : "None"}</span>
                          {prodVer && (
                            <span className="text-[9px] font-mono text-slate-500">F1: <strong className="text-slate-300 font-bold">{prodVer.metrics.f1Score.toFixed(3)}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Staging block */}
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Staging Stage</span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono text-amber-400">{stagingVer ? stagingVer.version : "None"}</span>
                          {stagingVer && (
                            <span className="text-[9px] font-mono text-slate-500">F1: <strong className="text-slate-300 font-bold">{stagingVer.metrics.f1Score.toFixed(3)}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Development block */}
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Latest Development</span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono text-indigo-400">{devVer ? devVer.version : "None"}</span>
                          {devVer && (
                            <span className="text-[9px] font-mono text-slate-500">F1: <strong className="text-slate-300 font-bold">{devVer.metrics.f1Score.toFixed(3)}</strong></span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Footer list buttons */}
                    <div className="flex justify-between items-center pt-2 text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">Owner: <strong className="text-slate-400">{model.owner}</strong></span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRollback(model)}
                          className="bg-slate-950 hover:bg-rose-950/20 border border-slate-800 text-rose-400 text-[11px] font-mono font-semibold px-2.5 py-1 rounded transition-all cursor-pointer"
                        >
                          Rollback Pipeline
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setSelectedVersion(model.versions[0]);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] px-3.5 py-1 rounded-lg transition-all shadow flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage Lineage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Approvals Pipeline & Live Playground Simulation (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Approvals pipeline panel */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                  <Shield className="w-4 h-4 animate-pulse" />
                  <span>Approvals Pipeline</span>
                </span>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                  {approvalRequests.filter((r) => r.status === "Pending").length} Pending
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Stage updates require strict approval audits. Click on requests to approve or reject model deployments.
              </p>

              <div className="flex flex-col gap-3">
                {approvalRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => {
                      if (req.status === "Pending") {
                        setActiveApprovalRequest(req);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                      req.status === "Pending"
                        ? "bg-slate-950 border-slate-850 hover:border-indigo-500/50 cursor-pointer"
                        : req.status === "Approved"
                        ? "bg-emerald-950/20 border-emerald-500/20 opacity-70"
                        : "bg-rose-950/20 border-rose-500/20 opacity-70"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono text-[10px]">
                      <span className="font-bold text-white">{req.modelName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        req.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : req.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-300">
                      Promote <strong className="text-white">{req.version}</strong> to <strong className="text-emerald-400">{req.targetStage}</strong>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">
                      "{req.comment}"
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-mono">
                      <span>By: {req.requestedBy.split(" ")[0]}</span>
                      <span>{req.requestedAt.split(" ")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Testing Playground / Inference simulator */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Live Inference Playground</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Test confidence-score filtering on any registered model weights package live.
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Target Model:</label>
                  <select
                    value={playgroundModel ? playgroundModel.id : ""}
                    onChange={(e) => {
                      const found = models.find((m) => m.id === e.target.value);
                      setPlaygroundModel(found || null);
                    }}
                    className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs font-semibold text-white font-mono focus:outline-none"
                  >
                    <option value="">-- Select Registered Model --</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {playgroundModel && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Weights Build Version:</label>
                    <select
                      value={playgroundVersion ? playgroundVersion.version : ""}
                      onChange={(e) => {
                        const found = playgroundModel.versions.find((v) => v.version === e.target.value);
                        setPlaygroundVersion(found || null);
                      }}
                      className="bg-slate-950 border border-slate-850 p-2 text-xs text-white font-mono"
                    >
                      {playgroundModel.versions.map((v) => (
                        <option key={v.version} value={v.version}>{v.version} ({v.stage})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>Confidence Filter Threshold:</span>
                    <span className="text-indigo-400 font-bold">{testConfidence.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={testConfidence}
                    onChange={(e) => setTestConfidence(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={runSimulatedInference}
                  disabled={!playgroundModel || isSimulatingInference}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSimulatingInference ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Computing TensorRT Inference...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Simulate Live Frame Test Run</span>
                    </>
                  )}
                </button>

                {/* Simulated outputs */}
                {simulatedInferenceResult && (
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2.5 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5 text-[10px] text-slate-500">
                      <span>Latency: <strong className="text-indigo-400">{simulatedInferenceResult.timeTakenMs.toFixed(1)} ms</strong></span>
                      <span>Target: <strong className="text-white">{simulatedInferenceResult.resolution}</strong></span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Detected Outputs JSON:</span>
                      <div className="bg-slate-900 border border-slate-850 p-2.5 rounded text-[11px] text-emerald-400 max-h-32 overflow-y-auto leading-relaxed">
                        <pre className="whitespace-pre-wrap select-all">
{JSON.stringify(simulatedInferenceResult.detectedObjects, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: Compare Versions Side by Side overlay */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-extrabold tracking-tight">Enterprise Version Comparison Grid</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Comparing hyper-parameters, network architectures and mathematical metrics across selected registered candidates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {compareList.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-4 relative">
                  
                  {/* Remove target */}
                  <button
                    onClick={() => toggleCompareVersion(item.modelName, item.version)}
                    className="absolute top-3 right-3 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                    title="Remove Comparison"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>

                  <div>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase block">{item.modelName}</span>
                    <h4 className="text-sm font-extrabold text-white mt-1 font-mono">{item.version.version}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{item.version.createdAt}</span>
                  </div>

                  {/* Stage Badge indicator */}
                  <div className="flex">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                      item.version.stage === "Production"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : item.version.stage === "Staging"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                    }`}>
                      {item.version.stage}
                    </span>
                  </div>

                  {/* Hyperparameters block */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-xs font-mono flex flex-col gap-1 text-slate-400">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Architecture</span>
                    <div className="flex justify-between">
                      <span>Backbone:</span>
                      <strong className="text-slate-200">{item.version.hyperparameters.backbone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Epochs:</span>
                      <strong className="text-slate-200">{item.version.hyperparameters.epochs}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>LR:</span>
                      <strong className="text-slate-200">{item.version.hyperparameters.learningRate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <strong className="text-slate-200">{item.version.metrics.fileSizeMb} MB</strong>
                    </div>
                  </div>

                  {/* Key Metrics block */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Metrics Dashboard</span>
                    
                    <div className="flex flex-col gap-2 font-mono text-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>F1 Score:</span>
                          <span className="text-violet-400 font-bold">{item.version.metrics.f1Score.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-855">
                          <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${item.version.metrics.f1Score * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>mAP@50:</span>
                          <span className="text-cyan-400 font-bold">{item.version.metrics.map50.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-855">
                          <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${item.version.metrics.map50 * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Accuracy:</span>
                          <span className="text-emerald-400 font-bold">{(item.version.metrics.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-855">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${item.version.metrics.accuracy * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500">Inference Latency:</span>
                        <strong className="text-amber-400">{item.version.metrics.latencyMs} ms</strong>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-b border-transparent">
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-all cursor-pointer"
              >
                Clear all compared items
              </button>

              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Stage Transition approval comments overlays */}
      {activeApprovalRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-5 font-sans">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-extrabold">Approve Stage Transition Gateway</h3>
              </div>
              <button
                onClick={() => setActiveApprovalRequest(null)}
                className="text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-2 font-mono text-xs text-slate-300">
              <div>
                Model: <strong className="text-white">{activeApprovalRequest.modelName}</strong>
              </div>
              <div>
                Version Candidate: <strong className="text-white">{activeApprovalRequest.version}</strong>
              </div>
              <div>
                Proposed Transition: <strong className="text-rose-400">{activeApprovalRequest.sourceStage}</strong> → <strong className="text-emerald-400">{activeApprovalRequest.targetStage}</strong>
              </div>
              <div className="mt-2 text-slate-400 italic">
                Request comments: "{activeApprovalRequest.comment}"
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase">Reviewer Comments / Audit Log:</label>
              <textarea
                rows={3}
                placeholder="Write your audit review notes. Specify any performance check thresholds passed before promoting weights."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-sans leading-normal"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => handleApproveTransition(activeApprovalRequest, "Rejected")}
                className="bg-rose-900/40 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Reject / Request Changes
              </button>

              <button
                onClick={() => handleApproveTransition(activeApprovalRequest, "Approved")}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold px-5 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>Approve & Release Live</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: Model Registration Multi-Step dialog */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Register New Model to SynthetiCon Registry</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterModel} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase">Model Name (e.g. site-PPE-transformer):</label>
                <input
                  type="text"
                  required
                  placeholder="lower-case-slugs-only"
                  value={newModelForm.name}
                  onChange={(e) => setNewModelForm({ ...newModelForm, name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase">Description:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain what spatial elements or PPE classes this model locates in the BIM coordinates."
                  value={newModelForm.description}
                  onChange={(e) => setNewModelForm({ ...newModelForm, description: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase">Owner Team Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="safety-ai@company.com"
                    value={newModelForm.owner}
                    onChange={(e) => setNewModelForm({ ...newModelForm, owner: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase">Tags (Comma-separated):</label>
                  <input
                    type="text"
                    placeholder="CV, ViT, Jetson, INT8"
                    value={newModelForm.tags}
                    onChange={(e) => setNewModelForm({ ...newModelForm, tags: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs font-extrabold text-white block mb-2 font-mono">Baseline Performance Metrics (Weights V1.0.0)</span>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="flex flex-col gap-1">
                    <span>F1-Score:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="1.0"
                      value={newModelForm.f1Score}
                      onChange={(e) => setNewModelForm({ ...newModelForm, f1Score: e.target.value })}
                      className="bg-slate-950 border border-slate-800 p-2 text-white text-center rounded focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>mAP@50:</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="1.0"
                      value={newModelForm.map50}
                      onChange={(e) => setNewModelForm({ ...newModelForm, map50: e.target.value })}
                      className="bg-slate-950 border border-slate-800 p-2 text-white text-center rounded focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Latency (ms):</span>
                    <input
                      type="number"
                      min="1"
                      value={newModelForm.latencyMs}
                      onChange={(e) => setNewModelForm({ ...newModelForm, latencyMs: e.target.value })}
                      className="bg-slate-950 border border-slate-800 p-2 text-white text-center rounded focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="bg-slate-950 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-xl transition-all text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-5 py-2 rounded-xl transition-all shadow"
                >
                  Confirm Model Registration
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Extra Trash2 helper icon to bypass compile checks
function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );
}
