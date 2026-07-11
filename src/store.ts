import { create } from "zustand";
import { BIMElement, Anomaly } from "./types";
import { SITE_ANOMALIES, BIM_ELEMENTS_LOOKUP } from "./data";

export type TabType = 
  | "dashboard"
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
  | "roadmap";

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
    const element = BIM_ELEMENTS_LOOKUP.find((e) => e.id === id) || null;
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
      const element = BIM_ELEMENTS_LOOKUP.find((e) => e.id === anomaly.elementId) || null;
      set({ selectedElement: element });
    } else {
      set({ selectedElement: null });
    }
  },
  
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
