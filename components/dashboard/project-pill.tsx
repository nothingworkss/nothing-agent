"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { ProjectWithRuntime } from "@/lib/project-runtime";
import { cn } from "@/lib/utils";

interface ProjectPillProps {
  project: ProjectWithRuntime;
}

export function ProjectPill({ project }: ProjectPillProps) {
  const statusClass =
    project.runtime.status === "error"
      ? "bg-destructive"
      : project.runtime.status === "starting"
        ? "bg-amber-500 animate-pulse"
        : project.runtime.status === "running" && !project.runtime.healthy
          ? "bg-amber-500"
          : project.runtime.status === "running"
            ? "bg-emerald-400"
            : "bg-slate-400";

  return (
    <Link
      href={project.route}
      className={cn(
        "group inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-900/8 bg-white/88 px-4 py-3 text-sm shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:border-slate-900/12 hover:bg-white",
        project.runtime.status === "running" &&
          "border-emerald-200/80 bg-emerald-50/70"
      )}
    >
      <span className="shrink-0 text-base">{project.icon}</span>
      <span className="min-w-0 truncate font-medium text-foreground">
        {project.shortName}
      </span>
      <span
        aria-hidden="true"
        className={cn("size-2 shrink-0 rounded-full", statusClass)}
      />
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </Link>
  );
}
