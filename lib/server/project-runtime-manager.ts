import { execSync, spawn, type ChildProcess } from "child_process";

import {
  canManageProjectLocally,
  getProjectServerUrl,
  projects,
  type Project,
} from "@/lib/projects";
import {
  createEmptyRuntimeState,
  summarizeSnapshot,
  type ProjectRuntimeSnapshot,
  type ProjectRuntimeState,
  type RuntimeAction,
  type RuntimeEvent,
  type RuntimeEventKind,
} from "@/lib/project-runtime";

type RuntimeListener = (snapshot: ProjectRuntimeSnapshot) => void;

const HEALTH_INTERVAL_MS = 8000;
const MAX_LOG_LINES = 80;
const MAX_EVENTS = 30;

class ProjectRuntimeManager {
  private readonly processes = new Map<string, ChildProcess>();
  private readonly states = new Map<string, ProjectRuntimeState>();
  private readonly listeners = new Set<RuntimeListener>();
  private readonly events: RuntimeEvent[] = [];
  private healthTimer?: NodeJS.Timeout;

  constructor() {
    for (const project of projects) {
      this.states.set(project.id, this.createInitialState(project));
    }

    this.ensureHealthTicker();
  }

  private createInitialState(project: Project): ProjectRuntimeState {
    const state = createEmptyRuntimeState(project.id, project.port);

    if (project.launchMode === "remote") {
      return {
        ...state,
        status: "running",
        health: "degraded",
        logs: [`배포 URL로 연결합니다: ${getProjectServerUrl(project)}`],
      };
    }

    if (project.launchMode === "unconfigured") {
      return {
        ...state,
        status: "error",
        error: `Railway에서 사용하려면 ${project.deploymentEnv} 변수에 배포 URL을 넣어주세요.`,
      };
    }

    return state;
  }

  subscribe(listener: RuntimeListener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): ProjectRuntimeSnapshot {
    const snapshotProjects = projects.map((project) => ({
      ...project,
      runtime:
        this.states.get(project.id) ??
        createEmptyRuntimeState(project.id, project.port),
    }));

    return {
      generatedAt: new Date().toISOString(),
      summary: summarizeSnapshot(snapshotProjects),
      projects: snapshotProjects,
      events: [...this.events],
    };
  }

  async handleAction(projectId: string, action: RuntimeAction) {
    switch (action) {
      case "start":
        return this.startProject(projectId);
      case "stop":
        return this.stopProject(projectId);
      case "restart":
        await this.stopProject(projectId, { silent: true });
        return this.startProject(projectId);
      default:
        throw new Error("지원하지 않는 동작이에요.");
    }
  }

  private ensureHealthTicker() {
    if (this.healthTimer) return;

    this.healthTimer = setInterval(() => {
      void this.refreshHealth();
    }, HEALTH_INTERVAL_MS);
  }

  private getState(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) {
      throw new Error("프로젝트를 찾을 수 없어요.");
    }

    const state =
      this.states.get(projectId) ??
      createEmptyRuntimeState(project.id, project.port);

    if (!this.states.has(projectId)) {
      this.states.set(projectId, state);
    }

