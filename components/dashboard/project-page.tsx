"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Clock3,
  ExternalLink,
  FolderOpen,
  Monitor,
  PanelRightOpen,
  Terminal,
} from "lucide-react";

import { ProjectActions } from "@/components/dashboard/project-actions";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { getProjectServerLabel, getProjectServerUrl } from "@/lib/projects";
import {
  getProjectInitial,
  getProjectNextAction,
  getRuntimeDescription,
} from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

type MobileTab = "preview" | "runtime" | "logs";

interface ProjectPageProps {
  project: {
    id: string;
  };
}

export function ProjectPage({ project }: ProjectPageProps) {
  const { setPeekProjectId, snapshot } = useProjectRuntime();
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const runtimeProject =
    snapshot.projects.find((item) => item.id === project.id) ?? null;

  const latestEvents = useMemo(
    () =>
      runtimeProject
        ? snapshot.events.filter((event) => event.projectId === runtimeProject.id)
        : [],
    [runtimeProject, snapshot.events]
  );

  if (!runtimeProject) {
    return (
      <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-dashed border-black/12 p-10 text-center">
        <p className="font-medium text-foreground">프로젝트를 찾을 수 없어요.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          홈에서 다시 선택하거나 설정에서 경로를 확인해 주세요.
        </p>
      </div>
    );
  }

  const nextAction = getProjectNextAction(runtimeProject);
  const mobileTabs: { id: MobileTab; label: string; icon: typeof Monitor }[] = [
    { id: "preview", label: "작업면", icon: Monitor },
    { id: "runtime", label: "상태", icon: Activity },
    { id: "logs", label: "로그", icon: Terminal },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4">
      <section className="studio-panel min-w-0 overflow-hidden rounded-[1.7rem]">
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-black/8 bg-white/65 font-heading text-lg font-semibold">
                {getProjectInitial(runtimeProject)}
              </span>
              <ProjectStatusBadge project={runtimeProject} />
              <span className="rounded-full border border-black/8 bg-white/55 px-3 py-1 text-xs text-muted-foreground">
                {getProjectServerLabel(runtimeProject)}
              </span>
            </div>
            <p className="studio-kicker">{runtimeProject.category} workspace</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-5xl">
              {runtimeProject.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {getRuntimeDescription(runtimeProject)}
            </p>
          </div>

          <div className="min-w-0 space-y-3 lg:min-w-[24rem]">
            <ProjectActions project={runtimeProject} mode="page" />
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Next", nextAction.label],
                ["Ready", formatRelativeTime(runtimeProject.runtime.lastReadyAt)],
                ["Stack", runtimeProject.techStack],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-black/8 bg-white/55 p-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {runtimeProject.runtime.error ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-[1.2rem] border border-red-500/25 bg-red-500/10 px-4 py-4 text-sm text-red-700"
        >
          <p className="font-medium">실행 중 확인이 필요한 문제가 있어요.</p>
          <p className="mt-1 text-red-700/80">{runtimeProject.runtime.error}</p>
        </div>
      ) : null}

      <div className="flex items-center gap-1 rounded-full border border-black/8 bg-white/55 p-1 md:hidden">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
              mobileTab === tab.id
                ? "bg-[#25221d] text-[#f8f3e8]"
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section
          className={cn(
            "studio-panel min-w-0 overflow-hidden rounded-[1.5rem]",
            mobileTab !== "preview" && "hidden md:block"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b studio-divider px-4 py-3 md:px-5">
            <div className="flex items-center gap-2">
              <Monitor className="size-4 text-[#8a6b21]" />
              <h2 className="font-heading font-semibold">Live Workspace</h2>
            </div>
            <Link
              href={getProjectServerUrl(runtimeProject)}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#8a6b21]"
            >
              새 탭
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
          <div className="p-3 md:p-4">
            <div className="overflow-hidden rounded-[1.25rem] border border-black/8 bg-[#25221d]">
              {runtimeProject.runtime.status === "running" ? (
                <iframe
                  src={getProjectServerUrl(runtimeProject)}
                  className="h-[42vh] min-h-[18rem] w-full bg-white md:h-[58vh] md:min-h-[32rem]"
                  title={runtimeProject.name}
                />
              ) : (
                <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 px-6 text-center text-[#f8f3e8] md:min-h-[32rem]">
                  <Bot className="size-10 text-[#d4af37]" />
                  <div>
                    <p className="font-heading text-xl font-semibold">
                      작업면이 대기 중입니다.
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/58">
                      시작 버튼을 누르면 이 영역이 로컬 프로젝트 미리보기로 전환됩니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside
          className={cn(
            "min-w-0 space-y-4",
            mobileTab !== "runtime" && "hidden md:block"
          )}
        >
          <section className="studio-panel rounded-[1.5rem] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="studio-kicker">Inspector</p>
                <h2 className="mt-1 font-heading text-lg font-semibold">
                  Runtime Snapshot
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPeekProjectId(runtimeProject.id)}
                className="rounded-full border border-black/8 bg-white/65 p-2 text-muted-foreground hover:text-foreground"
                aria-label="Peek 패널 열기"
              >
                <PanelRightOpen className="size-4" />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              {[
                ["포트", getProjectServerLabel(runtimeProject), Activity],
                ["최근 준비 완료", formatDateTime(runtimeProject.runtime.lastReadyAt), Clock3],
                [
                  "마지막 헬스 체크",
                  formatDateTime(runtimeProject.runtime.lastHealthCheckAt),
                  Activity,
                ],
                ["로컬 경로", runtimeProject.path, FolderOpen],
              ].map(([label, value, Icon]) => (
                <div
                  key={label as string}
                  className="rounded-2xl border border-black/8 bg-white/45 p-3"
                >
                  <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="size-3.5" />
                    {label as string}
                  </dt>
                  <dd className="mt-1 break-words font-medium text-foreground/88">
                    {value as string}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="studio-panel-dark rounded-[1.5rem] p-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-[#d4af37]" />
              <h2 className="font-heading font-semibold">Recent Signals</h2>
            </div>
            <div className="mt-4 space-y-3">
              {latestEvents.length > 0 ? (
                latestEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="border-l border-white/12 pl-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className="text-[11px] text-white/45">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/58">
                      {event.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-6 text-center text-sm text-white/48">
                  최근 신호가 아직 없어요.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section
        className={cn(
          "studio-panel rounded-[1.5rem]",
          mobileTab !== "logs" && "hidden md:block"
        )}
      >
        <div className="flex items-center gap-2 border-b studio-divider px-4 py-3 md:px-5">
          <Terminal className="size-4 text-[#8a6b21]" />
          <h2 className="font-heading font-semibold">Live Logs</h2>
        </div>
        <div className="p-3 md:p-4">
          <ScrollArea className="h-[17rem] rounded-[1.25rem] border border-black/8 bg-[#25221d] p-4 md:h-[22rem]">
            <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-5 text-[#f8f3e8]/78">
              {runtimeProject.runtime.logs.length > 0
                ? runtimeProject.runtime.logs.join("\n")
                : "로그가 아직 없습니다. 프로젝트를 실행하면 여기에서 흐름을 바로 볼 수 있어요."}
            </pre>
          </ScrollArea>
        </div>
      </section>
    </div>
  );
}
