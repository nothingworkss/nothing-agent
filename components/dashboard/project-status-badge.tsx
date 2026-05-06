"use client";

import { Badge } from "@/components/ui/badge";
import type { ProjectWithRuntime } from "@/lib/project-runtime";
import { getRuntimeLabel, getStatusTone } from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

export function ProjectStatusBadge({
  project,
  compact = false,
}: {
  project: ProjectWithRuntime;
  compact?: boolean;
}) {
  const { runtime } = project;
  const tone = getStatusTone(runtime.status, runtime.health);
  const config = {
    danger: {
      label: getRuntimeLabel(project),
      variant: "destructive" as const,
      dot: "bg-red-500",
      className: "border-red-500/20 bg-red-500/10 text-red-700",
    },
    warning: {
      label: getRuntimeLabel(project),
      variant: "outline" as const,
      dot: "bg-amber-500",
      className: "border-amber-500/25 bg-amber-500/10 text-amber-700",
    },
    success: {
      label: getRuntimeLabel(project),
      variant: "outline" as const,
      dot: "bg-emerald-500",
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
    },
    neutral: {
      label: getRuntimeLabel(project),
      variant: "outline" as const,
      dot: "bg-stone-400",
      className: "border-black/10 bg-white/55 text-muted-foreground",
    },
  }[tone];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "h-auto gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]",
        config.className,
        compact && "px-2 py-0.5 text-[10px]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          config.dot,
          runtime.status === "starting" && "animate-pulse"
        )}
      />
      {config.label}
    </Badge>
  );
}