    return { project, state };
  }

  private setState(projectId: string, update: Partial<ProjectRuntimeState>) {
    const { state } = this.getState(projectId);
    const nextState: ProjectRuntimeState = {
      ...state,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    this.states.set(projectId, nextState);
    this.broadcast();
    return nextState;
  }

  private pushEvent(
    kind: RuntimeEventKind,
    title: string,
    message: string,
    projectId?: string
  ) {
    this.events.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      title,
      message,
      projectId,
      timestamp: new Date().toISOString(),
    });
    this.events.splice(MAX_EVENTS);
    this.broadcast();
  }

  private appendLog(projectId: string, message: string) {
    const normalized = message.trim();
    if (!normalized) return;

    const { state } = this.getState(projectId);
    const nextLogs = [...state.logs, normalized].slice(-MAX_LOG_LINES);
    this.setState(projectId, { logs: nextLogs });
  }

  private broadcast() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private findListeningPids(port: number) {
    try {
      const output = execSync(`lsof -nP -tiTCP:${port} -sTCP:LISTEN`, {
        stdio: "pipe",
      })
        .toString()
        .trim();

      if (!output) return [];

      return output
        .split("\n")
        .map((line) => Number.parseInt(line, 10))
        .filter((pid) => Number.isFinite(pid));
    } catch {
      return [];
    }
  }

  private killPidList(pids: number[]) {
    for (const pid of pids) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // ignore
      }
    }
  }

  private async wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForReady(port: number, attempts = 18) {
    for (let index = 0; index < attempts; index += 1) {
      await this.wait(500);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const response = await fetch(`http://127.0.0.1:${port}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok || response.status < 500) {
          return true;
        }
      } catch {
        // not ready yet
      }
    }

    return false;
  }

  private async refreshProjectHealth(projectId: string) {
    const { project, state } = this.getState(projectId);

    if (project.launchMode === "remote") {
      const url = getProjectServerUrl(project);
      const reachable = await this.pingUrl(url);
      const now = new Date().toISOString();

      this.setState(projectId, {
        status: "running",
        healthy: reachable,
        health: reachable ? "healthy" : "degraded",
        pid: undefined,
        lastHealthCheckAt: now,
        lastReadyAt: reachable ? state.lastReadyAt ?? now : state.lastReadyAt,
        error: reachable ? null : `${url} 응답 확인이 필요해요.`,
        logs:
          state.logs.length > 0
            ? state.logs
            : [`배포 URL로 연결합니다: ${url}`],
      });
      return;
    }

    if (project.launchMode === "unconfigured") {
      this.setState(projectId, {
        status: "error",
        healthy: false,
        health: "offline",
        pid: undefined,
        lastHealthCheckAt: new Date().toISOString(),
        error: `Railway에서 사용하려면 ${project.deploymentEnv} 변수에 배포 URL을 넣어주세요.`,
      });
      return;
    }

    const reachable = await this.pingPort(project.port);
    const child = this.processes.get(projectId);

    if (child && reachable) {
      this.setState(projectId, {
        status: "running",
        healthy: true,
        health: "healthy",
        pid: child.pid,
        lastHealthCheckAt: new Date().toISOString(),
        error: null,
      });
      return;
    }

    if (child && !reachable) {
      this.setState(projectId, {
        status: "running",
        healthy: false,
        health: "degraded",
        lastHealthCheckAt: new Date().toISOString(),
      });
      return;
    }

    const current = this.states.get(projectId);
    const status = current?.status === "error" ? "error" : "stopped";
    this.setState(projectId, {
      status,
      healthy: false,
      health: "offline",
      pid: undefined,
      lastHealthCheckAt: new Date().toISOString(),
    });
  }

  async refreshHealth() {
    await Promise.all(projects.map((project) => this.refreshProjectHealth(project.id)));
  }

  private async pingUrl(url: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2200);
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 405) {
        return this.pingUrlWithGet(url);
      }

      return response.ok || response.status < 500;
    } catch {
      return this.pingUrlWithGet(url);
    }
  }

  private async pingUrlWithGet(url: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2200);
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok || response.status < 500;
    } catch {
      return false;
    }
  }

  private async pingPort(port: number) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const response = await fetch(`http://127.0.0.1:${port}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok || response.status < 500;
    } catch {
      return false;
    }
  }

  private buildChildEnv(serverCommand: string, port: number) {
    const env: NodeJS.ProcessEnv = { ...process.env, PORT: String(port) };

    if (serverCommand.includes("--webpack")) {
      delete env.TURBOPACK;
    }

    return env;
  }

  async startProject(projectId: string) {
    const { project, state } = this.getState(projectId);

    if (!canManageProjectLocally(project)) {
      await this.refreshProjectHealth(projectId);

      return {
        ok: project.launchMode === "remote",
        message:
          project.launchMode === "remote"
            ? "배포 URL로 연결했어요."
            : `${project.deploymentEnv} 변수에 배포 URL이 필요해요.`,
        snapshot: this.getSnapshot(),
      };
    }

    if (this.processes.has(projectId) && state.status !== "error") {
      await this.refreshProjectHealth(projectId);
      return {
        ok: true,
        message: "이미 실행 중이에요.",
        snapshot: this.getSnapshot(),
      };
    }

    const portPids = this.findListeningPids(project.port);
    if (portPids.length > 0 && !this.processes.has(projectId)) {
      this.setState(projectId, {
        status: "error",
        health: "offline",
        healthy: false,
        error: `localhost:${project.port} 포트를 이미 다른 프로세스가 사용 중이에요.`,
        lastAction: "start",
      });
      this.pushEvent(
        "warning",
        "포트 충돌",
        `${project.name}가 사용할 localhost:${project.port} 포트가 이미 사용 중이에요.`,
        projectId
      );
      return {
        ok: false,
        error: `localhost:${project.port} 포트를 이미 다른 프로세스가 사용 중이에요. 충돌을 먼저 정리해 주세요.`,
        snapshot: this.getSnapshot(),
      };
    }

    this.setState(projectId, {
      status: "starting",
      health: "degraded",
      healthy: false,
      error: null,
      lastAction: "start",
      startedAt: new Date().toISOString(),
      lastExitCode: null,
    });
    this.pushEvent("info", "프로젝트 시작", `${project.name} 실행을 시작했어요.`, projectId);

    try {
      const child = spawn(project.serverCommand, {
        cwd: project.path,
        env: this.buildChildEnv(project.serverCommand, project.port),
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
      });

      this.processes.set(projectId, child);
      this.setState(projectId, { pid: child.pid });

      child.stdout?.on("data", (data: Buffer) => {
        this.appendLog(projectId, data.toString());
      });

      child.stderr?.on("data", (data: Buffer) => {
        this.appendLog(projectId, `[err] ${data.toString()}`);
      });

      child.on("exit", (code) => {
        this.processes.delete(projectId);
        this.setState(projectId, {
          status: code === 0 ? "stopped" : "error",
          health: "offline",
          healthy: false,
          pid: undefined,
          lastExitCode: code,
          error: code === 0 ? null : "프로세스가 예상보다 빨리 종료됐어요.",
        });
        this.pushEvent(
          code === 0 ? "info" : "error",
          code === 0 ? "프로젝트 중지" : "프로젝트 종료",
          `${project.name} 프로세스가 종료됐어요.${code === 0 ? "" : ` (code ${code})`}`,
          projectId
        );
      });

      child.on("error", (error) => {
        this.processes.delete(projectId);
        this.setState(projectId, {
          status: "error",
          health: "offline",
          healthy: false,
          pid: undefined,
          error: error.message,
        });
        this.pushEvent("error", "실행 실패", error.message, projectId);
      });

      const ready = await this.waitForReady(project.port);
      if (ready) {
        this.setState(projectId, {
          status: "running",
          health: "healthy",
          healthy: true,
          error: null,
          lastReadyAt: new Date().toISOString(),
          lastHealthCheckAt: new Date().toISOString(),
        });
        this.pushEvent(
          "success",
          "실행 완료",
          `${project.name}가 localhost:${project.port}에서 준비됐어요.`,
          projectId
        );
      } else if (this.processes.has(projectId)) {
        this.setState(projectId, {
          status: "running",
          health: "degraded",
          healthy: false,
          error: "프로세스는 살아 있지만 헬스 체크가 아직 불안정해요.",
          lastHealthCheckAt: new Date().toISOString(),
        });
        this.pushEvent(
          "warning",
          "지연 시작",
          `${project.name}가 천천히 올라오고 있어요. 로그를 확인해 주세요.`,
          projectId
        );
      }

      return {
        ok: true,
        port: project.port,
        pid: child.pid,
        snapshot: this.getSnapshot(),
      };
    } catch (error) {
      this.processes.delete(projectId);
      const message = error instanceof Error ? error.message : String(error);
      this.setState(projectId, {
        status: "error",
        health: "offline",
        healthy: false,
        pid: undefined,
        error: message,
      });
      this.pushEvent("error", "실행 실패", message, projectId);
      return {
        ok: false,
        error: `시작 실패: ${message}`,
        snapshot: this.getSnapshot(),
      };
    }
  }

  async stopProject(projectId: string, options?: { silent?: boolean }) {
    const { project } = this.getState(projectId);

    if (!canManageProjectLocally(project)) {
      await this.refreshProjectHealth(projectId);

      return {
        ok: project.launchMode === "remote",
        snapshot: this.getSnapshot(),
      };
    }

    const child = this.processes.get(projectId);

    if (child) {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }

    const portPids = this.findListeningPids(project.port);
    if (portPids.length > 0) {
      this.killPidList(portPids);
    }

    await this.wait(400);
    this.processes.delete(projectId);

    this.setState(projectId, {
      status: "stopped",
      health: "offline",
      healthy: false,
      pid: undefined,
      error: null,
      lastAction: "stop",
      lastExitCode: 0,
      lastHealthCheckAt: new Date().toISOString(),
    });

    if (!options?.silent) {
      this.pushEvent("info", "프로젝트 중지", `${project.name}를 중지했어요.`, projectId);
    }

    return {
      ok: true,
      snapshot: this.getSnapshot(),
    };
  }
}

declare global {
  var __agentHubRuntimeManager: ProjectRuntimeManager | undefined;
}

export function getProjectRuntimeManager() {
  if (!global.__agentHubRuntimeManager) {
    global.__agentHubRuntimeManager = new ProjectRuntimeManager();
  }

  return global.__agentHubRuntimeManager;
}
