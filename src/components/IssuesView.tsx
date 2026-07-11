import React, { useState, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  User, 
  Building, 
  ShieldAlert, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Layers,
  Plus,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  History,
  Image as ImageIcon,
  FileText,
  LayoutGrid,
  List,
  UploadCloud,
  Check,
  RotateCcw,
  FileSpreadsheet,
  Settings,
  UserCheck,
  Calendar,
  Sparkle
} from "lucide-react";
import { useAppStore } from "../store";

// Enriched Type Interfaces matching enterprise specification
interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
}

interface HistoryItem {
  id: string;
  event: string;
  user: string;
  date: string;
  details?: string;
}

interface ConstructionIssue {
  id: string;
  elementId: string;
  title: string;
  category: "Structure" | "MEP" | "Arch" | "Safety";
  priority: "Critical" | "Medium" | "Low";
  status: "Open" | "Resolved";
  assignedTo: string;
  detectedDate: string;
  description: string;
  bimImageLabel: string;
  scanImageLabel: string;
  aiOverlayTitle: string;
  aiOverlayConfidence: number;
  aiOverlayDeviation: string;
  aiRecommendation: string;
  diagramType: "column" | "rebar" | "clash" | "wall" | "custom";
  comments: Comment[];
  history: HistoryItem[];
  uploadedImages: string[]; // storage for uploaded file names or base64
}

// Initial Enriched Seed Data
const INITIAL_ISSUES: ConstructionIssue[] = [
  {
    id: "iss-101",
    elementId: "col_c4",
    title: "Column C4 Concrete Cover Placement Variance",
    category: "Structure",
    priority: "Critical",
    status: "Open",
    assignedTo: "Rajesh Kumar (QC Engineer)",
    detectedDate: "2026-07-08",
    description: "Laser scanning detected column C4 is shifted +42mm relative to the standard design layout. Over-reinforcement could cause concrete voids and fail structural cover checks.",
    bimImageLabel: "BIM Coordinated Layout (Level 2 Column C4)",
    scanImageLabel: "Autonomous Crane Drone Photometry Frame #458",
    aiOverlayTitle: "Critical Axis Shift",
    aiOverlayConfidence: 96.4,
    aiOverlayDeviation: "+42mm East Boundary Displacement",
    aiRecommendation: "Acknowledge variance before final concrete pour. Reinforcement must be manual-aligned to ensure a minimum of 40mm structural clear cover as per IS 456 standards. Perform ultrasound scan of adjacent structural columns.",
    diagramType: "column",
    comments: [
      { id: "c1", author: "Rajesh Kumar", role: "QC Lead", text: "Verified on-site. The formwork shift occurred during night shift concrete preparation.", date: "2026-07-08 11:30" },
      { id: "c2", author: "Amit Sharma", role: "BIM Manager", text: "Please do not pour concrete until we re-verify with the laser scanner coordinates on Monday.", date: "2026-07-09 09:15" }
    ],
    history: [
      { id: "h1", event: "Issue Logged", user: "Autonomous LiDAR Scanner #4", date: "2026-07-08 04:22", details: "Initial deviation of +42.1mm detected on east structural axis." },
      { id: "h2", event: "Owner Assigned", user: "System Engine", date: "2026-07-08 05:00", details: "Ticket assigned to Lead QC Rajesh Kumar based on spatial block parameters." },
      { id: "h3", event: "Site Inspection Completed", user: "Rajesh Kumar", date: "2026-07-08 11:30", details: "Added physical inspection comments. Confirming layout offset." }
    ],
    uploadedImages: []
  },
  {
    id: "iss-102",
    elementId: "slab_s2",
    title: "Slab S2 Deflection & Rebar Spacing Out of Tolerance",
    category: "Structure",
    priority: "Critical",
    status: "Open",
    assignedTo: "Amit Sharma (BIM Manager)",
    detectedDate: "2026-07-09",
    description: "Rebar spacing exceeds IS 456 specification limit by 55mm in the middle span. Must verify and add supplement bar elements before structural handover.",
    bimImageLabel: "Standard Slab S2 CAD Reinforcement Grid",
    scanImageLabel: "Smart Helmet Video Feed Frame #982",
    aiOverlayTitle: "Rebar Spacing Deviation",
    aiOverlayConfidence: 92.1,
    aiOverlayDeviation: "Average Spacing 255mm (Spec: 200mm)",
    aiRecommendation: "Add supplementary 12mm TMT steel reinforcing bars at 150mm center-to-center spacing to satisfy bending moment parameters. Require supervisor photo confirmation of the added steel before structural handover.",
    diagramType: "rebar",
    comments: [
      { id: "c3", author: "Amit Sharma", role: "BIM Manager", text: "We need the rebar contractor Vajra Concrete to fix this spacing immediately. Concrete mixer is scheduled for 2026-07-12.", date: "2026-07-09 14:02" }
    ],
    history: [
      { id: "h4", event: "Discrepancy Highlighted", user: "Computer Vision Core", date: "2026-07-09 08:44", details: "AI analyzed Site Helmet video frame #982 and detected an average spacing of 255mm against the approved 200mm model." },
      { id: "h5", event: "Owner Assigned", user: "System Engine", date: "2026-07-09 09:00", details: "Assigned to Amit Sharma (BIM Manager)." }
    ],
    uploadedImages: []
  },
  {
    id: "iss-103",
    elementId: "pipe_p12",
    title: "Piping Corridor Conflict with HVAC Duct Level 1",
    category: "MEP",
    priority: "Medium",
    status: "Open",
    assignedTo: "Venkatesh Rao (MEP Lead)",
    detectedDate: "2026-07-10",
    description: "Physical HVAC duct position conflicts with proposed main drainage path. Relocation required to prevent structural casing overrides.",
    bimImageLabel: "MEP Coordinated BIM (Duct vs Drainage)",
    scanImageLabel: "Duo-LiDAR Scan Reconstruction",
    aiOverlayTitle: "BIM Hard Clash",
    aiOverlayConfidence: 98.7,
    aiOverlayDeviation: "Intersection Volume: 1450 cm³",
    aiRecommendation: "Reroute the 110mm wastewater drainage pipe with a 45-degree elbow around the primary HVAC return duct. Maintain a minimum 50mm clearance as per standard plumbing code.",
    diagramType: "clash",
    comments: [],
    history: [
      { id: "h6", event: "Clash Triggered", user: "BIM Sync Service", date: "2026-07-10 16:30", details: "LiDAR scan mesh overlaps with standard CAD design layout parameters." },
      { id: "h7", event: "Owner Assigned", user: "System Engine", date: "2026-07-10 16:35", details: "Assigned to Venkatesh Rao (MEP Lead)." }
    ],
    uploadedImages: []
  },
  {
    id: "iss-104",
    elementId: "wall_w1",
    title: "Masonry Wall Thickness Discrepancy",
    category: "Arch",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Karan Johar (Subcontractor)",
    detectedDate: "2026-07-05",
    description: "Plaster level adjusted. Restored thickness parameters to fit design specifications with zero remaining alignment variances.",
    bimImageLabel: "Wall W1 Architectural Layout Plan",
    scanImageLabel: "Standard Terrestrial Laser Scanner Output",
    aiOverlayTitle: "Compliance Approved",
    aiOverlayConfidence: 99.5,
    aiOverlayDeviation: "0mm deviation after plastering",
    aiRecommendation: "No further action is required. Plaster and wall width are now perfectly compliant with structural plans.",
    diagramType: "wall",
    comments: [
      { id: "c4", author: "Karan Johar", role: "Subcontractor", text: "Plaster thickness adjusted. Alignment is now exactly in line with drawings.", date: "2026-07-06 17:00" },
      { id: "c5", author: "Rajesh Kumar", role: "QC Lead", text: "Approved post-re-survey on 2026-07-07. Closing out issue.", date: "2026-07-07 10:00" }
    ],
    history: [
      { id: "h8", event: "Deviation Discovered", user: "Operator LiDAR #1", date: "2026-07-05 11:15", details: "Brick wall layout showed a -18mm variance in dry thickness." },
      { id: "h9", event: "Status Modified", user: "Karan Johar", date: "2026-07-06 17:15", details: "Status updated to resolved after plaster correction." },
      { id: "h10", event: "Issue Audited & Closed", user: "Rajesh Kumar", date: "2026-07-07 10:05", details: "Verified on-site. Issue moved to Resolved." }
    ],
    uploadedImages: []
  }
];

