import React, { useState } from "react";
import { 
  Heading, 
  Text, 
  Badge, 
  Button, 
  Input, 
  Dropdown, 
  Card, 
  Table, 
  Dialog, 
  Drawer, 
  Skeleton, 
  EmptyState 
} from "./UI";
import { 
  Sparkles, 
  User, 
  Mail, 
  Eye, 
  ChevronRight, 
  Clock, 
  Grid, 
  FolderPlus, 
  Trash2, 
  RotateCw,
  Search,
  Sliders,
  Maximize2,
  Minimize2,
  FileText,
  Lock,
  Compass,
  ArrowRight
} from "lucide-react";

interface MockLedgerRow {
  id: string;
  element: string;
  material: string;
  status: "Active" | "Pending" | "Suspended";
  date: string;
}

export default function DesignSystemView() {
  // Navigation tabs in Design System Showcase
  const [activeSegment, setActiveSegment] = useState<"tokens" | "components" | "feedback">("tokens");

  // Notifications State
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // State management for interactive components
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputError, setInputError] = useState("");
  const [inputSuccess, setInputSuccess] = useState("");
  const [selectedOpt, setSelectedOpt] = useState("pro");

  // Dialog and Drawer states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState<"left" | "right">("right");

  // Table pagination state
  const [tablePage, setTablePage] = useState(1);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Mock table data
  const mockRows: MockLedgerRow[] = [
    { id: "row-1", element: "Concrete Foundation Pillar C1", material: "M40 Grade Reinforcement", status: "Active", date: "2026-07-10" },
    { id: "row-2", element: "Main Beam Conduit Level 2", material: "Structural Mild Steel", status: "Pending", date: "2026-07-11" },
    { id: "row-3", element: "External Facade Glazing Frame", material: "Anodized Aluminum", status: "Suspended", date: "2026-07-12" },
    { id: "row-4", element: "Elevator Shaft Shear Wall S4", material: "M45 Self-Compacting", status: "Active", date: "2026-07-13" },
    { id: "row-5", element: "MEP Piping Cluster B", material: "Sch 40 Galvanized Pipe", status: "Active", date: "2026-07-14" },
  ];

  const handleValidationCheck = () => {
    if (!inputText) {
      setInputError("Field cannot be empty. Please specify concrete mix volume.");
      setInputSuccess("");
    } else if (isNaN(Number(inputText))) {
      setInputError("Invalid mix coordinate format. Must be a numeric grade value.");
      setInputSuccess("");
    } else {
      setInputError("");
      setInputSuccess("Validation check passed. Material catalog index synchronized.");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800" id="design-system-view">
      
      {/* Toast Overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-slate-800 transition-all animate-scale-up">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* 1. BRAND HEADER */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </span>
            <Heading level={2} className="text-white">Design Token & Component System</Heading>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse the foundational design specifications, interactive UI variables, and highly polished reusable modules.
          </p>
        </div>
        
        {/* Toggle between segment view */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1 shrink-0">
          {[
            { id: "tokens", label: "Foundational Tokens" },
            { id: "components", label: "Interactive Core UI" },
            { id: "feedback", label: "Dynamic & Loaders" }
          ].map(segment => (
            <button
              key={segment.id}
              onClick={() => setActiveSegment(segment.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSegment === segment.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {segment.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEGMENT VIEWPORTS */}

      {/* =========================================================================
          TAB 1: FOUNDATIONAL TOKENS
          ========================================================================= */}
      {activeSegment === "tokens" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Typography Scale */}
          <Card 
            header={
              <div>
                <Heading level={3} className="text-sm font-black uppercase tracking-wider">Typography System</Heading>
                <Text size="xs" variant="muted">Inter (sans-serif) default text with structural display sizes</Text>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-2">Display Scale</span>
                <div className="space-y-4">
                  <div>
                    <Heading level={1} variant="sans">Heading H1 Title</Heading>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">level=1, size: 2xl md:3xl</span>
                  </div>
                  <div>
                    <Heading level={2} variant="sans">Heading H2 Subtitle</Heading>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">level=2, size: xl md:2xl</span>
                  </div>
                  <div>
                    <Heading level={3} variant="sans">Heading H3 Section Group</Heading>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">level=3, size: lg md:xl</span>
                  </div>
                  <div>
                    <Heading level={4} variant="sans">Heading H4 Subgroup Label</Heading>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">level=4, size: base md:lg</span>
                  </div>
                  <div>
                    <Heading level={5} variant="sans">Heading H5 Overline Descriptor</Heading>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">level=5, size: xs tracking-wider font-mono</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-2">Paragraph Styles</span>
                <div className="space-y-4">
                  <div>
                    <Text size="lg" weight="bold">Large Display Lead Sentence</Text>
                    <Text size="lg">Large body text. Typically utilized for callouts or introduction sections requiring elevated visual weight.</Text>
                  </div>
                  <div>
                    <Text size="md" weight="medium">Medium Standard Sentence</Text>
                    <Text size="md">Medium body text. Balanced and clear for core information narratives and readable paragraphs.</Text>
                  </div>
                  <div>
                    <Text size="sm" weight="normal">Small Secondary Description Text</Text>
                    <Text size="sm" variant="muted">Small muted paragraph. High negative contrast, extremely readable for metadata logs, support text, and inline helpers.</Text>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">Status Weights</span>
                    <div className="flex gap-4">
                      <Text size="xs" variant="info" weight="semibold">Interactive Info</Text>
                      <Text size="xs" variant="success" weight="bold">Success Confirmed</Text>
                      <Text size="xs" variant="error" weight="black">Fatal System Warning</Text>
                      <Text size="xs" variant="mono">Monospace Data Block</Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Spacing & Layout Metrics */}
          <Card
            header={
              <div>
                <Heading level={3} className="text-sm font-black uppercase tracking-wider">Spacing & Negative Rhythm</Heading>
                <Text size="xs" variant="muted">Balanced density, consistent margin layouts, and padding grids</Text>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-3">Tailwind Margin / Padding Grid Scale</span>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "p-1 (4px) Micro Spacer", bg: "w-4" },
                    { label: "p-2 (8px) Small Margin Padding", bg: "w-8" },
                    { label: "p-3 (12px) Element Gaps", bg: "w-12" },
                    { label: "p-4 (16px) Grid Columns Gap", bg: "w-16" },
                    { label: "p-6 (24px) Desktop Card Gutters", bg: "w-24" },
                    { label: "p-8 (32px) Page Layout Margins", bg: "w-32" }
                  ].map((space, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs font-mono font-semibold text-slate-500">
                      <div className={`${space.bg} h-4.5 bg-indigo-600 rounded-sm shrink-0`} />
                      <span className="text-[11px] text-slate-700">{space.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-3">Border Radius Metrics</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  {[
                    { id: "none", label: "none (0px)", style: "rounded-none" },
                    { id: "sm", label: "sm (2px)", style: "rounded-sm" },
                    { id: "md", label: "md (6px)", style: "rounded-md" },
                    { id: "lg", label: "lg (8px)", style: "rounded-lg" },
                    { id: "xl", label: "xl (12px)", style: "rounded-xl" },
                    { id: "2xl", label: "2xl (16px)", style: "rounded-2xl" }
                  ].map(radius => (
                    <div key={radius.id} className="bg-slate-50 border border-slate-200 p-4 flex flex-col items-center justify-center gap-1">
                      <div className={`w-12 h-12 bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-bold ${radius.style}`}>
                        Abc
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-500">{radius.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-3">Elevation & Depth Shadows</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { id: "flat", label: "Flat (no shadow)", style: "shadow-none border border-slate-200" },
                    { id: "low", label: "Low (shadow-xs)", style: "shadow-xs border border-slate-200/80" },
                    { id: "normal", label: "Normal (shadow-sm)", style: "shadow-sm border border-slate-200" },
                    { id: "high", label: "High (shadow-md)", style: "shadow-md border border-slate-200" }
                  ].map(shadow => (
                    <div key={shadow.id} className={`bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-1 ${shadow.style}`}>
                      <span className="text-xs font-black uppercase text-slate-700">{shadow.id}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">{shadow.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INTERACTIVE CORE UI
          ========================================================================= */}
      {activeSegment === "components" && (
        <div className="flex flex-col gap-6">
          
          {/* Row 1: Buttons & Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Interactive Button Catalog */}
            <Card
              header={
                <div>
                  <Heading level={3} className="text-sm font-black uppercase tracking-wider">Button Variations</Heading>
                  <Text size="xs" variant="muted">Live toggleable button sizes, icons, loading triggers, and design types</Text>
                </div>
              }
            >
              <div className="flex flex-col gap-6">
                
                {/* Control Panel inside Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-600">Button State Toggles:</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setBtnLoading(!btnLoading)}
                      className={`px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase flex items-center gap-1 transition ${
                        btnLoading ? "text-indigo-600 border-indigo-200 bg-indigo-50/20" : "text-slate-600"
                      }`}
                    >
                      <RotateCw className={`w-3 h-3 ${btnLoading ? "animate-spin text-indigo-500" : ""}`} />
                      <span>{btnLoading ? "Disable Loading" : "Enable Loading"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Core Variants</span>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary" isLoading={btnLoading}>Primary Action</Button>
                      <Button variant="secondary" isLoading={btnLoading}>Secondary Solid</Button>
                      <Button variant="outline" isLoading={btnLoading}>Outline Border</Button>
                      <Button variant="danger" isLoading={btnLoading}>Danger System</Button>
                      <Button variant="ghost" isLoading={btnLoading}>Ghost Plain</Button>
                      <Button variant="link">Inline Link</Button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Sizes Hierarchy</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="xs" variant="primary">XS Mini</Button>
                      <Button size="sm" variant="primary">SM Utility</Button>
                      <Button size="md" variant="primary">MD Standard</Button>
                      <Button size="lg" variant="primary">LG Prominent</Button>
                      <Button size="xl" variant="primary">XL Displays</Button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Leading & Trailing Icons</span>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="primary" leftIcon={<Compass className="w-4 h-4" />}>Explore Map Coordinates</Button>
                      <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>Next Workspace</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Inputs & validation fields */}
            <Card
              header={
                <div>
                  <Heading level={3} className="text-sm font-black uppercase tracking-wider">Input Fields & Validations</Heading>
                  <Text size="xs" variant="muted">Interactive validation testing for material code alignment inputs</Text>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      label="Material Batch Quantity"
                      placeholder="e.g. 1500"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      error={inputError}
                      success={inputSuccess}
                      helperText="Numeric input representable in metric tons. We'll cross-reference with catalog criteria."
                      leftIcon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleValidationCheck}
                    className="shrink-0 mb-[1px]"
                  >
                    Validate Field
                  </Button>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Interactive Custom Dropdown (Select)</span>
                    <Dropdown
                      label="Operational Subscription Tier"
                      value={selectedOpt}
                      onChange={(v) => {
                        setSelectedOpt(v);
                        triggerToast(`Subscription Tier changed to: ${v.toUpperCase()}`);
                      }}
                      options={[
                        { value: "starter", label: "Starter Local Hub", description: "Standard audit logs & transient local cache indexes" },
                        { value: "pro", label: "Pro Cloud Synchronizer", description: "Auto-clash detection, unlimited sheets & real-time DB" },
                        { value: "enterprise", label: "Enterprise Sovereign Private", description: "99.99% Dedicated Node clusters, SSO, custom S3 pipelines" }
                      ]}
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2">Disabled State Demo</span>
                    <Input
                      label="Read-Only API Redirection URL"
                      placeholder="https://fast-api.buildtrace.io/ka-992/v4"
                      disabled
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Row 2: Tables & Ledger */}
          <Card
            header={
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <div>
                  <Heading level={3} className="text-sm font-black uppercase tracking-wider">Modular Ledger Table</Heading>
                  <Text size="xs" variant="muted">A real-world compliant data table displaying materials, GUID indices, and status tracking.</Text>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsTableLoading(true);
                      setTimeout(() => setIsTableLoading(false), 1200);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Reload Table State</span>
                  </button>
                </div>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <Table
                isLoading={isTableLoading}
                data={mockRows}
                striped
                columns={[
                  { 
                    header: "BIM GUID ID", 
                    accessor: "id",
                    className: "font-mono font-bold text-indigo-600"
                  },
                  { 
                    header: "Physical Component Spec", 
                    accessor: "element"
                  },
                  { 
                    header: "Material Composition", 
                    accessor: "material",
                    className: "text-slate-500 font-medium"
                  },
                  { 
                    header: "Status Badge", 
                    accessor: (row) => {
                      const colorMap = {
                        Active: "emerald" as const,
                        Pending: "amber" as const,
                        Suspended: "rose" as const
                      };
                      return (
                        <Badge variant={colorMap[row.status] || "slate"} type="soft">
                          {row.status}
                        </Badge>
                      );
                    }
                  },
                  {
                    header: "Purge Threshold Date",
                    accessor: "date",
                    className: "font-mono text-slate-400 text-[11px]"
                  }
                ]}
                pagination={{
                  currentPage: tablePage,
                  pageSize: 3,
                  totalCount: 5,
                  onPageChange: (p) => setTablePage(p)
                }}
              />
            </div>
          </Card>

          {/* Row 3: Badges, Overlays, Dialogs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Overlay dialogs, drawers trigger panel */}
            <Card
              header={
                <div>
                  <Heading level={3} className="text-sm font-black uppercase tracking-wider">Modals, Dialogs & Drawers</Heading>
                  <Text size="xs" variant="muted">Trigger full animated overlays, sovereign context drawers, and safety popups</Text>
                </div>
              }
            >
              <div className="flex flex-col gap-6 justify-between h-full">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  We use <code className="bg-slate-100 font-mono text-indigo-600 px-1 rounded">motion/react</code> to handle backdrop blurs, fade-in scale translations for modal cards, and spring easing curves for sliding sheets. Touch targets and close controllers conform to accessibility directives.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    variant="primary" 
                    onClick={() => setIsDialogOpen(true)}
                    leftIcon={<Maximize2 className="w-4 h-4" />}
                  >
                    Open Dialog
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDrawerPosition("right");
                      setIsDrawerOpen(true);
                    }}
                    leftIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Drawer Right
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDrawerPosition("left");
                      setIsDrawerOpen(true);
                    }}
                    leftIcon={<ChevronRight className="w-4 h-4 rotate-180" />}
                  >
                    Drawer Left
                  </Button>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-2.5">Badge Catalog</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="indigo" type="solid">Admin Solid</Badge>
                    <Badge variant="emerald" type="soft">Active Active</Badge>
                    <Badge variant="amber" type="soft">Alert Warning</Badge>
                    <Badge variant="rose" type="outline">Danger Outline</Badge>
                    <Badge variant="orange" type="soft">Specials Sparkle</Badge>
                    <Badge variant="sky" type="solid">System Sync</Badge>
                    <Badge variant="slate" type="soft">Neutral Gray</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Displaying sovereign cards design */}
            <div className="grid grid-cols-1 gap-4">
              <Card 
                elevation="high" 
                radius="xl"
                header={
                  <div className="flex justify-between items-center w-full">
                    <Heading level={4} className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <User className="w-4 h-4 text-indigo-500" />
                      Tenant Account Overview
                    </Heading>
                    <Badge variant="indigo" type="soft">Premium Account</Badge>
                  </div>
                }
                footer={
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 w-full">
                    <span>Quota: 85% of 2 TB utilized</span>
                    <Button variant="link" size="xs" className="text-indigo-600 hover:underline">Extend Quota</Button>
                  </div>
                }
              >
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">Registered Company:</span>
                    <span className="font-extrabold text-slate-800">BuildTrace India Private Limited</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-semibold">HQ Address:</span>
                    <span className="font-extrabold text-slate-800 text-right truncate max-w-[200px]">Prestige Trade Tower, Bengaluru</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Operational Cloud Region:</span>
                    <span className="font-mono text-indigo-600 font-bold">ap-south-1 (Mumbai)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: DYNAMIC & LOADERS
          ========================================================================= */}
      {activeSegment === "feedback" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Skeleton placeholders & Spinners */}
          <Card
            header={
              <div>
                <Heading level={3} className="text-sm font-black uppercase tracking-wider">Skeleton Placeholders & Spinners</Heading>
                <Text size="xs" variant="muted">Visual loaders utilizing adaptive structural pulse animations</Text>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              
              {/* Circular inline spinners */}
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-2.5">Spinner Loaders</span>
                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col items-center gap-1.5">
                    <RotateCw className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="text-[9px] font-mono text-slate-400 font-semibold">default speed</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <RotateCw className="w-8 h-8 text-emerald-500 animate-spin [animation-duration:0.6s]" />
                    <span className="text-[9px] font-mono text-slate-400 font-semibold">fast speed</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <RotateCw className="w-12 h-12 text-rose-500 animate-spin [animation-duration:2.5s]" />
                    <span className="text-[9px] font-mono text-slate-400 font-semibold">slow speed</span>
                  </div>

                  <div className="text-xs text-slate-500 font-semibold leading-normal pl-2 flex-1">
                    Linear loaders are integrated inside button structures during operational API transactions.
                  </div>
                </div>
              </div>

              {/* Progress Bar Linear */}
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-2">Linear Progress Trackers</span>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500">
                      <span>Uploading Drone point cloud...</span>
                      <span>68% Complete</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[68%] [animation-duration:1s] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500">
                      <span>Compacting IndexedDB model files...</span>
                      <span>42% complete</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[42%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skeleton Cards layout placeholder */}
              <div className="border-t border-slate-100 pt-5">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase block tracking-wider mb-3">Adaptive Skeleton Card Placeholders</span>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circle" className="w-10 h-10" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton variant="text" className="w-1/3" />
                      <Skeleton variant="text" className="w-1/4 h-2" />
                    </div>
                  </div>
                  <Skeleton variant="rect" className="h-16" />
                  <div className="flex gap-2 justify-end">
                    <Skeleton variant="text" className="w-12 h-6 rounded-md my-0" />
                    <Skeleton variant="text" className="w-16 h-6 rounded-md my-0" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Reusable Empty State demonstration */}
          <Card
            header={
              <div>
                <Heading level={3} className="text-sm font-black uppercase tracking-wider">Empty State Components</Heading>
                <Text size="xs" variant="muted">Elegant placeholders for screens with zero loaded elements</Text>
              </div>
            }
          >
            <div className="flex flex-col gap-4 justify-between h-full">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-2">
                Empty states guide users when lists are empty, searches return zero items, or workspace configurations are not active. They prompt clean directional call to actions.
              </p>

              <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-2">
                <EmptyState
                  title="No Drone scans cataloged"
                  description="We couldn't detect any orthomosaic upload mappings within this weekly schedule block. Import some drone coordinates to kickstart CAD alignments."
                  actionLabel="Import Coordinates"
                  onAction={() => triggerToast("Launching Sovereign Drone File Selection...")}
                  secondaryActionLabel="Consult Specs"
                  onSecondaryAction={() => triggerToast("Opening Sovereign Product Docs...")}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          GLOBAL MODALS / OVERLAYS EMBEDDED IN SHOWCASE
          ========================================================================= */}

      {/* 1. Modal Dialog Component */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Sovereign Concrete Compliance Check"
        description="GUID-4481: Material Batch 309 Quality Assessment"
        footerActions={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Discard Scan
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              setIsDialogOpen(false);
              triggerToast("Concrete mix coordinates logged within safety ledger.");
            }}>
              Sync Alignment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-lg">
            <span className="font-extrabold block mb-1">Structural Geometry Compliance:</span>
            <span>Drone coordinates indicate a <strong>4.2cm lateral deviation</strong> on concrete column B2. This is slightly outside standard safety tolerances.</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-150">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Mix Grade:</span>
              <span className="font-bold text-slate-800">M40 High-Performance</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Curing Timeline:</span>
              <span className="font-bold text-emerald-600">18 days of 28 complete</span>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-500 leading-normal">
            Executing sovereign check commits photogrammetry records to the RERA auditor dashboard and prompts the sub-contractor to schedule core-drilling tests.
          </p>
        </div>
      </Dialog>

      {/* 2. Side Drawer Component */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Clash Remediation Advice"
        description="Gemini-2.5-Pro Reasoning Thread"
        position={drawerPosition}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-md">
            <span className="p-1 bg-indigo-500/15 border border-indigo-500/25 rounded text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </span>
            <div>
              <span className="text-xs font-bold block leading-none">LLM Reasoning Engine</span>
              <span className="text-[9px] text-slate-400 font-mono">Status: Connected to ap-south-1</span>
            </div>
          </div>

          <div className="space-y-3 text-slate-600 leading-relaxed text-xs">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] font-mono border-b border-slate-100 pb-1">Identified Spatial Clash</h4>
            <p>
              An intersection of <strong>Sch 40 Galvanized MEP pipe</strong> with the lateral structural rebar frame of <strong>shear wall S4</strong> was detected on Floor 2.
            </p>

            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] font-mono border-b border-slate-100 pb-1 mt-4">Automated Engineering Recommendation</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-800">Reroute MEP Pipe:</strong> Shift the pipe sleeve vertical center coordinate -12cm downward, avoiding reinforcement bars.
              </li>
              <li>
                <strong className="text-slate-800">Cored Sieve:</strong> Re-calculate horizontal stresses for the shear wall with a cored aperture of 110mm diameter.
              </li>
              <li>
                <strong className="text-slate-800">Commit IFC Layer:</strong> Push the corrected wireframe wireframe file to the Autodesk Procore server.
              </li>
            </ol>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-lg text-[11px] leading-relaxed">
            <span className="font-extrabold text-slate-800 block mb-0.5">SLA Timeline Impact:</span>
            <span>This corrective measure saves an estimated <strong>₹3.4 Lakhs</strong> in material rework and avoids a 4-day critical path baseline delay.</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <Button 
              variant="outline" 
              fullWidth 
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel Advice
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={() => {
                setIsDrawerOpen(false);
                triggerToast("Gemini routing correction pushed to IFC master models.");
              }}
            >
              Commit Core Spec
            </Button>
          </div>
        </div>
      </Drawer>

    </div>
  );
}
