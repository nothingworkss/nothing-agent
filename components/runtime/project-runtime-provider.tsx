"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getProjectServerUrl, projects } from "@/lib/projects";
import {
  createEmptyRuntimeState,
  type ProjectRuntimeSnapshot,
  type RuntimeAction,
} from "@/lib/project-runtime";

interface ProjectRuntimeContextValue {
  snapshot: ProjectRuntimeSnapshot;
  connected: boolean;
  busyActions: Record<string, RuntimeAction | undefined>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  peekProjectId: string | null;
  setPeekProjectId: (projectId: string | null) => void;
  runAction: (projectId: string, action: RuntimeAction) => Promise<boolean>;
  refresh: () => Promise<void>;
  openProjectWindow: (project: { port: number; serverPath?: string }) => void;
  copyProjectUrl: (project: { port: number; serverPath?: string }) => Promise<boolean>;
}

const emptySnapshot: ProjectRuntimeSnapshot = {
  generatedAt: new Date().toISOString(),
  summary: {
    total: projects.length,
    running: 0,
    healthy: 0,
    starting: 0,
    errors: 0,
    automation: projects.filter((project) => project.category === "automation")
      .length,
  },
  projects: projects.map((project) => ({
    ...project,
    runtime: createEmptyRuntimeState(project.id, project.port),
  })),
  events: [],
};

const ProjectRuntimeContext =
  createContext<ProjectRuntimeContextValue | null>(null);

export function ProjectRuntimeProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ProjectRuntimeSnapshot>(emptySnapshot);
  const [connected, setConnected] = useState(false);
  const [busyActions, setBusyActions] = useState<
    Record<string, RuntimeAction | undefined>
  >({});
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [peekProjectId, setPeekProjectId] = useState<string | null>(null);

  const applySnapshot = useCallback((nextSnapshot: ProjectRuntimeSnapshot) => {
    startTransition(() => {
      setSnapshot(nextSnapshot);
    });
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/projects", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("프로젝트 상태를 불러오지 못했어요.");
    }

    const nextSnapshot = (await response.json()) as ProjectRuntimeSnapshot;
    applySnapshot(nextSnapshot);
  }, [applySnapshot]);

  useEffect(() => {
    let disposed = false;
    let source: EventSource | null = null;

    const connect = () => {
      source = new EventSource("/api/projects/stream");

      source.addEventListener("snapshot", (event) => {
        if (disposed) return;
        const nextSnapshot = JSON.parse(
          (event as MessageEvent<string>).data
        ) as ProjectRuntimeSnapshot;
        setConnected(true);
        applySnapshot(nextSnapshot);
      });

      source.onerror = () => {
        if (disposed) return;
        setConnected(false);
      };

      source.onopen = () => {
        if (disposed) return;
        setConnected(true);
      };
    };

    void refresh().catch(() => {
      setConnected(false);
    });
    connect();

    return () => {
      disposed = true;
      source?.close();
    };
  }, [applySnapshot, refresh]);

  const runAction = useCallback(
    async (projectId: string, action: RuntimeAction) => {
      setBusyActions((current) => ({ ...current, [projectId]: action }));

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, action }),
        });
        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          snapshot?: ProjectRuntimeSnapshot;
        };

        if (payload.snapshot) {
          applySnapshot(payload.snapshot);
        }

        if (!response.ok || !payload.ok) {
          console.error(payload.error ?? "작업을 완료하지 못했어요.");
          return false;
        }

        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setBusyActions((current) => ({ ...current, [projectId]: undefined }));
      }
    },
    [applySnapshot]
  );

  const value = useMemo<ProjectRuntimeContextValue>(
    () => ({
      snapshot,
      connected,
      busyActions,
      commandPaletteOpen,
      setCommandPaletteOpen,
      peekProjectId,
      setPeekProjectId,
      runAction,
      refresh,
      openProjectWindow: (project) => {
        window.open(
          getProjectServerUrl(project),
          "_blank",
          "noopener,noreferrer"
        );
      },
      copyProjectUrl: async (project) => {
        try {
          await navigator.clipboard.writeText(getProjectServerUrl(project));
          return true;
        } catch {
          return false;
        }
      },
    }),
    [
      snapshot,
      connected,
      busyActions,
      commandPaletteOpen,
      peekProjectId,
      runAction,
      refresh,
    ]
  );

  return (
    <ProjectRuntimeContext.Provider value={value}>
      {children}
    </ProjectRuntimeContext.Provider>
  );
}

export function useProjectRuntime() {
  const context = useContext(ProjectRuntimeContext);

  if (!context) {
    throw new Error("useProjectRuntime must be used within ProjectRuntimeProvider");
  }

  return context;
}
