"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, ArrowUpRight, Monitor, Terminal, X } from "lucide-react";

import { ProjectActions } from "@/components/dashboard/project-actions";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { getProjectServerLabel, getProjectServerUrl } from "@/lib/projects";
import {
  getProjectInitial,
  getRuntimeDescription,
} from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

export function ProjectPeekPanel() {
  const { peekProjectId, setPeekProjectId, snapshot } = useProjectRuntime();

  const project = useMemo(
    () => snapshot.projects.find((item) => item.id === peekProjectId) ?? null,
    [peekProjectId, snapshot.projects]
  );

  const events = useMemo(
    () =>
      snapshot.events.filter((event) => event.projectId === project?.id).slice(0, 8),
    [project?.id, snapshot.events]
  );

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Peek 패널 닫기"
        className="absolute inset-0 bg-[#25221d]/35 animate-fade-in"
        onClick={() => setPeekProjectId(null)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} Peek`}
        className="absolute inset-x-0 bottom-0 top-[5vh] flex flex-col rounded-t-[1.75rem] border-t border-white/60 bg-[#f6f2e8] shadow-[0_-24px_80px_-36px_rgba(31,28,24,0.7)] animate-slide-up-sheet md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-full md:max-w-[31rem] md:rounded-t-none md:border-l md:border-t-0 md:border-black/8 md:animate-slide-in-right"
      >
        <div className="flex justify-center py-2 md:hidden">
          <span className="h-1 w-10 rounded-full bg-black/18" />
        </div>

        <div className="border-b border-black/8 px-5 pb-5 pt-2 md:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-black/8 bg-white/65 font-heading text-lg font-semibold">
                  {getProjectInitial(project)}
                </span>
                <ProjectStatusBadge project={project} />
              </div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {project.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getRuntimeDescription(project)}
              </p>
            </div>
            <button
              type="button"
              aria-label="닫기"
              className="inline-flex size-9 items-center justify-center rounded-full border border-black/8 bg-white/65 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setPeekProjectId(null)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="border-b border-black/8 px-5 py-4">
          <ProjectActions project={project} mode="peek" />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-5 py-5">
            <section className="grid grid-cols-2 gap-3">
              {[
                ["Ready", formatRelativeTime(project.runtime.lastReadyAt)],
                ["Health", project.runtime.healthy ? "정상" : "확인 필요"],
                ["Port", getProjectServerLabel(project)],
                ["Check", formatRelativeTime(project.runtime.lastHealthCheckAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/8 bg-white/58 p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 truncate font-medium text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-[1.25rem] border border-black/8 bg-white/58 p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Activity className="size-3.5" />
                Runtime
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">프로젝트 페이지</dt>
                  <dd>
                    <Link
                      href={project.route}
                      className="inline-flex items-center gap-1 font-medium text-[#7d641f]"
                    >
                      {project.route}
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">헬스 체크</dt>
                  <dd className="text-right font-medium">
                    {formatDateTime(project.runtime.lastHealthCheckAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[1.25rem] border border-black/8 bg-[#25221d] p-4 text-[#f8f3e8]">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                <Terminal className="size-3.5 text-[#d4af37]" />
                Logs
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-white/72">
                {project.runtime.logs.length > 0
                  ? project.runtime.logs.join("\n")
                  : "아직 수집된 로그가 없습니다."}
              </pre>
            </section>

            <section className="rounded-[1.25rem] border border-black/8 bg-white/58 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Signals
              </p>
              <div className="mt-3 space-y-3">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="border-l border-black/12 pl-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    최근 신호가 아직 없어요.
                  </p>
                )}
              </div>
            </section>

            {project.runtime.status === "running" ? (
              <section className="rounded-[1.25rem] border border-black/8 bg-white/58 p-4">
                <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <Monitor className="size-3.5" />
                  Live Preview
                </div>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border border-black/8 bg-white",
                    !project.runtime.healthy && "opacity-60"
                  )}
                >
                  <iframe
                    src={getProjectServerUrl(project)}
                    title={`${project.name} 미리보기`}
                    className="h-[18rem] w-full"
                  />
                </div>
              </section>
            ) : null}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
