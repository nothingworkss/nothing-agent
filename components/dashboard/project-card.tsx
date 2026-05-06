"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";

import { ProjectActions } from "@/components/dashboard/project-actions";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { getProjectServerLabel } from "@/lib/projects";
import type { ProjectWithRuntime } from "@/lib/project-runtime";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectWithRuntime;
  featured?: boolean;
}

export function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const latestLog = project.runtime.logs.at(-1);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border p-5 transition-transform duration-300 hover:-translate-y-0.5",
        "shadow-[0_18px_50px_-36px_rgba(15,23,42,0.48)]",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-24 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_68%)] before:opacity-90",
        project.color,
        project.runtime.status === "running" &&
          "shadow-[0_28px_80px_-40px_rgba(124,58,237,0.32)]",
        featured && "min-h-[22rem] p-6 md:min-h-[24rem]"
      )}
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-3xl md:text-4xl">{project.icon}</span>
              <ProjectStatusBadge project={project} compact />
            </div>
            <Link
              href={project.route}
              className="inline-flex items-center gap-2 text-left text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <span className="text-balance">{project.name}</span>
              <ArrowUpRight className="size-4" />
            </Link>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {project.description}
            </p>
          </div>
          <Badge variant="secondary" className="rounded-full px-2.5 py-1">
            {project.techStack}
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-slate-700/80 md:grid-cols-3">
          <div className="rounded-2xl border border-white/50 bg-white/70 p-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Port
            </p>
            <p className="mt-1 font-medium text-foreground">
              {getProjectServerLabel(project)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/50 bg-white/70 p-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Last Check
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formatRelativeTime(
                project.runtime.lastHealthCheckAt ?? project.runtime.updatedAt
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-white/50 bg-white/70 p-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Category
            </p>
            <p className="mt-1 font-medium text-foreground">{project.shortName}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-slate-950/6 bg-slate-950/[0.045] p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <Terminal className="size-3.5" />
            Live Signal
          </div>
          <p className="line-clamp-2 min-h-11 font-mono text-[12px] leading-5 text-foreground/80">
            {latestLog ?? "최근 로그가 없어요. 시작 후 여기에 실시간 신호가 표시됩니다."}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <ProjectActions project={project} mode="card" />
        </div>
      </div>
    </article>
  );
}
