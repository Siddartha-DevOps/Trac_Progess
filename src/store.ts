import { create } from "zustand";
import { BIMElement, Anomaly } from "./types";
import { SITE_ANOMALIES, BIM_ELEMENTS_LOOKUP, getProjectBimElements } from "./data";

export type TabType = 
  | "dashboard"
  | "workflow-engine"
  | "projects"
  | "bim-models"
  | "site-progress"
  | "ai-analysis"
  | "schedules"
  | "activities"
  | "reports"
  | "issues"
  | "notifications"
  | "users"
  | "settings"
  | "architecture"
  | "prd"
  | "roadmap"
  | "design-system"
  | "commercial-billing"
  | "quality-management"
  | "intelligence-engine"
  | "reality-capture"
  | "safety-intelligence";

interface AppState {
  // Navigation & Layout
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  
  // Project Info
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  activeProject: {
    id: string;
    name: string;
    location: string;
    totalCost: string;
    reraId: string;
    constructionArea: string;
    targetDate: string;
    overallProgress: number;
  };
  setActiveProject: (project: {
    id: string;
    name: string;
    location: string;
    totalCost: string;
    reraId: string;
    constructionArea: string;
    targetDate: string;
    overallProgress: number;
  }) => void;
  
  // Selection States
  selectedElement: BIMElement | null;
  selectedAnomaly: Anomaly | null;
  setSelectedElement: (element: BIMElement | null) => void;
  setSelectedAnomaly: (anomaly: Anomaly | null) => void;
  
  // Sync handlers
  selectElementById: (id: string | null) => void;
  selectAnomalyById: (id: string | null) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // tracprogress® & Landing Page integration
  showLandingPage: boolean;
  setShowLandingPage: (show: boolean) => void;
  isTracProgressMode: boolean;
  setIsTracProgressMode: (mode: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  
  currentWeek: 3,
  setCurrentWeek: (week) => set({ currentWeek: week }),
  
  activeProject: {
    id: "btp-block-b",
    name: "Bangalore Tech Park - Block B",
    location: "Whitefield, Bengaluru, Karnataka, India",
    totalCost: "₹18.5 Crores",
    reraId: "KA-RERA-2026-0389",
    constructionArea: "45,000 sq ft",
    targetDate: "Q4 2026",
    overallProgress: 72.4,
  },
  setActiveProject: (project) => set({ activeProject: project }),
  
  selectedElement: null,
  selectedAnomaly: null,
  
  setSelectedElement: (element) => set({ selectedElement: element }),
  setSelectedAnomaly: (anomaly) => set({ selectedAnomaly: anomaly }),
  
  selectElementById: (id) => {
    if (!id) {
      set({ selectedElement: null, selectedAnomaly: null });
      return;
    }
    const projectId = get().activeProject.id;
    const projectBimElements = getProjectBimElements(projectId);
    const found = projectBimElements.find((e) => e.id === id);
    
    let element: BIMElement | null = null;
    if (found) {
      element = {
        id: found.id,
        name: found.name,
        category: found.category,
        type: found.type as any,
        progress: found.status === "completed" ? 100 : (found.status === "in_progress" ? 60 : (found.status === "delayed" ? 30 : 0)),
        status: found.status === "completed" ? "completed" : (found.status === "delayed" ? "delayed" : (found.status === "in_progress" ? "in_progress" : "not_started")),
        position: found.position,
        size: found.size,
        anomalyId: BIM_ELEMENTS_LOOKUP.find(l => l.id === found.id)?.anomalyId
      };
    }
    
    set({ selectedElement: element });
    
    // Auto-sync anomaly if it exists
    if (element && element.anomalyId) {
      const anomaly = SITE_ANOMALIES.find((a) => a.id === element.anomalyId) || null;
      set({ selectedAnomaly: anomaly });
    } else {
      set({ selectedAnomaly: null });
    }
  },
  
  selectAnomalyById: (id) => {
    if (!id) {
      set({ selectedAnomaly: null, selectedElement: null });
      return;
    }
    const anomaly = SITE_ANOMALIES.find((a) => a.id === id) || null;
    set({ selectedAnomaly: anomaly });
    
    // Auto-sync element if it exists
    if (anomaly && anomaly.elementId) {
      const projectId = get().activeProject.id;
      const projectBimElements = getProjectBimElements(projectId);
      const found = projectBimElements.find((e) => e.id === anomaly.elementId);
      
      let element: BIMElement | null = null;
      if (found) {
        element = {
          id: found.id,
          name: found.name,
          category: found.category,
          type: found.type as any,
          progress: found.status === "completed" ? 100 : (found.status === "in_progress" ? 60 : (found.status === "delayed" ? 30 : 0)),
          status: found.status === "completed" ? "completed" : (found.status === "delayed" ? "delayed" : (found.status === "in_progress" ? "in_progress" : "not_started")),
          position: found.position,
          size: found.size,
          anomalyId: anomaly.id
        };
      }
      set({ selectedElement: element });
    } else {
      set({ selectedElement: null });
    }
  },
  
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  showLandingPage: true,
  setShowLandingPage: (show) => set({ showLandingPage: show }),
  isTracProgressMode: false,
  setIsTracProgressMode: (mode) => set({ isTracProgressMode: mode }),
}));
