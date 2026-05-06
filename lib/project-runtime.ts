import type { Project, ProjectCategory } from "@/lib/projects";

export type RuntimeStatus = "stopped" | "starting" | "running" | "error";
export type RuntimeAction = "start" | "stop" | "restart";
export type RuntimeHealth = "healthy" | "degraded" | "offline";
export type RuntimeEventKind = "info" | "success" | "warning" | "error";

export interface RuntimeEvent {
  id: string;
  kind: RuntimeEventKind;
  title: string;
  message: string;
  projectId?: string;
  timestamp: string;
}

export interface ProjectRuntimeState {
  projectId: string;
  port: number;
  status: RuntimeStatus;
  health: RuntimeHealth;
  healthy: boolean;
  pid?: number;
  error?: string | null;
  logs: string[];
  startedAt?: string;
  updatedAt: string;
  lastHealthCheckAt?: string;
  lastReadyAt?: string;
  lastExitCode?: number | null;
  lastAction?: RuntimeAction;
}

export interface ProjectWithRuntime extends Project {
  runtime: ProjectRuntimeState;
}

export interface ProjectRuntimeSummary {
  total: number;
  running: number;
  healthy: number;
  starting: number;
  errors: number;
  automation: number;
}

export interface ProjectRuntimeSnapshot {
  generatedAt: string;
  summary: ProjectRuntimeSummary;
  projects: ProjectWithRuntime[];
  events: RuntimeEvent[];
}

export function createEmptyRuntimeState(
  projectId: string,
  port: number
): ProjectRuntimeState {
  return {
    projectId,
    port,
    status: "stopped",
    health: "offline",
    healthy: false,
    logs: [],
    updatedAt: new Date().toISOString(),
  };
}

export function getHealthLabel(health: RuntimeHealth) {
  switch (health) {
    case "healthy":
      return "정상";
    case "degraded":
      return "불안정";
    case "offline":
      return "오프라인";
    default:
      return "알 수 없음";
  }
}

export function summarizeSnapshot(
  projects: ProjectWithRuntime[]
): ProjectRuntimeSummary {
  return {
    total: projects.length,
    running: projects.filter((project) => project.runtime.status === "running")
      .length,
    healthy: projects.filter((project) => project.runtime.healthy).length,
    starting: projects.filter((project) => project.runtime.status === "starting")
      .length,
    errors: projects.filter((project) => project.runtime.status === "error")
      .length,
    automation: projects.filter((project) => project.category === "automation")
      .length,
  };
}

export function countProjectsByCategory(
  projects: ProjectWithRuntime[],
  category: ProjectCategory
) {
  return projects.filter((project) => project.category === category).length;
}
