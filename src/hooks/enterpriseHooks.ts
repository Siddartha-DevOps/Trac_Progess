import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../services/db";
import { 
  ProjectService, IssueService, ScheduleService, 
  DocumentService, BuildingService, NotificationService 
} from "../services/services";
import { Project, Issue, Schedule, Document, Building, Notification } from "../models/domain";

// Global simple cache to simulate React Query caching
const queryCache: Record<string, any> = {};

// Helper to simulate React Query fetch pattern
function useQuerySimulation<T>(
  queryKey: string,
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean; refetchInterval?: number } = {}
) {
  const [data, setData] = useState<T | null>(() => {
    return queryCache[queryKey] !== undefined ? queryCache[queryKey] : null;
  });
  const [isLoading, setIsLoading] = useState(() => queryCache[queryKey] === undefined);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const isEnabled = options.enabled !== false;

  const fetchRef = useRef(fetchFn);
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const executeFetch = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      const result = await fetchRef.current();
      queryCache[queryKey] = result;
      setData(result);
    } catch (err: any) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [queryKey]);

  useEffect(() => {
    if (!isEnabled) return;
    
    // Subscribe to DB changes to auto-sync state in real-time
    const unsubscribe = db.subscribe(() => {
      executeFetch();
    });

    executeFetch();

    return () => {
      unsubscribe();
    };
  }, [executeFetch, isEnabled, refetchCount]);

  // Periodic polling simulation if requested
  useEffect(() => {
    if (!isEnabled || !options.refetchInterval) return;
    const interval = setInterval(() => {
      setRefetchCount(prev => prev + 1);
    }, options.refetchInterval);
    return () => clearInterval(interval);
  }, [isEnabled, options.refetchInterval]);

  const refetch = useCallback(() => {
    setRefetchCount(prev => prev + 1);
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isSuccess: !isLoading && !isError
  };
}

// 1. useProjects Hook
export function useProjects(filters?: { search?: string; status?: string }) {
  const fetchFn = useCallback(async () => {
    let list = await ProjectService.getAll();
    if (filters?.status) {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters?.search) {
      list = await ProjectService.search(filters.search, ["name", "location"]);
    }
    return list;
  }, [filters?.search, filters?.status]);

  const query = useQuerySimulation<Project[]>("projects", fetchFn);

  // Optimistic Create Mutation Simulation
  const createProject = async (newProj: Omit<Project, "id"> & { id?: string }) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticProj: Project = { ...newProj, id: tempId } as Project;
    
    // Optimistically update cache
    if (query.data) {
      queryCache["projects"] = [...query.data, optimisticProj];
    }

    try {
      const saved = await ProjectService.create(newProj);
      db.addProject(saved); // will notify db and trigger refetch
      return saved;
    } catch (err) {
      // rollback is handled automatically since db.subscribe will sync back to db state
      throw err;
    }
  };

  return {
    ...query,
    projects: query.data || [],
    createProject
  };
}

// 2. useProject Hook
export function useProject(projectId: string) {
  const fetchFn = useCallback(async () => {
    if (!projectId) return null;
    return ProjectService.getById(projectId);
  }, [projectId]);

  const query = useQuerySimulation<Project | null>(`project-${projectId}`, fetchFn, {
    enabled: !!projectId
  });

  return {
    ...query,
    project: query.data
  };
}

// 3. useIssues Hook (Quality & CV Anomaly Ledger)
export function useIssues(options?: { projectId?: string; status?: string; search?: string }) {
  const fetchFn = useCallback(async () => {
    let list = await IssueService.getAll();
    if (options?.projectId) {
      // simulate project-specific issue filtering
      list = list.filter(i => i.id.startsWith("anom_") || i.assignedTradeId !== undefined);
    }
    if (options?.status) {
      list = list.filter(i => i.status === options.status);
    }
    if (options?.search) {
      list = await IssueService.search(options.search, ["title", "description", "elementName"]);
    }
    return list;
  }, [options?.projectId, options?.status, options?.search]);

  const query = useQuerySimulation<Issue[]>(`issues-${options?.projectId || "all"}`, fetchFn);

  // Optimistic Issue Update
  const updateIssueStatus = async (issueId: string, newStatus: "open" | "resolved" | "monitoring") => {
    if (query.data) {
      queryCache[`issues-${options?.projectId || "all"}`] = query.data.map(i => 
        i.id === issueId ? { ...i, status: newStatus } : i
      );
    }
    const updated = await IssueService.update(issueId, { status: newStatus });
    return updated;
  };

  return {
    ...query,
    issues: query.data || [],
    updateIssueStatus
  };
}

// 4. useSchedules Hook
export function useSchedules(projectId?: string) {
  const fetchFn = useCallback(async () => {
    return ScheduleService.getAll();
  }, [projectId]);

  const query = useQuerySimulation<Schedule[]>(`schedules-${projectId || "all"}`, fetchFn);

  const updateScheduleProgress = async (id: string, progress: number) => {
    const status = progress === 100 ? "completed" : (progress > 0 ? "in_progress" : "not_started");
    const updated = await ScheduleService.update(id, { progress, status });
    return updated;
  };

  return {
    ...query,
    schedules: query.data || [],
    updateScheduleProgress
  };
}

// 5. useAnalytics Hook
export function useAnalytics(projectId?: string) {
  const fetchFn = useCallback(async () => {
    return {
      safetyRating: 98.4,
      healthScore: 92.1,
      totalCarbonFootprint: "1,240 MT CO2e",
      rebarWasteReduced: "14%",
      complianceAuditCount: 24,
      recentPerformanceMetrics: [
        { name: "Week 1", planned: 25, actual: 25 },
        { name: "Week 2", planned: 50, actual: 48 },
        { name: "Week 3", planned: 75, actual: 72 }
      ]
    };
  }, [projectId]);

  const query = useQuerySimulation<any>(`analytics-${projectId || "all"}`, fetchFn);

  return {
    ...query,
    analytics: query.data
  };
}

// 6. useBuildings Hook
export function useBuildings(projectId?: string) {
  const fetchFn = useCallback(async () => {
    if (!projectId) return BuildingService.getAll();
    return BuildingService.getByProjectId(projectId);
  }, [projectId]);

  const query = useQuerySimulation<Building[]>(`buildings-${projectId || "all"}`, fetchFn, {
    enabled: !!projectId
  });

  return {
    ...query,
    buildings: query.data || []
  };
}

// 7. useDocuments Hook (BIM models, 3D laser scans, site recordings)
export function useDocuments() {
  const fetchFn = useCallback(async () => {
    return DocumentService.getAll();
  }, []);

  const query = useQuerySimulation<Document[]>("documents", fetchFn);

  const uploadDocument = async (doc: Omit<Document, "id">) => {
    const saved = await DocumentService.create(doc);
    return saved;
  };

  return {
    ...query,
    documents: query.data || [],
    uploadDocument
  };
}

// 8. useNotifications Hook
export function useNotifications() {
  const fetchFn = useCallback(async () => {
    return NotificationService.getAll();
  }, []);

  const query = useQuerySimulation<Notification[]>("notifications", fetchFn, {
    refetchInterval: 30000 // Poll notification feed every 30 seconds
  });

  const markRead = async (id: string) => {
    await NotificationService.markAsRead(id);
  };

  return {
    ...query,
    notifications: query.data || [],
    markRead
  };
}