export default function IssuesView() {
  const { setActiveTab } = useAppStore();
  
  // Real State management
  const [issues, setIssues] = useState<ConstructionIssue[]>(INITIAL_ISSUES);
  const [selectedIssueId, setSelectedIssueId] = useState<string>(INITIAL_ISSUES[0].id);
  
  // Filter settings
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "Critical" | "Medium" | "Low">("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Structure" | "MEP" | "Arch" | "Safety">("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // View Settings
  const [viewLayout, setViewLayout] = useState<"cards" | "table">("cards");
  const [diagramTab, setDiagramTab] = useState<"cad" | "scan">("scan");
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);
  
  // Comment box state
  const [newCommentText, setNewCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("Siddu Chitiki (Super)");
  
  // Create New Issue Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIssueForm, setNewIssueForm] = useState({
    title: "",
    elementId: "",
    category: "Structure" as "Structure" | "MEP" | "Arch" | "Safety",
    priority: "Medium" as "Critical" | "Medium" | "Low",
    assignedTo: "Rajesh Kumar (QC Engineer)",
    description: "",
    bimImageLabel: "Coordinated BIM Reference Frame",
    scanImageLabel: "Drone Camera Inspection Stream",
    diagramType: "custom" as "column" | "rebar" | "clash" | "wall" | "custom"
  });

  // Drag and drop uploader state
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Selected Issue computed helper
  const selectedIssue = useMemo(() => {
    return issues.find(iss => iss.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  // Filtered Issues list
  const filteredIssues = useMemo(() => {
    return issues.filter(iss => {
      const matchesStatus = statusFilter === "All" || iss.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || iss.priority === priorityFilter;
      const matchesCategory = categoryFilter === "All" || iss.category === categoryFilter;
      const matchesSearch = 
        iss.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        iss.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        iss.elementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iss.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        iss.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    });
  }, [issues, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = issues.length;
    const open = issues.filter(i => i.status === "Open").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;
    const critical = issues.filter(i => i.priority === "Critical" && i.status === "Open").length;
    const avgConfidence = issues.reduce((acc, curr) => acc + curr.aiOverlayConfidence, 0) / total;
    return {
      total,
      open,
      resolved,
      critical,
      avgConfidence: avgConfidence.toFixed(1)
    };
  }, [issues]);

  // Interactive functions
  const handleToggleStatus = (id: string) => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === id) {
        const nextStatus = iss.status === "Open" ? "Resolved" : "Open";
        const newHistoryItem: HistoryItem = {
          id: `h-${Date.now()}`,
          event: "Status Updated",
          user: "Operator Console",
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          details: `Issue manually marked as ${nextStatus}.`
        };
        return {
          ...iss,
          status: nextStatus,
          history: [newHistoryItem, ...iss.history]
        };
      }
      return iss;
    }));
  };

  const handleChangePriority = (id: string, newPriority: "Critical" | "Medium" | "Low") => {
    setIssues(prev => prev.map(iss => {
      if (iss.id === id) {
        const newHistoryItem: HistoryItem = {
          id: `h-${Date.now()}`,
          event: "Priority Updated",
          user: "Operator Console",
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          details: `Severity level changed from ${iss.priority} to ${newPriority}.`
        };
        return {
          ...iss,
          priority: newPriority,
          history: [newHistoryItem, ...iss.history]
        };
      }
      return iss;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedIssue) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: commentAuthor,
      role: "Lead Engineer",
      text: newCommentText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const newHistoryItem: HistoryItem = {
      id: `h-${Date.now()}`,
      event: "Comment Appended",
      user: commentAuthor,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      details: `Comment added regarding engineering guidelines.`
    };

    setIssues(prev => prev.map(iss => {
      if (iss.id === selectedIssue.id) {
        return {
          ...iss,
          comments: [...iss.comments, newComment],
          history: [newHistoryItem, ...iss.history]
        };
      }
      return iss;
    }));

    setNewCommentText("");
  };

  const handleDeleteIssue = (id: string) => {
    if (window.confirm("Are you sure you want to delete this issue? This operation is irreversible.")) {
      const remaining = issues.filter(iss => iss.id !== id);
      setIssues(remaining);
      if (selectedIssueId === id && remaining.length > 0) {
        setSelectedIssueId(remaining[0].id);
      }
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0].name);
    }
  };

  const simulateFileUpload = (fileName: string) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            
            // Add file to active issue's uploaded list
            if (selectedIssue) {
              const newHistory: HistoryItem = {
                id: `h-${Date.now()}`,
                event: "Photometry Uploaded",
                user: "Super (You)",
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                details: `Uploaded new verification scan: ${fileName}`
              };
              setIssues(prevIssues => prevIssues.map(iss => {
                if (iss.id === selectedIssue.id) {
                  return {
                    ...iss,
                    uploadedImages: [...iss.uploadedImages, fileName],
                    history: [newHistory, ...iss.history]
                  };
                }
                return iss;
              }));
            }
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  // Submit new issue modal
  const handleCreateIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueForm.title || !newIssueForm.elementId) return;

    const newId = `iss-${100 + issues.length + 1}`;
    const newIssue: ConstructionIssue = {
      id: newId,
      elementId: newIssueForm.elementId,
      title: newIssueForm.title,
      category: newIssueForm.category,
      priority: newIssueForm.priority,
      status: "Open",
      assignedTo: newIssueForm.assignedTo,
      detectedDate: new Date().toISOString().split('T')[0],
      description: newIssueForm.description || "No description provided. Registered on-site inspection anomaly.",
      bimImageLabel: newIssueForm.bimImageLabel,
      scanImageLabel: newIssueForm.scanImageLabel,
      aiOverlayTitle: "Structural/MEP Anomaly",
      aiOverlayConfidence: 89.5,
      aiOverlayDeviation: "Layout mismatch registered by site operator",
      aiRecommendation: "Perform standard re-evaluation against approved RERA plans. Handover to assigned supervisor for remedial works.",
      diagramType: newIssueForm.diagramType,
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          event: "Issue Initiated",
          user: "Super Console (You)",
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          details: "Registered via issues creation console."
        }
      ],
      uploadedImages: []
    };

    setIssues([...issues, newIssue]);
    setSelectedIssueId(newId);
    setIsCreateModalOpen(false);
    // Reset form
    setNewIssueForm({
      title: "",
      elementId: "",
      category: "Structure",
      priority: "Medium",
      assignedTo: "Rajesh Kumar (QC Engineer)",
      description: "",
      bimImageLabel: "Coordinated BIM Reference Frame",
      scanImageLabel: "Drone Camera Inspection Stream",
      diagramType: "custom"
    });
  };

  // CSV Exporter for spreadsheet integration
  const exportIssuesCsv = () => {
    const headers = ["ID", "BIM Object ID", "Title", "Category", "Priority", "Status", "Assigned To", "Detected Date", "Description"];
    const rows = filteredIssues.map(i => [
      i.id,
      i.elementId,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.priority,
      i.status,
      `"${i.assignedTo.replace(/"/g, '""')}"`,
      i.detectedDate,
      `"${i.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BuildTrace_Issues_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Vector SVG Drawings representing spatial schematics (highly visual, responsive, beautiful)
  const renderInteractiveDiagram = (type: string, isActual: boolean) => {
    const colorLine = isActual ? "#f43f5e" : "#10b981";
    const colorDash = isActual ? "3,3" : "0";

    switch(type) {
      case "column":
        return (
          <svg className="w-full h-full bg-slate-950 p-4 rounded-lg" viewBox="0 0 100 100" id="svg-diagram-column">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Center Axes lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
            
            {/* Standard CAD Blueprint outline (Always visible in background) */}
            <rect x="30" y="30" width="40" height="40" rx="2" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,1" />
            <text x="32" y="26" fill="#818cf8" fontSize="4" fontWeight="bold">CAD Standard Design</text>

            {isActual ? (
              <>
                {/* Physical displaced location */}
                <rect x="36" y="27" width="40" height="40" rx="2" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="70" y1="50" x2="76" y2="47" stroke="#f43f5e" strokeWidth="0.75" />
                <circle cx="76" cy="47" r="1.5" fill="#f43f5e" />
                
                {/* Dimension Arrows */}
                <line x1="30" y1="80" x2="36" y2="80" stroke="#f43f5e" strokeWidth="1" markerEnd="url(#arrow)" />
                <text x="26" y="86" fill="#f43f5e" fontSize="5" fontWeight="black" fontFamily="monospace">+42mm Shift</text>
                
                {/* Confidence overlay annotation */}
                {showAiOverlay && (
                  <g className="animate-pulse">
                    <rect x="42" y="38" width="28" height="16" rx="2" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" />
                    <text x="45" y="44" fill="#f43f5e" fontSize="3.5" fontWeight="bold">CV: SHIFT OUTBOUNDS</text>
                    <text x="45" y="50" fill="#cbd5e1" fontSize="3" fontStyle="italic">Shift: +42.1mm East</text>
                  </g>
                )}
              </>
            ) : (
              <rect x="30" y="30" width="40" height="40" rx="2" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1.5" />
            )}
            
            <circle cx="50" cy="50" r="1" fill="#94a3b8" />
          </svg>
        );
      case "rebar":
        return (
          <svg className="w-full h-full bg-slate-950 p-4 rounded-lg" viewBox="0 0 100 100" id="svg-diagram-rebar">
            <rect width="100%" height="100%" fill="#0b0f19" />
            {/* Slab concrete boundary */}
            <rect x="10" y="15" width="80" height="70" rx="4" fill="rgba(30, 41, 59, 0.4)" stroke="#334155" strokeWidth="1" />
            <text x="14" y="24" fill="#94a3b8" fontSize="4" fontWeight="bold">Slab Structural Grid</text>

            {/* Normal design spacing grid (Gray lines) */}
            <g opacity="0.3">
              <line x1="20" y1="15" x2="20" y2="85" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="40" y1="15" x2="40" y2="85" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="60" y1="15" x2="60" y2="85" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="80" y1="15" x2="80" y2="85" stroke="#cbd5e1" strokeWidth="0.5" />
            </g>

            {/* Actual Rebar bars layout */}
            {isActual ? (
              <>
                {/* Out of spec grid spacing */}
                <line x1="20" y1="15" x2="20" y2="85" stroke="#f43f5e" strokeWidth="2" />
                <line x1="55" y1="15" x2="55" y2="85" stroke="#f43f5e" strokeWidth="2" /> {/* Shifted too far */}
                <line x1="80" y1="15" x2="80" y2="85" stroke="#f43f5e" strokeWidth="2" />

                {/* Spacing dimension line */}
                <line x1="20" y1="50" x2="55" y2="50" stroke="#f43f5e" strokeWidth="1" />
                <path d="M 20 48 L 20 52 M 55 48 L 55 52" stroke="#f43f5e" strokeWidth="1" />
                
                {showAiOverlay && (
                  <g className="animate-pulse">
                    <rect x="25" y="55" width="40" height="18" rx="2" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" />
                    <text x="28" y="61" fill="#f43f5e" fontSize="4.5" fontWeight="bold">SPACING SLIP</text>
                    <text x="28" y="68" fill="#94a3b8" fontSize="4" fontFamily="monospace">255mm vs Spec 200mm</text>
                  </g>
                )}
              </>
            ) : (
              <g>
                {/* In spec bars */}
                <line x1="20" y1="15" x2="20" y2="85" stroke="#10b981" strokeWidth="2" />
                <line x1="40" y1="15" x2="40" y2="85" stroke="#10b981" strokeWidth="2" />
                <line x1="60" y1="15" x2="60" y2="85" stroke="#10b981" strokeWidth="2" />
                <line x1="80" y1="15" x2="80" y2="85" stroke="#10b981" strokeWidth="2" />
                
                <line x1="40" y1="50" x2="60" y2="50" stroke="#10b981" strokeWidth="1" />
                <path d="M 40 48 L 40 52 M 60 48 L 60 52" stroke="#10b981" strokeWidth="1" />
                <text x="44" y="46" fill="#10b981" fontSize="4.5" fontWeight="bold">200mm OK</text>
              </g>
            )}
          </svg>
        );
      case "clash":
        return (
          <svg className="w-full h-full bg-slate-950 p-4 rounded-lg" viewBox="0 0 100 100" id="svg-diagram-clash">
            <rect width="100%" height="100%" fill="#0c0e17" />
            
            {/* Draw HVAC Duct background rect (horizontal) */}
            <rect x="5" y="35" width="90" height="30" fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="1" />
            <text x="8" y="41" fill="#818cf8" fontSize="4.5" fontWeight="bold">Primary HVAC Duct Layout (Level 1)</text>

            {isActual ? (
              <>
                {/* Physical Pipe cutting directly through HVAC duct (Hard overlap) */}
                <rect x="45" y="10" width="15" height="80" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" strokeWidth="2" />
                <text x="63" y="20" fill="#f43f5e" fontSize="4.5" fontWeight="bold">Physical 110mm Pipe</text>

                {/* Conflict intersection zone */}
                <rect x="45" y="35" width="15" height="30" fill="rgba(244, 63, 94, 0.5)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                
                {showAiOverlay && (
                  <g className="animate-pulse">
                    <circle cx="52" cy="50" r="10" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,3" />
                    <rect x="18" y="72" width="64" height="15" rx="2" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" />
                    <text x="21" y="81" fill="#f43f5e" fontSize="5" fontWeight="black" letterSpacing="0.5">BIM HARD CLASH: 1450 cm³ OVERLAP</text>
                  </g>
                )}
              </>
            ) : (
              <g>
                {/* Properly offset or bypassed pipe */}
                <rect x="65" y="10" width="15" height="80" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="2" />
                <text x="65" y="94" fill="#10b981" fontSize="4.5" fontWeight="bold">Corrected Pipe Routing</text>
                <text x="35" y="94" fill="#94a3b8" fontSize="3.5">Coordinated 50mm clearance</text>
              </g>
            )}
          </svg>
        );
      case "wall":
        return (
          <svg className="w-full h-full bg-slate-950 p-4 rounded-lg" viewBox="0 0 100 100" id="svg-diagram-wall">
            <rect width="100%" height="100%" fill="#080c14" />
            
            {/* Draw brick pattern background */}
            <line x1="20" y1="5" x2="20" y2="95" stroke="#334155" strokeWidth="0.5" />
            <line x1="80" y1="5" x2="80" y2="95" stroke="#334155" strokeWidth="0.5" />

            {/* Standard Thickness Guide lines */}
            <line x1="30" y1="10" x2="30" y2="90" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="70" y1="10" x2="70" y2="90" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
            <text x="32" y="85" fill="#818cf8" fontSize="4.5">CAD Target Bounds</text>

            {isActual ? (
              <>
                {/* Resolved or dry masonry width */}
                <rect x="30" y="20" width="40" height="50" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" />
                <text x="34" y="32" fill="#10b981" fontSize="5" fontWeight="bold">Plaster Thickness OK</text>
                <text x="34" y="40" fill="#94a3b8" fontSize="4">Compliant width restored</text>
                
                {showAiOverlay && (
                  <g>
                    <rect x="25" y="52" width="50" height="13" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                    <text x="28" y="60" fill="#10b981" fontSize="4.5" fontWeight="bold">✓ TOLERANCE VERIFIED (100%)</text>
                  </g>
                )}
              </>
            ) : (
              <g>
                {/* Thin brick wall layout */}
                <rect x="34" y="20" width="32" height="50" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" strokeWidth="2" />
                <text x="36" y="32" fill="#f43f5e" fontSize="5" fontWeight="bold">Variance: -18mm</text>
                <text x="36" y="40" fill="#cbd5e1" fontSize="4">Requires plaster pad adjustment</text>
              </g>
            )}
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full bg-slate-950 p-4 rounded-lg" viewBox="0 0 100 100" id="svg-diagram-custom">
            <rect width="100%" height="100%" fill="#0f172a" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#6366f1" strokeWidth="1" />
            <circle cx="50" cy="50" r="22" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#334155" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#334155" strokeWidth="0.5" />
            <text x="25" y="85" fill="#f43f5e" fontSize="5" fontWeight="black" fontFamily="monospace">Scan Deviation Registered</text>
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full text-slate-800" id="issues-workspace-root">
      
      {/* 1. TOP STATS HUD CARD */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Enterprise Deviation Workspace & Audit Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Analyze physical construction anomalies cross-referenced by automated crane-liDAR scans against CAD design tolerances.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Register New Deviation</span>
            </button>
            <button
              onClick={exportIssuesCsv}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              title="Download CSV report of current filtered anomalies"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Multi-KPI widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Open Anomaly Backlog</span>
              <span className="text-2xl font-black text-slate-900 font-mono block">{stats.open}</span>
            </div>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              Attention Required
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Critical Structural Spikes</span>
              <span className="text-2xl font-black text-rose-600 font-mono block">{stats.critical}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Average AI Confidence</span>
              <span className="text-2xl font-black text-indigo-600 font-mono block">{stats.avgConfidence}%</span>
            </div>
            <span className="text-xs text-indigo-600 font-extrabold flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Verified
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Regulatory Resolved</span>
              <span className="text-2xl font-black text-emerald-600 font-mono block">{stats.resolved}</span>
            </div>
            <div className="flex flex-col text-right text-[10px]">
              <span className="font-bold text-emerald-600">
                {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}% Rate
              </span>
              <span className="text-slate-400 font-mono">RERA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADVANCED INTERACTIVE FILTER PANEL */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Trade Category Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Spatial Trade</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 font-semibold text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="All">All Trades</option>
                <option value="Structure">Structure</option>
                <option value="MEP">MEP</option>
                <option value="Arch">Architecture</option>
                <option value="Safety">Safety</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Severity Priority</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg font-bold">
                {(["All", "Critical", "Medium", "Low"] as const).map(prio => (
                  <button
                    key={prio}
                    onClick={() => setPriorityFilter(prio)}
                    className={`px-3 py-1 rounded-md text-[11px] transition-all ${
                      priorityFilter === prio
                        ? "bg-white text-slate-900 shadow-sm font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Switcher */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Audit Status</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg font-bold">
                {(["All", "Open", "Resolved"] as const).map(stat => (
                  <button
                    key={stat}
                    onClick={() => setStatusFilter(stat)}
                    className={`px-3 py-1 rounded-md text-[11px] transition-all ${
                      statusFilter === stat
                        ? "bg-white text-slate-900 shadow-sm font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {stat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar & View toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto self-end lg:self-center">
            {/* Text Search */}
            <div className="relative flex-1 lg:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs flex items-center">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search by ID, GUID, operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-700 outline-none w-full placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center shrink-0 border border-slate-200">
              <button
                onClick={() => setViewLayout("cards")}
                className={`p-1.5 rounded-md transition ${viewLayout === "cards" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Visual Bento Grid Layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout("table")}
                className={`p-1.5 rounded-md transition ${viewLayout === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                title="Regulatory Ledger Table Layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE SPLIT WORKSPACE AREA */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT WORKSPACE PANEL: Filtered List (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {viewLayout === "cards" ? (
            /* BENTO GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map(iss => {
                  const isSelected = selectedIssueId === iss.id;
                  return (
                    <article
                      key={iss.id}
                      onClick={() => setSelectedIssueId(iss.id)}
                      className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-150 hover:shadow-md cursor-pointer select-none relative ${
                        isSelected 
                          ? "ring-2 ring-indigo-500 border-transparent shadow-md" 
                          : "border-slate-200"
                      }`}
                    >
                      {/* Priority Tag line indicator */}
                      <span className={`h-1.5 w-full block ${
                        iss.priority === "Critical" 
                          ? "bg-red-500" 
                          : (iss.priority === "Medium" ? "bg-amber-500" : "bg-blue-400")
                      }`} />

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400">{iss.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-400 font-mono">BIM: {iss.elementId}</span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug line-clamp-2 h-10">
                            {iss.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1.5 line-clamp-2">
                            {iss.description}
                          </p>
                        </div>

                        {/* Status badges & details row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              iss.priority === "Critical" 
                                ? "bg-red-50 text-red-700 border border-red-200/50" 
                                : (iss.priority === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50")
                            }`}>
                              {iss.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              iss.status === "Resolved" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                            }`}>
                              {iss.status}
                            </span>
                          </div>
                          
                          <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                            {iss.category}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer detail info */}
                      <div className="bg-slate-50/70 px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                        <span className="font-medium text-slate-500 truncate max-w-[130px]" title={iss.assignedTo}>
                          Assignee: {iss.assignedTo.split(" ")[0]}
                        </span>
                        <div className="flex items-center gap-2.5 font-mono text-slate-400">
                          <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3 text-slate-400" /> {iss.comments.length}</span>
                          <span>{iss.detectedDate}</span>
                        </div>
                      </div>

                      {/* Selection background check indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                    </article>
                  );
                })
              ) : (
                <div className="col-span-2 py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                  <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No deviations match the selected filter query.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try resetting the trade, priority, or search query variables.</p>
                </div>
              )}
            </div>
          ) : (
            /* STRICT AUDIT TABLE VIEW */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/60">
                      <th className="p-3">ID & BIM Element</th>
                      <th className="p-3">Title Description</th>
                      <th className="p-3">Trade</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Operator</th>
                      <th className="p-3">Detected</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.length > 0 ? (
                      filteredIssues.map(iss => {
                        const isSelected = selectedIssueId === iss.id;
                        return (
                          <tr 
                            key={iss.id} 
                            onClick={() => setSelectedIssueId(iss.id)}
                            className={`border-b border-slate-100 hover:bg-slate-50/60 transition cursor-pointer ${
                              isSelected ? "bg-indigo-50/20" : ""
                            }`}
                          >
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block font-mono">{iss.id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">BIM: {iss.elementId}</span>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              <span className="font-bold text-slate-950 block truncate" title={iss.title}>{iss.title}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1">{iss.description}</span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-bold text-[9px] uppercase">
                                {iss.category}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                iss.priority === "Critical" 
                                  ? "bg-red-50 text-red-700 border border-red-200/50" 
                                  : (iss.priority === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50")
                              }`}>
                                {iss.priority}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                iss.status === "Resolved" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                                  : "bg-rose-50 text-rose-700 border-rose-250"
                              }`}>
                                {iss.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap truncate max-w-[120px]" title={iss.assignedTo}>
                              {iss.assignedTo}
                            </td>
                            <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{iss.detectedDate}</td>
                            <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleStatus(iss.id)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600"
                                  title="Change compliance status"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIssue(iss.id)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600"
                                  title="Delete register log"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                          No deviations found matching your filter query parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT WORKSPACE PANEL: Interactive Workspace Details Sidebar (5 Columns) */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5 sticky top-6" aria-label="Issue Inspector Panel">
          
          {selectedIssue ? (
            <div className="flex flex-col gap-5">
              
              {/* Sidebar Header details */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-mono text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded uppercase border border-indigo-150">
                        {selectedIssue.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-slate-400 font-bold">Element GUID: {selectedIssue.elementId}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight mt-1">
                      {selectedIssue.title}
                    </h3>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteIssue(selectedIssue.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                    title="Delete Issue Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11.5px] text-slate-500 leading-relaxed mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Status and Priority Controls */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                
                {/* Interactive Status Switcher */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status State</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => handleToggleStatus(selectedIssue.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase border transition flex items-center justify-center gap-1 ${
                        selectedIssue.status === "Resolved"
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {selectedIssue.status === "Resolved" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Resolved</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Open Active</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Interactive Priority Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Change Severity</span>
                  <select
                    value={selectedIssue.priority}
                    onChange={(e) => handleChangePriority(selectedIssue.id, e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold text-slate-800 outline-none mt-1 focus:border-indigo-500"
                  >
                    <option value="Critical">⚠️ Critical</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">✓ Low</option>
                  </select>
                </div>

              </div>

              {/* DUAL DIAGRAM VIEW WITH AI DETECTION OVERLAY */}
              <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-2 flex justify-between items-center text-xs">
                  
                  {/* Schematic tabs */}
                  <div className="flex p-0.5 bg-slate-800/80 rounded-lg border border-slate-700">
                    <button
                      onClick={() => setDiagramTab("cad")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                        diagramTab === "cad" ? "bg-slate-950 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      CAD Blueprint
                    </button>
                    <button
                      onClick={() => setDiagramTab("scan")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                        diagramTab === "scan" ? "bg-slate-950 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Physical Scan
                    </button>
                  </div>

                  {/* AI Detection toggle switch */}
                  {diagramTab === "scan" && (
                    <button
                      onClick={() => setShowAiOverlay(prev => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold rounded-lg border transition ${
                        showAiOverlay 
                          ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Sparkle className={`w-3 h-3 ${showAiOverlay ? "text-indigo-400 animate-spin" : ""}`} />
                      <span>{showAiOverlay ? "AI Overlay: ON" : "AI Overlay: OFF"}</span>
                    </button>
                  )}

                </div>

                {/* Live canvas diagram frame */}
                <div className="h-44 bg-slate-950 relative flex items-center justify-center p-3">
                  {renderInteractiveDiagram(selectedIssue.diagramType, diagramTab === "scan")}
                  
                  {/* Overlay labels */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-950/85 px-2 py-1 rounded border border-slate-800">
                    <span className="truncate max-w-[170px]">
                      {diagramTab === "cad" ? selectedIssue.bimImageLabel : selectedIssue.scanImageLabel}
                    </span>
                    {diagramTab === "scan" && (
                      <span className="text-rose-400 font-bold">
                        CV Confidence: {selectedIssue.aiOverlayConfidence}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* MOCK DRAG & DROP FILE UPLOAD AREA */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Physical Scan Uplink</span>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center relative ${
                    isDragActive 
                      ? "border-indigo-500 bg-indigo-50/20" 
                      : "border-slate-250 hover:bg-slate-50/50 hover:border-slate-350"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                  {uploadProgress !== null ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <Clock className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="text-[11px] font-bold text-indigo-700">Analyzing scan bounds... {uploadProgress}%</span>
                      <div className="w-32 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div style={{ width: `${uploadProgress}%` }} className="bg-indigo-600 h-full transition-all duration-150" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-[11px] font-bold text-slate-700">Drag & Drop new verification scan here</p>
                      <p className="text-[9.5px] text-slate-400 mt-0.5">Supports PNG, JPEG up to 12MB • Runs automatic CV match</p>
                    </>
                  )}
                </div>

                {/* Uploaded attachments catalog if any */}
                {selectedIssue.uploadedImages.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Verification Photometry Uploads ({selectedIssue.uploadedImages.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedIssue.uploadedImages.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-mono text-slate-600 font-bold">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate max-w-[120px]">{name}</span>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded uppercase">Ready</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI REMEDIATION RECOMMENDATION BOX */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-mono">BIM Smart AI Remediation Advice</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedIssue.aiRecommendation}
                </p>
                <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-800 pt-2 font-mono mt-1">
                  <span>Standard Reference: RERA / IS 456 Clause 26.4</span>
                  <span className="text-emerald-400 font-semibold">Ready to Apply</span>
                </div>
              </div>

              {/* COLLABORATIVE COMMENTS MODULE */}
              <div className="border-t border-slate-150 pt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>Discussion Logs ({selectedIssue.comments.length})</span>
                </h4>

                {/* Comment logs list */}
                <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedIssue.comments.length > 0 ? (
                    selectedIssue.comments.map(c => (
                      <div key={c.id} className="bg-slate-50/70 border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] uppercase">
                              {c.author.substring(0,2)}
                            </span>
                            <span>{c.author}</span>
                            <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black px-1.5 py-0.2 rounded">
                              {c.role}
                            </span>
                          </div>
                          <span className="font-mono text-slate-400 text-[9.5px]">{c.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-6 pr-2 leading-relaxed">
                          {c.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 italic text-[11px]">
                      No discussion notes logged. Submit a comment below to initiate collaboration.
                    </div>
                  )}
                </div>

                {/* Comment input box */}
                <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type technical remark..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>

              {/* LIFECYCLE HISTORY TRAIL */}
              <div className="border-t border-slate-150 pt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Regulatory Lifecycle History</span>
                </h4>

                <div className="flex flex-col gap-3 pl-2 border-l border-slate-150">
                  {selectedIssue.history.map(item => (
                    <div key={item.id} className="relative pl-4 text-xs">
                      {/* Circle bullet */}
                      <span className="absolute -left-[12.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-white" />
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-800">{item.event}</span>
                        <span className="font-mono text-slate-400">{item.date}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By {item.user}</div>
                      {item.details && (
                        <p className="text-[10px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono">
                          {item.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold">No active deviation selected</p>
              <p className="text-[11px]">Click any bento card or list item on the left to review telemetry logs.</p>
            </div>
          )}

        </aside>

      </section>

      {/* 4. MODAL: REGISTER NEW DEVIATION OUTBOUND */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl animate-fade-in text-slate-800">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Register Construction Deviation</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Add photogrammetry conflict variables to the live ledger</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateIssueSubmit} className="p-6 flex flex-col gap-4 text-xs">
              
              {/* Title input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-slate-700">Deviation Title / Occurrence</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Column C8 Level 1 Casting displacement"
                  value={newIssueForm.title}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, title: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Row with Element ID and Assigned */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">BIM Object Element GUID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. col_c8_l1"
                    value={newIssueForm.elementId}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, elementId: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 font-mono text-slate-850"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">Assigned Lead Operator</label>
                  <select
                    value={newIssueForm.assignedTo}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, assignedTo: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800"
                  >
                    <option value="Rajesh Kumar (QC Engineer)">Rajesh Kumar (QC Engineer)</option>
                    <option value="Amit Sharma (BIM Manager)">Amit Sharma (BIM Manager)</option>
                    <option value="Venkatesh Rao (MEP Lead)">Venkatesh Rao (MEP Lead)</option>
                    <option value="Karan Johar (Subcontractor)">Karan Johar (Subcontractor)</option>
                  </select>
                </div>
              </div>

              {/* Row with Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">Construction Domain Trade</label>
                  <select
                    value={newIssueForm.category}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, category: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                  >
                    <option value="Structure">Structure</option>
                    <option value="MEP">MEP</option>
                    <option value="Arch">Architecture</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">Severity Priority</label>
                  <select
                    value={newIssueForm.priority}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, priority: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-850 font-bold"
                  >
                    <option value="Critical">⚠️ Critical</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">✓ Low</option>
                  </select>
                </div>
              </div>

              {/* Vector diagram selector */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">Vector Diagram Type</label>
                  <select
                    value={newIssueForm.diagramType}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, diagramType: e.target.value as any })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800"
                  >
                    <option value="column">Column Alignment (Shift)</option>
                    <option value="rebar">Rebar Density (Slab Spacing)</option>
                    <option value="clash">MEP Conduit Overlap (Clash)</option>
                    <option value="wall">Masonry Brick Wall (Thickness)</option>
                    <option value="custom">Standard Calibration (Telemetry)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-extrabold text-slate-700">LiDAR Feed Label</label>
                  <input
                    type="text"
                    value={newIssueForm.scanImageLabel}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, scanImageLabel: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Description field */}
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-slate-700">Detailed Telemetry Findings</label>
                <textarea
                  placeholder="Describe standard parameters shift, potential impact, and coordinate values..."
                  value={newIssueForm.description}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, description: e.target.value })}
                  rows={3}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-400 font-medium resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md cursor-pointer"
                >
                  Register Deviation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
