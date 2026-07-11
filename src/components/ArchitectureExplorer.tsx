import React, { useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Network, 
  Cpu, 
  Palette, 
  Database, 
  Copy, 
  Check, 
  ArrowRight,
  Code
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

export default function ArchitectureExplorer() {
  const [activeTab, setActiveTab] = useState<"folder" | "hierarchy" | "state" | "theme">("folder");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "root": true,
    "root/src": true,
    "root/src/app": true,
    "root/src/components": true,
    "root/src/store": true,
    "root/src/hooks": true,
  });
  const [selectedFile, setSelectedFile] = useState<string>("root/src/store/useAppStore.ts");

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Next.js Production Directory Structure Mock Database
  const folderTree: FileNode = {
    name: "root",
    type: "folder",
    children: [
      {
        name: "package.json",
        type: "file",
        content: `{
  "name": "buildtrace-enterprise-suite",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.160.0",
    "lucide-react": "^0.360.0",
    "zustand": "^4.5.2",
    "@tanstack/react-query": "^5.28.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2",
    "recharts": "^2.12.3"
  }
}`
      },
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "layout.tsx",
                type: "file",
                content: `import "@/styles/globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

export const metadata = {
  title: "BuildTrace India | Enterprise BIM Monitor",
  description: "AI-driven physical site verification and progress prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full text-slate-800 antialiased font-sans">
        <QueryProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Workspace Stage */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopNavigation />
              <main className="flex-1 overflow-y-auto bg-slate-50/60 p-6">
                {children}
              </main>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}`
              },
              {
                name: "page.tsx",
                type: "file",
                content: `import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { BIMViewer } from "@/components/bim/BIMViewer";
import { DetailsInspector } from "@/components/bim/DetailsInspector";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Upper Layout: 3D model and inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[550px]">
          <BIMViewer />
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <DetailsInspector />
        </div>
      </div>
      
      {/* Lower Metrics Section */}
      <DashboardMetrics />
    </div>
  );
}`
              },
              {
                name: "anomalies",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    content: `import { AnomalyGrid } from "@/components/anomalies/AnomalyGrid";
import { AIRemediationPanel } from "@/components/anomalies/AIRemediationPanel";

export default function AnomaliesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <AnomalyGrid />
      </div>
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <AIRemediationPanel />
      </div>
    </div>
  );
}`
                  }
                ]
              },
              {
                name: "reports",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    content: `import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { DistributionList } from "@/components/reports/DistributionList";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportBuilder />
      <DistributionList />
    </div>
  );
}`
                  }
                ]
              }
            ]
          },
          {
            name: "components",
            type: "folder",
            children: [
              {
                name: "layout",
                type: "folder",
                children: [
                  { name: "Sidebar.tsx", type: "file", content: `// Sidebar containing core enterprise modules with active routing highlights` },
                  { name: "TopNavigation.tsx", type: "file", content: `// Global site header containing breadcrumbs, active project context and workspace stats` }
                ]
              },
              {
                name: "bim",
                type: "folder",
                children: [
                  { name: "BIMViewer.tsx", type: "file", content: `// Core IFC WebGL renderer displaying the 3D model synced with scan dates` },
                  { name: "DetailsInspector.tsx", type: "file", content: `// Side properties drawer displaying CAD schema parameters when elements are clicked` }
                ]
              }
            ]
          },
          {
            name: "store",
            type: "folder",
            children: [
              {
                name: "useAppStore.ts",
                type: "file",
                content: `import { create } from "zustand";

interface AppState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  selectedAnomalyId: string | null;
  setSelectedAnomalyId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: "overview",
  setActiveModule: (module) => set({ activeModule: module }),
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  selectedAnomalyId: null,
  setSelectedAnomalyId: (id) => set({ selectedAnomalyId: id }),
}));`
              }
            ]
          },
          {
            name: "hooks",
            type: "folder",
            children: [
              {
                name: "useBimData.ts",
                type: "file",
                content: `import { useQuery } from "@tanstack/react-query";

interface BimElement {
  id: string;
  name: string;
  progress: number;
  status: string;
}

export function useBimData() {
  return useQuery<BimElement[]>({
    queryKey: ["bim-elements"],
    queryFn: async () => {
      const res = await fetch("/api/bim");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching threshold
  });
}`
              }
            ]
          }
        ]
      }
    ]
  };

  const getFileContent = (path: string, node: FileNode): string | undefined => {
    if (path === node.name) return node.content;
    const segments = path.split("/");
    if (segments[0] === node.name) {
      if (segments.length === 1) return node.content;
      const subPath = segments.slice(1).join("/");
      for (const child of node.children || []) {
        const found = getFileContent(subPath, child);
        if (found) return found;
      }
    }
    return undefined;
  };

  const renderTree = (node: FileNode, currentPath: string) => {
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isExpanded = expandedNodes[nodePath];
    const isSelected = selectedFile === nodePath;

    if (node.type === "file") {
      return (
        <div 
          key={nodePath}
          onClick={() => setSelectedFile(nodePath)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs font-mono transition-colors ${
            isSelected 
              ? "bg-indigo-50 text-indigo-700 font-semibold" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={nodePath} className="flex flex-col">
        <div 
          onClick={() => toggleNode(nodePath)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        
        {isExpanded && node.children && (
          <div className="pl-4 ml-2 border-l border-slate-200 flex flex-col gap-0.5 mt-0.5">
            {node.children.map(child => renderTree(child, nodePath))}
          </div>
        )}
      </div>
    );
  };

  const activeFileContent = getFileContent(selectedFile, folderTree) || "// Select a file to inspect its Next.js blueprint code";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      
      {/* Sub Header tabs */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-5 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Enterprise Architecture blueprints</h3>
        </div>
        <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("folder")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "folder" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Folder Structure
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "hierarchy" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Component Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("state")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "state" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            State Management
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "theme" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Theme Tokens
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        
        {/* TAB: Folder tree viewer */}
        {activeTab === "folder" && (
          <>
            {/* Left tree navigation (4 columns) */}
            <div className="lg:col-span-4 border-r border-slate-200 p-4 overflow-y-auto max-h-[500px]">
              <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Next.js App Router Structure</div>
              <div className="flex flex-col gap-0.5">
                {renderTree(folderTree, "")}
              </div>
            </div>

            {/* Right code editor mock (8 columns) */}
            <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-300 overflow-hidden h-[500px]">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <span className="font-mono text-xs text-indigo-400">{selectedFile.replace("root/", "")}</span>
                <button
                  onClick={() => triggerCopy(activeFileContent, "code")}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                >
                  {copiedText === "code" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 overflow-auto font-mono text-xs leading-relaxed flex-1 select-all selection:bg-slate-800 text-slate-200">
                <code>{activeFileContent}</code>
              </pre>
            </div>
          </>
        )}

        {/* TAB: Component hierarchy flow map */}
        {activeTab === "hierarchy" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Module Component Hierarchy & Prop Flow</h4>
              <p className="text-xs text-slate-500">How visual and functional parts interact in our production-ready layout.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch mt-2 text-center text-xs">
              
              {/* Level 1: Root Providers */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 1: Entry context</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">RootLayout (app/layout.tsx)</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="p-1.5 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-mono text-indigo-700">QueryProvider</span>
                  <span className="p-1.5 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-mono text-indigo-700">useAppStore Context</span>
                </div>
              </div>

              {/* Level 2: Layout Frame */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 2: Nav framing</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">MainWorkspaceFrame</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left text-slate-600">
                  <span className="p-1.5 bg-white border border-slate-200 rounded font-semibold">• Sidebar (Nav)</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded font-semibold">• TopNavigation (HUD)</span>
                </div>
              </div>

              {/* Level 3: Active Routing Route Page */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 3: Router page</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">DashboardPage (app/page.tsx)</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left text-slate-600">
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• 3D Tracker view</span>
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• Anomaly Panel</span>
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• Reports center</span>
                </div>
              </div>

              {/* Level 4: Core Interactive canvas/components */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 4: Render view</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">BIMViewer Component</span>
                </div>
                <div className="my-3 flex justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 shrink-0 rotate-90 md:rotate-0 opacity-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="p-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-bold">• IFCJsViewerEngine</span>
                  <span className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono text-[10px]">• OrbitControls & Camera</span>
                  <span className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono text-[10px]">• Ambient + Dir Lights</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: State Management Blueprint */}
        {activeTab === "state" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-5 text-xs text-slate-600 h-[500px] overflow-y-auto">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">State Synchronizer & Caching Strategy</h4>
              <p className="text-xs text-slate-500">Zustand manages local selections and layout toggles. TanStack Query caches remote server database endpoints.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-stretch">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-indigo-700 font-mono flex items-center gap-1">
                    <Database className="w-4 h-4 text-indigo-600" />
                    ZUSTAND STORE FLOW
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded font-mono">Client state</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  When a user clicks on an element in the 3D model, the `IFCJsViewerEngine` captures the GUID and triggers:
                </p>
                <div className="bg-slate-950 text-slate-300 font-mono p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed select-all">
                  {`// Trigger state change globally
const selectElement = useAppStore(state => state.selectElementById);
selectElement("col_c4");`}
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  This updates the global store, instantly causing the **DetailsInspector** sidebar to read the selected element's custom specifications without drilling props.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-indigo-700 font-mono flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    TANSTACK REACT QUERY FLOW
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded font-mono">Server state</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  React Query caches and manages remote server state, like the anomalies or reports database:
                </p>
                <div className="bg-slate-950 text-slate-300 font-mono p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed select-all">
                  {`// Hooks-level data query fetching with cache
const { data: anomalies, isLoading } = useQuery({
  queryKey: ["site-anomalies"],
  queryFn: fetchAnomaliesFromServer,
  staleTime: 60000, // 1 min cache safety
});`}
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  Keeps the client interface light, handles automated offline polling fallback, and maintains a highly reactive experience for drone inspection data.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB: Theme Tokens */}
        {activeTab === "theme" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-6 text-xs text-slate-600">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Tailwind-Engineered Corporate Theme Tokens</h4>
              <p className="text-xs text-slate-500">Our palette matches Buildots & Procore: premium light-gray layout, stark crisp white surfaces, sharp deep charcoal headings, and subtle drop shadows.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              
              {/* Token 1 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Surface: Stark White</span>
                  <span className="text-[10px] text-slate-500 font-mono">bg-white</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Used on cards, inspector sidebars, and main active layers.</p>
                </div>
              </div>

              {/* Token 2 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-[#f8fafc] border border-slate-200" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Canvas: Soft Off-White</span>
                  <span className="text-[10px] text-slate-500 font-mono">bg-slate-50</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Surrounding body background which emphasizes focus on content cards.</p>
                </div>
              </div>

              {/* Token 3 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-slate-900" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Primary Text: Deep Slate</span>
                  <span className="text-[10px] text-slate-500 font-mono">text-slate-900</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Highly legible, ultra-crisp charcoal typography. Avoids absolute blacks.</p>
                </div>
              </div>

              {/* Token 4 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Focus Action: Royal Indigo</span>
                  <span className="text-[10px] text-slate-500 font-mono">text-indigo-600</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">The single functional color for active highlights, buttons, and alerts.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
