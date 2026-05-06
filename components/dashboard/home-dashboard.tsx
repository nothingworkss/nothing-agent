"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Command,
  ListFilter,
  PanelRightOpen,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useMemo } from "react";

import { ProjectActions } from "@/components/dashboard/project-actions";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { FilterChips } from "@/components/shared/filter-chips";
import { Button } from "@/components/ui/button";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatRelativeTime } from "@/lib/format";
import { getProjectServerLabel } from "@/lib/projects";
import {
  getProjectInitial,
  getProjectNextAction,
  getRuntimeDescription,
  getRuntimeLabel,
  getStatusTone,
  sortProjectsForQueue,
} from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

const toneClasses = {
  danger: "border-red-500/25 bg-red-500/10 text-red-700",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  neutral: "border-black/8 bg-white/55 text-muted-foreground",
};

export function HomeDashboard() {
  const {
    connected,
    setCommandPaletteOpen,
    setPeekProjectId,
    snapshot,
  } = useProjectRuntime();
  const { category, deferredQuery, query, setCategory, setQuery } =
    useDashboardFilters();
  const hydrated = useHydrated();
  const liveConnected = hydrated && connected;

  const filteredProjects = useMemo(() => {
    return snapshot.projects.filter((project) => {
      const matchesCategory =
        category === "all" ? true : project.category === category;
      const matchesQuery = deferredQuery
        ? `${project.name} ${project.description} ${project.keywords.join(" ")}`
            .toLowerCase()
            .includes(deferredQuery.toLowerCase())
        : true;

      return matchesCategory && matchesQuery;
    });
  }, [category, deferredQuery, snapshot.projects]);

  const queueProjects = useMemo(
    () => sortProjectsForQueue(filteredProjects).slice(0, 5),
    [filteredProjects]
  );
  const quietProjects = useMemo(
    () =>
      sortProjectsForQueue(filteredProjects).filter(
        (project) => !queueProjects.some((queued) => queued.id === project.id)
      ),
    [filteredProjects, queueProjects]
  );

  const latestEvents = snapshot.events.slice(0, 6);

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="min-w-0 space-y-4">
        <div className="studio-panel min-w-0 overflow-hidden rounded-[1.7rem]">
          <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:p-7">
            <div className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-[color:var(--accent)]" />
                  Premium Studio
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                    liveConnected
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-700"
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      liveConnected ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  {liveConnected ? "Live sync" : "Syncing"}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#25221d] md:text-6xl">
                Command Queue
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                지금 처리해야 할 프로젝트와 다음 액션을 먼저 보여주는 작업 큐입니다.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-3 gap-2 md:w-[20rem]">
              {[
                ["RUN", snapshot.summary.running, "text-emerald-700"],
                ["OK", snapshot.summary.healthy, "text-[#8a6b21]"],
                ["ERR", snapshot.summary.errors, "text-red-700"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-2xl border border-black/8 bg-white/62 p-3 text-center"
                >
                  <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground">
                    {label}
                  </p>
                  <p className={cn("mt-1 text-2xl font-semibold", color)}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t studio-divider bg-white/45 p-3 md:p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="flex min-w-0 items-center gap-3 rounded-full border border-black/8 bg-white/75 px-4 py-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="프로젝트, 카테고리, 기능 검색"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
              <Button
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full justify-center rounded-full bg-[#25221d] px-4 text-[#f8f3e8] hover:bg-[#373229] md:w-auto"
              >
                <Command className="size-4" />
                빠른 실행
              </Button>
            </div>
            <div className="mt-3">
              <FilterChips value={category} onChange={setCategory} />
            </div>
          </div>
        </div>

        <div className="studio-panel rounded-[1.5rem]">
          <div className="flex items-center justify-between gap-3 border-b studio-divider px-4 py-3 md:px-5">
            <div>
              <p className="studio-kicker">Now</p>
              <h2 className="mt-1 font-heading text-xl font-semibold">
                지금 봐야 할 프로젝트
              </h2>
            </div>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <ListFilter className="size-4" />
              {filteredProjects.length}개 중 {queueProjects.length}개 표시
            </div>
          </div>

          <div className="divide-y divide-black/8">
            {queueProjects.length > 0 ? (
              queueProjects.map((project, index) => {
                const tone = getStatusTone(
                  project.runtime.status,
                  project.runtime.health
                );
                const nextAction = getProjectNextAction(project);
                const latestLog = project.runtime.logs.at(-1);

                return (
                  <article
                    key={project.id}
                    className="grid gap-4 px-4 py-4 transition-colors hover:bg-white/42 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:px-5"
                  >
                    <button
                      type="button"
                      onClick={() => setPeekProjectId(project.id)}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl border text-base font-semibold md:size-14",
                        toneClasses[tone]
                      )}
                      aria-label={`${project.name} 인스펙터 열기`}
                    >
                      {getProjectInitial(project)}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={project.route}
                          className="inline-flex min-w-0 items-center gap-2 font-heading text-lg font-semibold text-foreground hover:text-[#8a6b21]"
                        >
                          <span className="truncate">{project.name}</span>
                          <ArrowUpRight className="size-4 shrink-0" />
                        </Link>
                        <ProjectStatusBadge project={project} compact />
                        {index === 0 ? (
                          <span className="rounded-full border border-black/8 bg-[#d4af37]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7d641f]">
                            Focus
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getRuntimeDescription(project)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{getProjectServerLabel(project)}</span>
                        <span>{project.techStack}</span>
                        <span>{latestLog ?? nextAction.description}</span>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end">
                      <span className="rounded-full border border-black/8 bg-white/55 px-3 py-1 text-xs text-muted-foreground">
                        {nextAction.label}
                      </span>
                      <ProjectActions project={project} mode="compact" />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="px-5 py-14 text-center">
                <CheckCircle2 className="mx-auto size-9 text-emerald-600" />
                <p className="mt-3 font-medium">조건에 맞는 작업이 없습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  검색어나 카테고리를 바꾸면 큐가 다시 정렬됩니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {quietProjects.length > 0 ? (
          <div className="studio-panel rounded-[1.5rem] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="studio-kicker">Registry</p>
                <h2 className="mt-1 font-heading text-lg font-semibold">
                  전체 프로젝트 레일
                </h2>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {quietProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setPeekProjectId(project.id)}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-black/8 bg-white/45 px-3 py-3 text-left transition-colors hover:bg-white/70"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white/65 text-sm font-semibold">
                    {getProjectInitial(project)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {project.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {getRuntimeLabel(project)} · {getProjectServerLabel(project)}
                    </span>
                  </span>
                  <ProjectStatusBadge project={project} compact />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="min-w-0 space-y-4">
        <div className="studio-panel-dark rounded-[1.5rem] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Signals
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold">
                최근 런타임 신호
              </h2>
            </div>
            <Activity className="size-5 text-[#d4af37]" />
          </div>

          <div className="mt-4 space-y-3">
            {latestEvents.length > 0 ? (
              latestEvents.map((event) => (
                <div key={event.id} className="border-l border-white/12 pl-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{event.title}</p>
                    <span className="text-[11px] text-white/45">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/58">
                    {event.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-8 text-center">
                <Terminal className="mx-auto size-6 text-white/35" />
                <p className="mt-2 text-sm text-white/55">
                  아직 수집된 신호가 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="studio-panel rounded-[1.5rem] p-4 md:p-5">
          <div className="flex items-center gap-2">
            <PanelRightOpen className="size-4 text-[#8a6b21]" />
            <p className="studio-kicker">Inspector</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            프로젝트 행을 누르면 오른쪽 Peek 패널에서 로그, 헬스 체크, 미리보기를
            바로 확인할 수 있습니다.
          </p>
        </div>
      </aside>
    </div>
  );
}
