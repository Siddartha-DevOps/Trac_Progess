import { useState, useEffect } from "react";
import { WorkerPPEState, Incident, NearMiss, Hazard, SafetyAudit, CameraStream, VideoEvent } from "./types";
import { 
  SafetyService, 
  PPEService, 
  IncidentService, 
  HazardService, 
  AuditService, 
  VideoService, 
  NotificationService 
} from "./safetyServices";

/**
 * useSafety Hook
 * Provides executive dashboard KPI states, alert lists, and general safety index trends.
 */
export function useSafety() {
  const [kpis, setKpis] = useState(SafetyService.getExecutiveKPIs());
  const [alerts, setAlerts] = useState(NotificationService.getNotifications());
  const [insights, setInsights] = useState(SafetyService.getAIInsights());
  const [trends] = useState(SafetyService.getWeeklyComplianceTrends());
  const [tradeRisks] = useState(SafetyService.getTradeRiskDistribution());

  const refreshDashboard = () => {
    setKpis(SafetyService.getExecutiveKPIs());
    setAlerts([...NotificationService.getNotifications()]);
    setInsights(SafetyService.getAIInsights());
  };

  const markAlertRead = (id: string) => {
    NotificationService.markAsRead(id);
    refreshDashboard();
  };

  const triggerMockAlert = (alert: Parameters<typeof NotificationService.triggerMockAlert>[0]) => {
    NotificationService.triggerMockAlert(alert);
    refreshDashboard();
  };

  return {
    kpis,
    alerts,
    insights,
    trends,
    tradeRisks,
    markAlertRead,
    triggerMockAlert,
    refreshDashboard
  };
}

/**
 * usePPE Hook
 * Provides list of workers, PPE detection logs, compliance rates, and filters.
 */
export function usePPE() {
  const [workers, setWorkers] = useState<WorkerPPEState[]>(PPEService.getWorkers());
  const [summary, setSummary] = useState(PPEService.getComplianceSummary());

  const refreshPPE = () => {
    setWorkers([...PPEService.getWorkers()]);
    setSummary(PPEService.getComplianceSummary());
  };

  const updateWorkerPPE = (workerId: string, updates: Partial<WorkerPPEState>) => {
    PPEService.updateWorkerPPE(workerId, updates);
    refreshPPE();
  };

  return {
    workers,
    summary,
    updateWorkerPPE,
    refreshPPE
  };
}

/**
 * useIncidents Hook
 * Manages core construction incidents, root causes, corrective actions, and HSE approvals.
 */
export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>(IncidentService.getIncidents());

  const refreshIncidents = () => {
    setIncidents([...IncidentService.getIncidents()]);
  };

  const createIncident = (incident: Omit<Incident, "id" | "history">) => {
    const fresh = IncidentService.createIncident(incident);
    refreshIncidents();
    return fresh;
  };

  const updateIncidentStatus = (id: string, status: Incident["status"], updatedBy: string, comment: string) => {
    const updated = IncidentService.updateIncidentStatus(id, status, updatedBy, comment);
    refreshIncidents();
    return updated;
  };

  const approveIncidentAction = (id: string, reviewerName: string, approve: boolean) => {
    const approved = IncidentService.approveIncidentAction(id, reviewerName, approve);
    refreshIncidents();
    return approved;
  };

  return {
    incidents,
    createIncident,
    updateIncidentStatus,
    approveIncidentAction,
    refreshIncidents
  };
}

/**
 * useHazards Hook
 * Provides risk classification matrices and hazard registries.
 */
export function useHazards() {
  const [hazards, setHazards] = useState<Hazard[]>(HazardService.getHazards());

  const refreshHazards = () => {
    setHazards([...HazardService.getHazards()]);
  };

  const createHazard = (hazard: Omit<Hazard, "id">) => {
    const fresh = HazardService.createHazard(hazard);
    refreshHazards();
    return fresh;
  };

  const mitigateHazard = (id: string, updatedBy: string) => {
    const mitigated = HazardService.mitigateHazard(id, updatedBy);
    refreshHazards();
    return mitigated;
  };

  return {
    hazards,
    createHazard,
    mitigateHazard,
    refreshHazards
  };
}

/**
 * useAudits Hook
 * Builds standard forms for site electrical, scaffold, lifting, and PPE compliance audits.
 */
export function useAudits() {
  const [audits, setAudits] = useState<SafetyAudit[]>(AuditService.getAudits());

  const refreshAudits = () => {
    setAudits([...AuditService.getAudits()]);
  };

  const createAudit = (audit: Omit<SafetyAudit, "id">) => {
    const fresh = AuditService.createAudit(audit);
    refreshAudits();
    return fresh;
  };

  return {
    audits,
    createAudit,
    refreshAudits
  };
}
