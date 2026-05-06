"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";

import { ProjectActions } from "@/components/dashboard/project-actions";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { formatRelativeTime } from "@/lib/format";
import { getProjectServerLabel } from "@/lib/projects";
import type { ProjectWithRuntime } from "@/lib/project-runtime";
import { cn } from "@/lib/utils";

interface ProjectListItemProps {
  project: ProjectWithRuntime;
  featured?: boolean;
}

export function ProjectListItem({
  project,
  featured = false,
}: ProjectListItemProps) {
  const latestLog = project.runtime.logs.at(-1);

  return (
    <article
      className={cn(
        "w-full min-w-0 rounded-[1.35rem] border border-slate-900/8 bg-white/82 p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.42)]",
        featured && "rounded-[1.55rem] p-5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{project.icon}</span>
            <ProjectStatusBadge project={project} compact />
          </div>
          <Link
            href={project.route}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <span className="truncate">{project.name}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Port
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {getProjectServerLabel(project)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <Terminal className="size-3.5 shrink-0" />
          <span className="truncate">
            {latestLog
              ? latestLog
              : `최근 체크 ${formatRelativeTime(
                  project.runtime.lastHealthCheckAt ?? project.runtime.updatedAt
                )}`}
          </span>
        </div>
        <span className="shrink-0">{project.shortName}</span>
      </div>

      <div className="mt-3">
        <ProjectActions project={project} mode="compact" />
      </div>
    </article>
  );
}
