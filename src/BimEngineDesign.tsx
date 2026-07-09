import React, { useState, useEffect } from "react";
import {
  Compass,
  Database,
  Layers,
  Sliders,
  Workflow,
  Cpu,
  GitBranch,
  Check,
  Play,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Info,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Scale,
  Binary,
  Plus,
  Minus
} from "lucide-react";

// Types for BIM Tech Spec
interface TechSpec {
  id: string;
  name: string;
  category: "Client-side" | "Server-side" | "Standard Schema" | "Design Authoring";
  version: string;
  role: string;
  pros: string[];
  cons: string[];
  bestUse: string;
  architectureDetails: string;
}

// 5 Core Supported Technologies Specs
const BIM_TECH_DATA: TechSpec[] = [
  {
    id: "ifc_js",
    name: "IFC.js",
    category: "Client-side",
    version: "v2.4.0 (WASM Engine)",
    role: "On-the-fly client-side parsing and lightweight model previewing directly inside standard browser environments.",
    pros: [
      "No server-side rendering or cloud subscription costs required.",
      "Reads raw .ifc text files on-the-fly using highly optimized WebAssembly threads.",
      "Integrates cleanly with standard WebGL, Three.js, and React components."
    ],
    cons: [
      "Struggles with extremely large files (>200MB) due to browser memory limits.",
      "Parsing complex Constructive Solid Geometry (CSG) cuts can cause main thread frame-drops."
    ],
    bestUse: "Interactive client-facing web overlays, lightweight progress viewing, and quick on-site model inspections.",
    architectureDetails: "WASM-compiled C++ core executes parallel parsing of ISO-10303 structures, sending optimized float coordinate arrays directly to Three.js buffer geometries."
  },
  {
    id: "xeokit",
    name: "xeokit SDK",
    category: "Client-side",
    version: "v3.2.0 (Double-Precision)",
    role: "High-performance visualization engine optimized for dense enterprise-grade 3D model renderings and detailed geometric navigation.",
    pros: [
      "Supports native 64-bit double-precision floating-point coordinate math (avoids WebGL jitter at large coordinates).",
      "Excellent visibility management, occlusion culling, and camera frustum frame-rate optimizations.",
      "Provides rich APIs for clipping planes, measurement tools, and semantic coloring."
    ],
    cons: [
      "Requires proprietary binary pre-processing (.xkt format) of models before browser loading.",
      "Steeper learning curve and larger runtime library footprint than raw Three.js."
    ],
    bestUse: "Heavy construction managers, mega-projects, and MEP-dense facility operations dashboards where geometric precision is critical.",
    architectureDetails: "Ingests custom pre-optimized binary .xkt assets. Renders elements utilizing instanced buffers, hierarchical bounding volumes, and camera occlusion querying."
  },
  {
    id: "aps",
    name: "Autodesk Platform Services (APS)",
    category: "Server-side",
    version: "v7.x (Forge SDK)",
    role: "Enterprise cloud translation pipeline and web viewer SDK for native Autodesk designs (Revit, AutoCAD, Navisworks).",
    pros: [
      "Flawless fidelity of native Revit (.rvt) model assets and structural parameters.",
      "Cloud Model Derivative API automatically handles coordinate extraction, 2D sheet extraction, and SVF2 optimization.",
      "Industry standard with extensive document management features."
    ],
    cons: [
      "High subscription costs (Autodesk Cloud Credits) based on ingestion volumes.",
      "Model data is stored on Autodesk servers, presenting data sovereignty challenges for high-security projects.",
      "Tightly locked into Autodesk ecosystems."
    ],
    bestUse: "Complex projects starting with rich, multi-trade Revit models where full metadata fidelity and drawing extraction are mandatory.",
    architectureDetails: "Proprietary cloud pipeline translates RVT to SVF2 (highly instanced vector streams), with a client-side WebGL Viewer SDK utilizing custom streaming protocols."
  },
  {
    id: "revit",
    name: "Autodesk Revit",
    category: "Design Authoring",
    version: "2025 (Native RVT)",
    role: "The principal desktop BIM authoring and design environment where structural, architectural, and mechanical schedules are compiled.",
    pros: [
      "Rich object-oriented parametric modeling environment.",
      "Industry-standard tool for architects, MEP engineers, and structural detailers.",
      "Comprehensive API (C# .NET) for custom parameter injections and batch exports."
    ],
    cons: [
      "Desktop-locked heavy Windows application with no native web rendering capacity.",
      "Proprietary, closed file format requiring complex translation servers to operate on the web."
    ],
    bestUse: "Designing, scheduling, and editing the original architectural and structural models prior to construction ingestion.",
    architectureDetails: "Operates as the primary upstream data source. Exported via .ifc or integrated via Autodesk APS Model Derivative translation queues."
  },
  {
    id: "ifc",
    name: "Industry Foundation Classes (IFC)",
    category: "Standard Schema",
    version: "IFC4 (ISO 16739-1)",
    role: "The universal, open-source data schema and exchange format ensuring seamless software interoperability across various authoring platforms.",
    pros: [
      "Open, non-proprietary specification backed by buildingSMART.",
      "Comprehensive, object-oriented schema mapping physical objects, properties, relationships, and temporal stages.",
      "Human-readable STEP physical file format allows raw diagnostic text parsing."
    ],
    cons: [
      "Large file footprints with verbose ASCII cross-referencing schemas.",
      "Potential loss of custom parametric constraints during export from proprietary design tools."
    ],
    bestUse: "Universal interoperability framework, open-source archiving, and standard file integrations.",
    architectureDetails: "Express-based object-oriented schema. Represents geometric configurations via boundary representations (B-Rep) or CSG swept solid entities."
  }
];

