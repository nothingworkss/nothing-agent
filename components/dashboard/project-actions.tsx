"use client";

import {
  Copy,
  ExternalLink,
  Loader2,
  PanelRightOpen,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";

import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { useToast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import type { ProjectWithRuntime } from "@/lib/project-runtime";
import { cn } from "@/lib/utils";

interface ProjectActionsProps {
  project: ProjectWithRuntime;
  mode?: "card" | "page" | "peek" | "compact";
}

export function ProjectActions({
  project,
  mode = "page",
}: ProjectActionsProps) {
  const {
    busyActions,
    copyProjectUrl,
    openProjectWindow,
    runAction,
    setPeekProjectId,
  } = useProjectRuntime();
  const { toast, dismiss } = useToast();

  const busyAction = busyActions[project.id];
  const isBusy = Boolean(busyAction);
  const isRunning = project.runtime.status === "running";
  const baseSize = mode === "page" ? "lg" : "sm";
  const compact = mode === "compact";

  const handleAction = async (action: "start" | "stop" | "restart") => {
    const labels = { start: "시작", stop: "중지", restart: "재시작" } as const;
    const loadingId = toast("loading", `${project.shortName} ${labels[action]} 중…`);
    const ok = await runAction(project.id, action);
    dismiss(loadingId);
    if (ok) {
      toast("success", `${project.shortName} ${labels[action]} 완료`);
    } else {
      toast("error", `${project.shortName} ${labels[action]} 실패`);
    }
  };

  const handleCopy = async () => {
    const ok = await copyProjectUrl(project);
    if (ok) {
      toast("success", "주소가 복사되었어요");
    } else {
      toast("error", "복사에 실패했어요");
    }
  };

  return (
    <div
      className={
        mode === "card" || mode === "compact"
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {isRunning ? (
        <>
          <Button
            size={baseSize}
            variant="destructive"
            disabled={isBusy}
            onClick={() => void handleAction("stop")}
            className="rounded-full border-red-500/15 bg-red-500/10 text-red-700 hover:bg-red-500/15"
          >
            {busyAction === "stop" ? <Loader2 className="animate-spin" /> : <Square />}
            {compact ? "중지" : "중지"}
          </Button>
          <Button
            size={baseSize}
            variant="outline"
            disabled={isBusy}
            onClick={() => void handleAction("restart")}
            className={cn("rounded-full bg-white/65", compact && "hidden")}
          >
            {busyAction === "restart" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RotateCcw />
            )}
            재시작
          </Button>
          <Button
            size={baseSize}
            variant="outline"
            onClick={() => openProjectWindow(project)}
            className="rounded-full bg-white/65"
          >
            <ExternalLink />
            열기
          </Button>
        </>
      ) : (
        <Button
          size={baseSize}
          disabled={isBusy}
          onClick={() => void handleAction("start")}
          className="rounded-full bg-[#2a2722] text-[#f8f3e8] shadow-[0_12px_34px_-22px_rgba(42,39,34,0.9)] hover:bg-[#373229]"
        >
          {busyAction === "start" ? <Loader2 className="animate-spin" /> : <Play />}
          {project.runtime.status === "starting" ? "시작 중…" : "시작"}
        </Button>
      )}

      {mode !== "card" && mode !== "compact" && (
        <Button
          size={baseSize}
          variant="outline"
          onClick={() => void handleCopy()}
          className="rounded-full bg-white/65"
        >
          <Copy />
          주소 복사
        </Button>
      )}

      <Button
        size={baseSize}
        variant={mode === "page" ? "ghost" : "outline"}
        onClick={() => setPeekProjectId(project.id)}
        className={cn("rounded-full", mode !== "page" && "bg-white/65")}
      >
        <PanelRightOpen />
        Peek
      </Button>
    </div>
  );
}