export default function BimEngineDesign() {
  const [selectedTechId, setSelectedTechId] = useState<string>("ifc_js");
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("import");

  // State for Subsystem 1: Import Pipeline
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importStatus, setImportStatus] = useState<"idle" | "ingesting" | "parsing" | "indexing" | "completed">("idle");
  const [importLogs, setImportLogs] = useState<string[]>([
    "System standby. Ready to ingest model upload.",
    "Awaiting IFC or RVT file stream."
  ]);

  // State for Subsystem 2: Geometry Extraction
  const [geomType, setGeomType] = useState<"wall" | "column" | "slab" | "pipe">("wall");

  // State for Subsystem 3: Element Mapping
  const [mapNode, setMapNode] = useState<string>("node_wall_1");

  // State for Subsystem 4: Coordinate Alignment
  const [alignX, setAlignX] = useState<number>(12.5);
  const [alignY, setAlignY] = useState<number>(24.8);
  const [alignZ, setAlignZ] = useState<number>(5.2);
  const [alignScale, setAlignScale] = useState<number>(1.000);
  const [alignYaw, setAlignYaw] = useState<number>(35.0); // rotation in degrees

  // State for Subsystem 5: Spatial Indexing (Octree depth)
  const [bimSpatialLevels, setBimSpatialLevels] = useState<number>(2);

  // State for Subsystem 6: Model Versioning
  const [selectedCommit, setSelectedCommit] = useState<string>("c3");

  // State for Subsystem 7: BIM Comparison Engine
  const [compModelA, setCompModelA] = useState<string>("v1_0");
  const [compModelB, setCompModelB] = useState<string>("v1_1");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareCompleted, setCompareCompleted] = useState<boolean>(false);

  // State for Subsystem 8: Progress Matching
  const [bimProgressOverlap, setBimProgressOverlap] = useState<number>(75);

  // Run Ingestion Simulation
  const handleRunImport = () => {
    if (importStatus !== "idle" && importStatus !== "completed") return;
    
    setImportStatus("ingesting");
    setImportProgress(10);
    setImportLogs([
      "▶ Ingestion started: Received multi-part model upload request (raw payload: 184MB)",
      "[STAGE 1/4] Writing raw block streams to cloud-accessible S3 cache segment...",
      "└─ S3 URI: s3://buildtrace-vault/incoming/model_first_floor_draft_rev4.ifc"
    ]);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step === 2) {
        setImportStatus("parsing");
        setImportProgress(40);
        setImportLogs(prev => [
          ...prev,
          "▶ Ingestion parsing initiated: Initializing WebAssembly-accelerated parser thread pool...",
          "[STAGE 2/4] ISO 10303-21 STEP physical file parser active (8 CPU cores claimed)",
          "├─ Extracted project header metadata successfully (Schema: IFC4_ADD2)",
          "├─ Found 11,240 entity definitions (IfcWall, IfcSlab, IfcColumn, IfcPipe, etc.)",
          "└─ Traversing spatial hierarchy tree (IfcProject -> IfcSite -> IfcBuilding -> IfcBuildingStorey)..."
        ]);
      } else if (step === 3) {
        setImportStatus("indexing");
        setImportProgress(75);
        setImportLogs(prev => [
          ...prev,
          "▶ Geometry Extraction & Spatial Indexing active...",
          "[STAGE 3/4] Running Constructive Solid Geometry (CSG) swept solids mesh triangulations...",
          "├─ Triangulated 4,120 concrete mesh entities (1.8M faces generated)",
          "├─ Triangulated 2,410 mechanical MEP objects",
          "├─ Building spatial division map (3D Octree with max-depth = 6 levels)",
          "└─ Resolving topological boundary representation loops (IfcHalfSpaceSolid, IfcBooleanResult)..."
        ]);
      } else if (step === 4) {
        setImportStatus("completed");
        setImportProgress(100);
        setImportLogs(prev => [
          ...prev,
          "▶ Finalizing DB storage mapping operations...",
          "[STAGE 4/4] Writing structured property sets to PostgreSQL and indexing in Drizzle ORM...",
          "├─ Generated stable relational UUID mappings for 11,240 IFC GUIDs",
          "├─ Resolved 87 visual material color presets (Pset_WallCommon.ThermalTransmittance etc.)",
          "├─ Compressing triangle meshes into custom binary compression format (.btb mesh)",
          "🎉 Model ingestion pipeline COMPLETED in 3.6s. Interactive viewer hydrated successfully!"
        ]);
        clearInterval(interval);
      }
    }, 1200);
  };

  // Run Compare Simulation
  const handleRunCompare = () => {
    if (isComparing) return;
    setIsComparing(true);
    setCompareCompleted(false);
    setTimeout(() => {
      setIsComparing(false);
      setCompareCompleted(true);
    }, 1600);
  };

  // Alignment Calculation helpers
  const getAlignmentMatrix = () => {
    const yawRad = (alignYaw * Math.PI) / 180;
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    
    // Homogenous 4x4 matrix representation values
    const m00 = (alignScale * cosY).toFixed(4);
    const m01 = (-alignScale * sinY).toFixed(4);
    const m03 = alignX.toFixed(2);
    const m10 = (alignScale * sinY).toFixed(4);
    const m11 = (alignScale * cosY).toFixed(4);
    const m13 = alignY.toFixed(2);
    const m22 = alignScale.toFixed(4);
    const m23 = alignZ.toFixed(2);

    return { m00, m01, m03, m10, m11, m13, m22, m23 };
  };

  const getTransformedCoords = () => {
    const yawRad = (alignYaw * Math.PI) / 180;
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);

    // Compute transformed point assuming local input was (1.0, 1.0, 0.0)
    const localX = 5.0;
    const localY = 5.0;
    const localZ = 0.0;

    const transformedX = alignScale * (localX * cosY - localY * sinY) + alignX;
    const transformedY = alignScale * (localX * sinY + localY * cosY) + alignY;
    const transformedZ = alignScale * localZ + alignZ;

    // Converted global coordinates (represented in UTM Easting, Northing)
    // Arbitrary base UTM anchor: Easting 435000.00, Northing 2105000.00
    const easting = (435000.00 + transformedX).toFixed(3);
    const northing = (2105000.00 + transformedY).toFixed(3);
    const elevation = (100.00 + transformedZ).toFixed(3);

    return { easting, northing, elevation };
  };

  const selectedTech = BIM_TECH_DATA.find(t => t.id === selectedTechId) || BIM_TECH_DATA[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in text-slate-300 w-full">
      
      {/* LEFT COLUMN: Technology support profiles (4 columns) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Core Tech Support Roles Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Supported BIM Technologies
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              BuildTrace natively supports open standard Schemas, design authoring file translation, and client-side high-throughput 3D model streaming web view engines.
            </p>
          </div>

          {/* Buttons List */}
          <div className="flex flex-col gap-1.5">
            {BIM_TECH_DATA.map(tech => {
              const isActive = selectedTechId === tech.id;
              return (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTechId(tech.id)}
                  className={`text-left px-3.5 py-3 rounded-lg border text-xs transition duration-150 flex items-center justify-between relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500/80 text-white shadow-md"
                      : "bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                  <div className="flex flex-col">
                    <span className="font-bold">{tech.name}</span>
                    <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider mt-0.5">
                      {tech.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isActive ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}>
                    {tech.version.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tech Profile Details */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                {selectedTech.name} Architecture Role
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedTech.role}
            </p>

            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Key Advantages:
              </span>
              <ul className="flex flex-col gap-1.5 pl-2">
                {selectedTech.pros.map((pro, i) => (
                  <li key={i} className="text-[10px] text-slate-300 leading-relaxed relative pl-3.5">
                    <span className="absolute left-0 text-emerald-400 font-bold">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Limiting Factors:
              </span>
              <ul className="flex flex-col gap-1 pl-2">
                {selectedTech.cons.map((con, i) => (
                  <li key={i} className="text-[10px] text-slate-400 leading-relaxed relative pl-3.5">
                    <span className="absolute left-0 text-red-500 font-bold">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-800 pt-2.5 mt-1.5 text-[10px] text-indigo-300 bg-indigo-950/15 border border-indigo-900/30 p-2.5 rounded-lg">
              <span className="font-bold block mb-0.5 text-indigo-200">Optimal Use Case:</span>
              {selectedTech.bestUse}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: 8 Core Subsystems Navigation & Details (8 columns) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Subsystem Navigation Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-1.5">
          {[
            { id: "import", label: "Import Pipeline", icon: Workflow },
            { id: "geometry", label: "Geometry Extraction", icon: Cpu },
            { id: "mapping", label: "Element Mapping", icon: Database },
            { id: "alignment", label: "Coordinate Alignment", icon: Sliders },
            { id: "spatial", label: "Spatial Indexing", icon: Compass },
            { id: "versioning", label: "Model Versioning", icon: GitBranch },
            { id: "comparison", label: "Comparison Engine", icon: Scale },
            { id: "matching", label: "Progress Matching", icon: CheckCircle }
          ].map(sub => {
            const SubIcon = sub.icon;
            const isActive = selectedSubsystem === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubsystem(sub.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <SubIcon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Spec Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
          
          {/* 1. IMPORT PIPELINE */}
          {selectedSubsystem === "import" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 01 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">BIM Import & Ingestion Pipeline</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ingests physical model design files (.ifc, .rvt) and compiles structural object coordinates, spatial hierarchical nodes, and semantic property sets into our relational database.
                </p>
              </div>

              {/* Interactive Simulation Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase">Live Pipeline Sandbox</span>
                  </div>
                  <button
                    onClick={handleRunImport}
                    disabled={importStatus !== "idle" && importStatus !== "completed"}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition ${
                      importStatus !== "idle" && importStatus !== "completed"
                        ? "bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger Model Import</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Ingestion Progress:</span>
                    <span className="font-mono text-indigo-300">{importProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>

                {/* Simulated Log console */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Ingestion Thread Output Monitor
                  </span>
                  <div className="h-[180px] bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto flex flex-col gap-1.5 leading-relaxed relative">
                    <span className="absolute right-2 top-2 text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold uppercase border border-slate-800">
                      thread_worker_01
                    </span>
                    {importLogs.map((log, i) => (
                      <div key={i} className={
                        log.startsWith("🎉") ? "text-emerald-300 font-bold" :
                        log.startsWith("▶") ? "text-indigo-300 font-bold" : "text-slate-300"
                      }>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Algorithmic Explanation */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-1.5">
                  Algorithmic Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-lg">
                    <h5 className="font-bold text-white mb-1">1. STEP ISO-10303 Parse Algorithm</h5>
                    <p className="text-slate-400 text-[11px]">
                      The engine parses the raw STEP physical file linearly. A custom tokenized Lexer identifies individual IFC entity tags (e.g. <code>#240=IFCWALL(...)</code>). It stores references in an efficient direct-access index table mapping node IDs to offset byte counts, optimizing entity retrieval to $O(1)$.
                    </p>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-lg">
                    <h5 className="font-bold text-white mb-1">2. DAG Spatial Resolver</h5>
                    <p className="text-slate-400 text-[11px]">
                      Builds a Directed Acyclic Graph (DAG) of building spatial containment relationships. By traversing inverse attributes (e.g. <code>IfcRelContainedInSpatialStructure</code>), the pipeline builds an in-memory spatial tree. It resolves absolute structural origins recursively by cascading relative local offsets.
                    </p>
                  </div>
                </div>
              </div>

              {/* UML Architecture Diagram */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                  BIM Ingestion Pipeline UML Workflow Topology
                </span>
                <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl border border-slate-800 font-mono text-[9px] overflow-x-auto leading-relaxed">
{` [Design Client] ──(.rvt / .ifc)──> [Ingestion API Gateway] (BullMQ job enqueued)
                                                │
    ┌───────────────────────────────────────────┴──────────────────────────────────────────┐
    ▼ (WebAssembly Threads)                                                                ▼ (APS Deriv API)
 [IFC.js Parser Worker]                                                                 [Autodesk Cloud]
    │                                                                                      │
    ├── STEP Physical file tokenizer & mapping                                            ├── RVT parse queue
    ├── Traverses topological relationships                                                ├── Translates geometry to SVF2
    └── Extracts property set data tables                                                 └── Parameter schema dump
    │                                                                                      │
    └───────────────────────────────────────────┬──────────────────────────────────────────┘
                                                ▼
                             [Geometric Triangulation Engine]
                                                │ (Ear Clipping & Swept Solids extrusion)
                                                ▼
                             [Spatial Indexer & Bounding Box solver]
                                                │ (3D Octree space division)
                                                ▼
                             [Drizzle DB Commit / PostgreSQL Stable Storage]`}
                </pre>
              </div>
            </div>
          )}

          {/* 2. GEOMETRY EXTRACTION */}
          {selectedSubsystem === "geometry" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 02 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">Geometry Extraction & Tessellation Engine</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Processes analytical mathematical geometries defined in IFC schemas (like extrusions, bounding boxes, swept profiles) and converts them into optimized triangular mesh arrays suitable for GPU execution.
                </p>
              </div>

              {/* Interactive Component */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase">Tessellation Inspector Sandbox</span>
                  <p className="text-[11px] text-slate-500">
                    Select an element category to observe how the geometric compiler translates raw analytical data into GPU buffers.
                  </p>
                </div>

                {/* Selector */}
                <div className="grid grid-cols-4 gap-2">
                  {(["wall", "column", "slab", "pipe"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setGeomType(type)}
                      className={`py-2 px-1 rounded-lg text-center text-xs border font-bold uppercase tracking-wider transition ${
                        geomType === type
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Display outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: Raw entity */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                      Analytical Schema Block
                    </span>
                    <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto select-all leading-normal">
                      {geomType === "wall" && (
`#240=IFCWALLSTANDARDCASE('2vXvI$zB5...',$,'Wall-Concrete-300',$,$,#250,#280);
#250=IFCLOCALPLACEMENT(#120,#245);
#280=IFCPRODUCTDEFINITIONSHAPE($,$,(#270));
#270=IFCSHAPEREPRESENTATION(#80,'Body','SweptSolid',(#265));
#265=IFCEXTRUDEDAREASOLID(#260,#262,#264,3000.0);
#260=IFCRECTANGLEPROFILEDEF(.AREA.,$,#258,300.0,6000.0);`
                      )}
                      {geomType === "column" && (
`#320=IFCCOLUMN('1pAsE_xB12Be...',$,'Col-C30-Circular',$,$,#330,#360);
#360=IFCPRODUCTDEFINITIONSHAPE($,$,(#350));
#350=IFCSHAPEREPRESENTATION(#80,'Body','SweptSolid',(#345));
#345=IFCEXTRUDEDAREASOLID(#340,#262,#264,4200.0);
#340=IFCCIRCLEPROFILEDEF(.AREA.,$,#338,400.0);`
                      )}
                      {geomType === "slab" && (
`#410=IFCSLAB('3wRtY_xL55Ce...',$,'Slab-Concrete-200',$,$,#420,#450);
#450=IFCPRODUCTDEFINITIONSHAPE($,$,(#440));
#440=IFCSHAPEREPRESENTATION(#80,'Body','CSG',(#435));
#435=IFCBOOLEANCLIPPINGRESULT(.DIFFERENCE.,#430,#432);
#430=IFCEXTRUDEDAREASOLID(#428,#262,#264,200.0);`
                      )}
                      {geomType === "pipe" && (
`#550=IFCFLOWSEGMENT('0hYtR_xK88We...',$,'MEP-Pipe-Copper-100',$,$,#560,#590);
#590=IFCPRODUCTDEFINITIONSHAPE($,$,(#580));
#580=IFCSHAPEREPRESENTATION(#80,'Body','SweptDiskSolid',(#575));
#575=IFCSWEPTDISKSOLID(#570,100.0,50.0,0.0,1.0);`
                      )}
                    </pre>
                  </div>

                  {/* Right: Triangulated mesh data */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col gap-2.5 justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Tessellated Mesh Buffer
                      </span>
                      
                      <div className="flex flex-col gap-1.5 mt-3 text-[11px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-500">Extrusion Depth:</span>
                          <span className="font-mono text-white">
                            {geomType === "wall" ? "3000.0 mm" : (geomType === "column" ? "4200.0 mm" : (geomType === "slab" ? "200.0 mm" : "Continuous path"))}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-500">WebGL Vertex Array Size:</span>
                          <span className="font-mono text-indigo-300">
                            {geomType === "wall" ? "144 floats" : (geomType === "column" ? "864 floats" : (geomType === "slab" ? "576 floats" : "1,152 floats"))}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-500">Calculated Triangles:</span>
                          <span className="font-mono text-emerald-400">
                            {geomType === "wall" ? "12 faces (Triangles)" : (geomType === "column" ? "128 faces (Triangles)" : (geomType === "slab" ? "48 faces" : "256 faces"))}
                          </span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-500">GPU VRAM footprint:</span>
                          <span className="font-mono text-white">
                            {geomType === "wall" ? "0.57 KB" : (geomType === "column" ? "3.45 KB" : (geomType === "slab" ? "2.30 KB" : "4.60 KB"))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-2 text-[10px] text-slate-400 leading-normal bg-slate-900/40 p-2 rounded">
                      <span className="font-bold block text-white mb-0.5">Triangulation Math:</span>
                      {geomType === "wall" && "Standard swept linear extrusion of a rectangular profile (A = w * l) transformed by local coordinate placement frame."}
                      {geomType === "column" && "Radial point subdivision (N = 32) along the circumference extruded vertically along the local Z axis vector."}
                      {geomType === "slab" && "Planar triangulation of arbitrary bounding polygon boundary loops using standard 'ear clipping' with subtraction masks."}
                      {geomType === "pipe" && "Spine curve swept path computation: circles extruded along coordinate nodes of the mechanical routing path."}
                    </div>
                  </div>

                </div>
              </div>

              {/* Algorithm details */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Boundary Representation (B-Rep) to Mesh Algorithm
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Tessellation of boundary loops requires dividing complex polygons with holes into safe triangles. We use the **Ear Clipping Algorithm**:
                </p>
                <div className="font-mono bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-indigo-300 leading-normal">
                  {`Algorithm TessellatePolygon(Polygon P with holes H):
  1. Let V = vertices of P ordered counter-clockwise (outer boundary).
  2. Let h_i = vertices of holes ordered clockwise (inner boundaries).
  3. Merge holes into outer boundary V by identifying closest visible vertex pairs
     and inserting zero-width bridge diagonals to form a single continuous loop V'.
  4. While length(V') > 3:
     a. For each vertex v_i in V':
        i. If v_i is an 'ear' (convex, and no other vertices of V' lie inside triangle (v_i-1, v_i, v_i+1)):
           - Output triangle (v_i-1, v_i, v_i+1)
           - Remove v_i from V'
           - Restart loop
  5. Output final remaining triangle of V'.`}
                </div>
              </div>
            </div>
          )}

          {/* 3. ELEMENT MAPPING */}
          {selectedSubsystem === "mapping" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 03 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">BIM Element Entity Mapping</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Establishes a stable database map between architectural design identifiers (IFC GUIDs and Revit UniqueIDs) and our internal database schemas. This ensures continuity and avoids duplicate nodes across re-uploads.
                </p>
              </div>

              {/* Interactive Inspector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-200 uppercase">Interactive Node Property Resolver</span>
                
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: "node_wall_1", name: "Wall Block A" },
                    { id: "node_col_2", name: "Structural Col #C4" },
                    { id: "node_mep_3", name: "MEP Supply Duct Branch" }
                  ].map(node => (
                    <button
                      key={node.id}
                      onClick={() => setMapNode(node.id)}
                      className={`p-2 rounded border text-xs text-left transition ${
                        mapNode === node.id
                          ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {node.name}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">IFC GUID Source</span>
                      <span className="bg-slate-900 p-1.5 rounded text-indigo-300 text-[10px] border border-slate-800 truncate">
                        {mapNode === "node_wall_1" ? "2vXvI$zB50BeFfX8yG6d$W" : (mapNode === "node_col_2" ? "0pAsE_xB12BeFfY9wK3d$E" : "3hYtR_xK88WeFfL3mN7a$Q")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Revit UniqueID</span>
                      <span className="bg-slate-900 p-1.5 rounded text-amber-300 text-[10px] border border-slate-800 truncate">
                        {mapNode === "node_wall_1" ? "83a1d9b3-4f9e-4c7a-bfb5-d29b1399-0004c2" : (mapNode === "node_col_2" ? "45b12d93-3c2e-4b7a-aab3-c2839423-0005d4" : "12c56a78-9e1d-4f3b-88cd-a567ef92-0008f1")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Stable DB UUID (PK)</span>
                      <span className="bg-slate-900 p-1.5 rounded text-emerald-400 text-[10px] border border-slate-800 truncate">
                        {mapNode === "node_wall_1" ? "a43bf084-29cb-4d83-8a3d-3b7c40d8bf12" : (mapNode === "node_col_2" ? "b11ef932-132d-42bc-9aa2-4c28109bf443" : "c90cf182-892c-4fa1-88b1-1d37a28cf121")}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                      Parsed Property Set Schema
                    </span>
                    <div className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-[10px] text-slate-300">
                      {mapNode === "node_wall_1" && (
`{
  "Pset_WallCommon": {
    "LoadBearing": true,
    "IsExternal": true,
    "FireRating": "F90",
    "ThermalTransmittance": 0.28
  },
  "PhysicalQuantities": {
    "Length": 6000.0,
    "Thickness": 300.0,
    "Height": 3000.0,
    "Volume": 5.4
  }
}`
                      )}
                      {mapNode === "node_col_2" && (
`{
  "Pset_ColumnCommon": {
    "StructuralEvaluation": true,
    "MaterialGrade": "C30/37 Concrete",
    "RebarRatio": 1.85
  },
  "PhysicalQuantities": {
    "Diameter": 400.0,
    "Height": 4200.0,
    "Volume": 0.528
  }
}`
                      )}
                      {mapNode === "node_mep_3" && (
`{
  "Pset_DuctSegmentTypeCommon": {
    "AirFlowType": "SupplyAir",
    "PressureClass": "MediumPressure",
    "DuctMaterial": "Galvanized Steel"
  },
  "PhysicalQuantities": {
    "Width": 600.0,
    "Height": 400.0,
    "Length": 3200.0
  }
}`
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithmic description */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                  Bidirectional Relational Graph Resolving
                </h4>
                <p className="text-slate-400 mb-2">
                  To prevent orphans and duplicate geometric entities on model re-upload, we employ a **Guid Mapping Resolver (GMR)**.
                </p>
                <ul className="flex flex-col gap-2 text-slate-400 pl-4 list-decimal text-[11px]">
                  <li>
                    <strong className="text-white">Relational Integrity Check:</strong> On file upload, the engine queries the mapping lookup index to see if the combination of <code>IFC_GUID</code> and <code>Revit_UniqueId</code> has an existing record.
                  </li>
                  <li>
                    <strong className="text-white">Cascade-Update Properties:</strong> If a match is found, the engine preserves the original <code>UUID</code> primary key. It checks for property changes, updates the metadata properties block, and preserves historical progress markers.
                  </li>
                  <li>
                    <strong className="text-white">Parent-Child Node Re-wiring:</strong> Automatically updates parent associations (e.g. if the wall is moved to a different storey node).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 4. COORDINATE ALIGNMENT */}
          {selectedSubsystem === "alignment" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 04 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">Global-Local Coordinate Alignment</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transforms building coordinates (usually rendered with localized project origins like <code>0,0,0</code>) into high-precision real-world spatial geometries aligned with global GPS and UTM grids.
                </p>
              </div>

              {/* Interactive coordinate converter */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex flex-col border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase">3D Affine Coordinate Transformer</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure local origin coordinates, scale, and yaw rotation offsets to see the calculated transform matrix and converted global coordinates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sliders X, Y, Z */}
                  <div className="flex flex-col gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850 justify-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Local Translation Origin (M)</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Translation X:</span>
                        <span className="font-mono text-indigo-300">{alignX}m</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="0.5"
                        value={alignX}
                        onChange={(e) => setAlignX(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Translation Y:</span>
                        <span className="font-mono text-indigo-300">{alignY}m</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="0.5"
                        value={alignY}
                        onChange={(e) => setAlignY(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Translation Z:</span>
                        <span className="font-mono text-indigo-300">{alignZ}m</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="50"
                        step="0.5"
                        value={alignZ}
                        onChange={(e) => setAlignZ(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Sliders Scale, Yaw */}
                  <div className="flex flex-col gap-3 bg-slate-950 p-3 rounded-lg border border-slate-850 justify-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Rotation & Scale Settings</span>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Scale Factor:</span>
                        <span className="font-mono text-indigo-300">{alignScale.toFixed(3)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.01"
                        value={alignScale}
                        onChange={(e) => setAlignScale(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Rotation (Yaw):</span>
                        <span className="font-mono text-indigo-300">{alignYaw}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={alignYaw}
                        onChange={(e) => setAlignYaw(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Output Coordinate values */}
                  <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850 justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400">UTM Coordinates (WGS84)</span>
                      
                      {(() => {
                        const coords = getTransformedCoords();
                        return (
                          <div className="flex flex-col gap-1.5 mt-3 text-[11px] font-mono">
                            <div className="flex justify-between border-b border-slate-900 pb-0.5">
                              <span className="text-slate-500">UTM Easting:</span>
                              <span className="text-white font-bold">{coords.easting} m</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-0.5">
                              <span className="text-slate-500">UTM Northing:</span>
                              <span className="text-white font-bold">{coords.northing} m</span>
                            </div>
                            <div className="flex justify-between pb-0.5">
                              <span className="text-slate-500">Elevation:</span>
                              <span className="text-white font-bold">{coords.elevation} m</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <span className="text-[8px] uppercase tracking-wide text-indigo-400 font-bold bg-indigo-950/20 px-2 py-1 rounded text-center border border-indigo-900/40">
                      Calculated on Zone 43N
                    </span>
                  </div>
                </div>

                {/* Transform Matrix display */}
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Output Homogenous transformation Matrix [M]
                  </span>
                  
                  {(() => {
                    const mat = getAlignmentMatrix();
                    return (
                      <div className="grid grid-cols-4 gap-2 bg-slate-950 border border-slate-850 p-3.5 rounded-lg font-mono text-[11px] text-indigo-300 text-center select-all">
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">{mat.m00}</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">{mat.m01}</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 font-bold text-emerald-400">{mat.m03}</div>

                        <div className="bg-slate-900 p-1 rounded border border-slate-800">{mat.m10}</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">{mat.m11}</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 font-bold text-emerald-400">{mat.m13}</div>

                        <div className="bg-slate-900 p-1 rounded border border-slate-800">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 font-bold text-indigo-400">{mat.m22}</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 font-bold text-emerald-400">{mat.m23}</div>

                        <div className="bg-slate-900 p-1 rounded border border-slate-800 text-slate-500">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 text-slate-500">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 text-slate-500">0.0000</div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800 text-slate-500">1.0000</div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Mathematical explanation of algorithms */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2.5 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Binary className="w-4 h-4 text-indigo-400" />
                  Mathematical Rotation & Projection Formulation
                </h4>
                <p className="text-slate-400">
                  To convert an arbitrary local coordinate point P_local = [x, y, z, 1]ᵀ into geographic coordinates, the engine executes a three-dimensional affine transform:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-indigo-200 text-[11px] font-mono leading-normal">
                  {`P_global = T_translation * R_yaw * S_scale * P_local`}
                  <div className="mt-2 text-slate-400 leading-normal">
                    {`Where:
- S_scale: Scale factor matrix diag(s, s, s, 1)
- R_yaw: Rotation around Z axis [cos(θ) -sin(θ) 0 0; sin(θ) cos(θ) 0 0; 0 0 1 0; 0 0 0 1]
- T_translation: Shift offsets dx, dy, dz [1 0 0 dx; 0 1 0 dy; 0 0 1 dz; 0 0 0 1]`}
                  </div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Finally, geographic alignment maps coordinates into regional Mercator projection reference systems (like Universal Transverse Mercator - UTM Zone 43N) by aligning the project origin coordinate parameters to standard benchmark physical GPS geoids.
                </p>
              </div>
            </div>
          )}

          {/* 5. SPATIAL INDEXING */}
          {selectedSubsystem === "spatial" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 05 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">Hierarchical Spatial Indexing</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Divides the physical three-dimensional bounding volume of the building model into structural cells (using Octrees or R-Trees) to allow near-instant geometric queries, collision testing, and camera frustum culling.
                </p>
              </div>

              {/* Interactive Octree Subdivision */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 uppercase">3D Octree Space Partitioner</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Subdivide the model bounding volume recursively.</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBimSpatialLevels(prev => Math.max(1, prev - 1))}
                      disabled={bimSpatialLevels === 1}
                      className="p-1.5 rounded border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 disabled:opacity-45"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white bg-slate-950 border border-slate-800 px-3 py-1 rounded">
                      Depth: {bimSpatialLevels}
                    </span>
                    <button
                      onClick={() => setBimSpatialLevels(prev => Math.min(4, prev + 1))}
                      disabled={bimSpatialLevels === 4}
                      className="p-1.5 rounded border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 disabled:opacity-45"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subdivisions visual simulation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: Interactive spatial tree representation */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col gap-3 justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                      Partitioner Metrics
                    </span>
                    
                    <div className="flex flex-col gap-2.5 text-[11px] text-slate-300">
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Bounding Volume Split Formula:</span>
                        <span className="font-mono text-indigo-300">8^{bimSpatialLevels} cells</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Total Spatial Nodes generated:</span>
                        <span className="font-mono text-white">
                          {bimSpatialLevels === 1 && "8 Leaf Octants"}
                          {bimSpatialLevels === 2 && "64 Leaf Octants"}
                          {bimSpatialLevels === 3 && "512 Leaf Octants"}
                          {bimSpatialLevels === 4 && "4,096 Leaf Octants"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Max Search query cycles:</span>
                        <span className="font-mono text-emerald-400">
                          {bimSpatialLevels === 1 && "O(8) operations"}
                          {bimSpatialLevels === 2 && "O(16) operations"}
                          {bimSpatialLevels === 3 && "O(24) operations"}
                          {bimSpatialLevels === 4 && "O(32) operations"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Memory indexing Overhead:</span>
                        <span className="font-mono text-white">
                          {bimSpatialLevels === 1 && "1.2 KB"}
                          {bimSpatialLevels === 2 && "9.6 KB"}
                          {bimSpatialLevels === 3 && "76.8 KB"}
                          {bimSpatialLevels === 4 && "614.4 KB"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-2.5 rounded text-[10px] text-slate-400 leading-normal border border-slate-800">
                      <span className="font-bold text-white block mb-0.5">Occlusion Query:</span>
                      At Depth {bimSpatialLevels}, camera viewpoint frustum intersects and culls {bimSpatialLevels * 22}% of dense background elements instantly, speeding WebGL frame pipelines to stable 60FPS.
                    </div>
                  </div>

                  {/* Right: Graphic representation matrix */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex flex-col gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">
                      Adaptive Spatial Division Node Chart
                    </span>
                    <div className="h-[140px] bg-slate-900 border border-slate-800 rounded flex flex-col items-center justify-center p-4">
                      {/* Generates adaptive cell representations based on levels */}
                      <div className={`grid gap-1.5 w-full h-full max-w-[120px] max-h-[120px] transition-all duration-300 ${
                        bimSpatialLevels === 1 ? "grid-cols-2 grid-rows-2" : 
                        (bimSpatialLevels === 2 ? "grid-cols-4 grid-rows-4" : "grid-cols-8 grid-rows-8")
                      }`}>
                        {Array.from({ length: bimSpatialLevels === 1 ? 4 : (bimSpatialLevels === 2 ? 16 : 64) }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded transition-all duration-200 border border-indigo-500/20 ${
                              i % 3 === 0 ? "bg-indigo-600/30 border-indigo-400/50 scale-[0.9]" : "bg-slate-950 border-slate-800"
                            }`}
                            title={`Octree Cell #${i}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-center text-slate-500">
                      Interactive division rendering representing active leaf occupancy cells
                    </span>
                  </div>

                </div>
              </div>

              {/* Algorithm Details */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                  Octree 3D Spatial Partitioning Recursive Algorithm
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Recursively subdivides the 3D bounding box (AABB) of structural space until stop conditions are met:
                </p>
                <div className="font-mono bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px] text-indigo-300 leading-normal">
                  {`Algorithm Subdivide(OctreeNode node, List<BIMElement> elements):
  1. If elements.Count <= MaxElementsPerNode (e.g., 20) OR node.Depth >= MaxDepth (e.g., 6):
     node.Elements = elements (Set as leaf node)
     Return

  2. Split node.BoundingBox into 8 equal octant sub-boxes (Oct_0 to Oct_7)
  3. For each octant sub-box Oct_i:
     a. Create child node child_i with bounding box Oct_i and node.Depth + 1
     b. Let child_elements = elements intersecting with Oct_i
     c. If child_elements.Count > 0:
        - Link child_i to node
        - Run Subdivide(child_i, child_elements)`}
                </div>
              </div>
            </div>
          )}

          {/* 6. MODEL VERSIONING */}
          {selectedSubsystem === "versioning" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 06 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">Distributed BIM Model Versioning DAG</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tracks geometry modifications, material properties, and dimensional changes across design revisions and engineering branches using structural cryptographic hashing trees (Merkle DAG).
                </p>
              </div>

              {/* Interactive Version Timeline */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-200 uppercase">Interactive Design Commit History</span>
                
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-850 relative overflow-hidden select-none">
                  {/* Branch Lines representation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
                  
                  {[
                    { id: "c1", label: "C1", name: "Structural Base", desc: "Original columns upload", date: "June 05" },
                    { id: "c2", label: "C2", name: "MEP Layout", desc: "Added HVAC air terminals", date: "June 12" },
                    { id: "c3", label: "C3", name: "Rev Structural", desc: "Adjusted slab thickness", date: "June 25" },
                    { id: "c4", label: "C4 (Merge)", name: "Coordinated Branch", desc: "Resolved structural clash", date: "July 02" }
                  ].map((commit, index) => {
                    const isActive = selectedCommit === commit.id;
                    return (
                      <button
                        key={commit.id}
                        onClick={() => setSelectedCommit(commit.id)}
                        className={`flex flex-col items-center gap-1.5 z-10 relative transition ${
                          isActive ? "scale-105" : "hover:scale-102"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border-2 transition-all ${
                          isActive
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-500"
                        }`}>
                          {commit.label}
                        </span>
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                            {commit.name}
                          </span>
                          <span className="text-[8px] text-slate-500">{commit.date}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Display active version parameters */}
                {(() => {
                  const details = {
                    c1: { author: "Sarah Jane (Principal Structural)", size: "45.2 MB", entities: "8,410", hash: "sha256:d8ae31bc08...", logs: ["Commited baseline structural IFC file.", "Extracted columns placement matrices.", "Wrote foundational slab geometry vectors."] },
                    c2: { author: "Dave Patel (MEP Specialist)", size: "124.8 MB", entities: "11,210", hash: "sha256:4fe8c21a99...", logs: ["Imported Mechanical mechanical trade model.", "Routed 2,410 linear copper pipelines.", "Linked HVAC ducts with primary spatial zones."] },
                    c3: { author: "Sarah Jane (Principal Structural)", size: "48.1 MB", entities: "8,425", hash: "sha256:9be8cd1223...", logs: ["Modified level 2 slab boundary layout (+20cm thickness).", "Displaced columns along corridor axis.", "Preserved older structural hashes."] },
                    c4: { author: "Dave Patel (Merge Coordinator)", size: "184.2 MB", entities: "19,635", hash: "sha256:a11cf892bc...", logs: ["Resolved physical clash CPVC Pipe vs Column C4.", "Merged Structural Branch into Mechanical design layout.", "Automated system validation and coordinate alignment checks passed."] }
                  }[selectedCommit as "c1" | "c2" | "c3" | "c4"];

                  return (
                    <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-b border-slate-900 pb-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">Author Specialist:</span>
                            <span className="text-slate-200">{details.author}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">Model Payload Size:</span>
                            <span className="text-indigo-300 font-bold">{details.size}</span>
                          </div>
                          <div className="flex justify-between pb-0.5">
                            <span className="text-slate-500">Total IFC Entities:</span>
                            <span className="text-white font-bold">{details.entities}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">Merkle Root Hash:</span>
                            <span className="text-amber-300 truncate font-mono text-[10px] w-48 text-right">{details.hash}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">System State:</span>
                            <span className="text-emerald-400 font-bold">STABLE/VERIFIED</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                          Commit Change Logs
                        </span>
                        <ul className="flex flex-col gap-1 text-[11px] text-slate-300">
                          {details.logs.map((log, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>{log}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Algorithmic Details */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2.5 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Spatial Delta Cryptographic Merkle Tree Algorithm
                </h4>
                <p className="text-slate-400">
                  Instead of storing duplicate full-payload copies of massive 3D models per version, BuildTrace uses **Merkle-DAG trees**.
                </p>
                <ol className="flex flex-col gap-2 text-slate-400 pl-4 list-decimal text-[11px]">
                  <li>
                    <strong className="text-white">Bottom-up geometric hashing:</strong> Individual 3D mesh components are triangulated, stored in binary format, and hashed (H(Geometry) = SHA256(Vertices + Indices)).
                  </li>
                  <li>
                    <strong className="text-white">Hierarchical Parent Hash generation:</strong> Spatial node directories hash their child components (H(Storey) = SHA256(H(Wall_1) + H(Wall_2) + H(Column_1))).
                  </li>
                  <li>
                    <strong className="text-white">O(log N) Delta identification:</strong> To compare versions, the engine checks root hashes. If mismatch, it recursively traverses down only the branches with mismatched child hashes.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* 7. BIM COMPARISON ENGINE */}
          {selectedSubsystem === "comparison" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 07 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">BIM Model Comparison Engine</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Calculates topological and physical variations between design iterations, identifying Added, Modified, or Removed building elements, and mapping spatial differences to cost and timeline metrics.
                </p>
              </div>

              {/* Interactive Comparison Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-200 uppercase">Visual Compare Engine</span>
                    
                    <div className="flex bg-slate-950 border border-slate-850 p-0.5 rounded">
                      <span className="px-2 py-0.5 text-[10px] font-mono text-slate-500">Model A: v1.0</span>
                      <span className="px-1 text-slate-600">→</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono text-indigo-300">Model B: v1.1</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunCompare}
                    disabled={isComparing}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition ${
                      isComparing
                        ? "bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700"
                    }`}
                  >
                    {isComparing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Comparing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Compare Models</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Display delta results */}
                {compareCompleted ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Added */}
                    <div className="bg-slate-950 border border-emerald-900/40 p-3.5 rounded-lg flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Added Elements (+12)
                      </span>
                      <div className="flex flex-col gap-1.5 text-[11px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Duct branch segment:</span>
                          <span className="font-mono font-bold text-emerald-400">#mep_d12</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Structural Column:</span>
                          <span className="font-mono font-bold text-emerald-400">#col_c16</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Volumetric Added:</span>
                          <span>+2.4 m³ Concrete</span>
                        </div>
                      </div>
                    </div>

                    {/* Modified */}
                    <div className="bg-slate-950 border border-yellow-900/40 p-3.5 rounded-lg flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-yellow-400 uppercase font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Modified Elements (3)
                      </span>
                      <div className="flex flex-col gap-1.5 text-[11px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Slab Level 2:</span>
                          <span className="font-mono font-bold text-yellow-400">#slab_s2</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Concrete Wall A:</span>
                          <span className="font-mono font-bold text-yellow-400">#wall_w1</span>
                        </div>
                        <div className="flex justify-between text-yellow-300 text-[10px]">
                          <span>Thickness change:</span>
                          <span>Thickness: +200mm</span>
                        </div>
                      </div>
                    </div>

                    {/* Deleted */}
                    <div className="bg-slate-950 border border-red-900/40 p-3.5 rounded-lg flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-red-400 uppercase font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Removed Elements (-2)
                      </span>
                      <div className="flex flex-col gap-1.5 text-[11px] text-slate-300">
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Plumbing riser:</span>
                          <span className="font-mono font-bold text-red-400">#pipe_p2</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span>Fire protection node:</span>
                          <span className="font-mono font-bold text-red-400">#fire_f1</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Impacted layout:</span>
                          <span>Grid sector 4-B</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[120px] bg-slate-950 border border-slate-850 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Info className="w-6 h-6 text-slate-600 mb-2" />
                    <span>Awaiting compare model trigger sandbox.</span>
                  </div>
                )}
              </div>

              {/* Algorithmic Details */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2.5 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                  Geometric & Parametric Diffing Algorithms
                </h4>
                <p className="text-slate-400">
                  Model comparison operations run a two-pass delta classification:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400 mt-1">
                  <div className="bg-slate-950 p-3 rounded border border-slate-850">
                    <strong className="text-white block mb-1">Pass 1: ID-Based Topology Map</strong>
                    Elements are matched by stable database mapping UUIDs.
                    <ul className="list-disc pl-4 mt-1.5">
                      <li>If ID exists in A but not B: mark <strong>Deleted</strong>.</li>
                      <li>If ID exists in B but not A: mark <strong>Added</strong>.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-850">
                    <strong className="text-white block mb-1">Pass 2: Geometric & Property Diff</strong>
                    For shared IDs, verify property blocks and boundary bounds.
                    <ul className="list-disc pl-4 mt-1.5">
                      <li>Checks bounding box intersection volumes.</li>
                      <li>Calculates bounding Hausdorff distance differences of triangulations to flag physical deformities.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. PROGRESS MATCHING */}
          {selectedSubsystem === "matching" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Subsystem 08 / Spec v4.0
                </span>
                <h3 className="text-xl font-black text-white mt-2">Scan-to-BIM Construction Progress Matching</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Integrates visual site scans (point clouds, 3D segmented meshes) with our reference BIM design model, matching density points against boundaries to compute exact, automated completion percentages.
                </p>
              </div>

              {/* Interactive Match Progress Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex flex-col border-b border-slate-800/60 pb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase">Scan-to-BIM Occupancy Matcher</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Adjust the detected point cloud overlap density to observe how the matching algorithm changes the calculated element status and confidence metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: Configuration */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col gap-4 justify-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 font-mono">
                      Site Scan Parameters
                    </span>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Point Cloud Overlap Density:</span>
                        <span className="font-mono text-indigo-300 font-bold">{bimProgressOverlap}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={bimProgressOverlap}
                        onChange={(e) => setBimProgressOverlap(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between text-xs border-t border-slate-900 pt-3">
                      <span className="text-slate-400 font-medium">Matching Solver Mode:</span>
                      <span className="text-indigo-400 font-bold uppercase tracking-wider font-mono">
                        Voxel Grid Occupancy
                      </span>
                    </div>
                  </div>

                  {/* Right: Calculated Metrics */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col gap-3 justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">
                        Matching Progress Evaluation
                      </span>

                      <div className="flex flex-col gap-2 mt-3 text-xs">
                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-500">Confidence Score:</span>
                          <span className={`font-mono font-bold ${
                            bimProgressOverlap > 75 ? "text-emerald-400" : (bimProgressOverlap > 50 ? "text-yellow-400" : "text-red-400")
                          }`}>
                            {(bimProgressOverlap * 0.98).toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-500">Calculated Storey Progress:</span>
                          <span className="font-mono text-white font-bold">
                            {(bimProgressOverlap * 0.85).toFixed(1)}% Complete
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">BIM Element Status:</span>
                          <span className={`font-bold ${
                            bimProgressOverlap > 80 ? "text-emerald-400" : (bimProgressOverlap > 40 ? "text-yellow-400" : "text-red-400")
                          }`}>
                            {bimProgressOverlap > 80 ? "COMPLETED" : (bimProgressOverlap > 40 ? "IN PROGRESS" : "NOT STARTED")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-indigo-300 bg-indigo-950/15 border border-indigo-900/30 p-2 rounded flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>Matching threshold active at 80% to declare completed structural states.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Algorithmic Details */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-xs flex flex-col gap-2 leading-relaxed">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                  Point Cloud to BIM Element Voxel Alignment Formulation
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Site point clouds contain spatial noise and occlusion. The engine uses **Voxel Grid Occupancy** matching:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[11px] text-slate-300 font-mono leading-relaxed">
                  {`1. Voxelization: Subdivide the BIM element's bounding box into 3D voxel cells (e.g. 10cm³).
2. Occupancy Intersection:
   - For each voxel cell V_i, calculate points of scan cloud falling inside.
   - If PointCount(V_i) >= Threshold: set V_i status to OCCUPIED.
3. Ratio calculation:
   Progress % = (Occupied Voxels of Scan ∩ Bounding Voxels of BIM) / Bounding Voxels of BIM * 100`}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
