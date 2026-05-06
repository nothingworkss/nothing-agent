"use client";

import { Activity, FolderOpen, Server, Terminal } from "lucide-react";

import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { formatDateTime } from "@/lib/format";
import { getProjectServerLabel } from "@/lib/projects";
import { getProjectInitial, getRuntimeLabel } from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { snapshot } = useProjectRuntime();

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-4">
      <section className="studio-panel min-w-0 rounded-[1.7rem] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="studio-kicker">Registry</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-5xl">
              운영 설정
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              프로젝트 경로, 포트, 실행 명령, 최근 헬스 체크를 한 화면에서 비교합니다.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-2 md:w-[22rem]">
            {[
              ["RUN", snapshot.summary.running, "text-emerald-700"],
              ["OK", snapshot.summary.healthy, "text-[#8a6b21]"],
              ["ERR", snapshot.summary.errors, "text-red-700"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-black/8 bg-white/58 p-3 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
                <p className={cn("mt-1 text-2xl font-semibold", color)}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="studio-panel min-w-0 overflow-hidden rounded-[1.5rem]">
        <div className="flex items-center gap-2 border-b studio-divider px-4 py-3 md:px-5">
          <Server className="size-4 text-[#8a6b21]" />
          <h2 className="font-heading font-semibold">프로젝트 매트릭스</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] border-collapse text-left text-sm">
            <thead className="border-b border-black/8 bg-white/42 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Port</th>
                <th className="px-4 py-3 font-medium">Command</th>
                <th className="px-4 py-3 font-medium">Last Check</th>
                <th className="px-5 py-3 font-medium">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {snapshot.projects.map((project) => (
                <tr key={project.id} className="transition-colors hover:bg-white/42">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white/65 font-heading font-semibold">
                        {getProjectInitial(project)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {project.category} · {project.techStack}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <ProjectStatusBadge project={project} compact />
                      <p className="text-xs text-muted-foreground">
                        {getRuntimeLabel(project)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">
                    {getProjectServerLabel(project)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-[17rem] items-start gap-2">
                      <Terminal className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span className="break-words font-mono text-xs leading-5 text-foreground/80">
                        {project.serverCommand}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Activity className="size-3.5" />
                      {formatDateTime(project.runtime.lastHealthCheckAt)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-[20rem] items-start gap-2">
                      <FolderOpen className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span className="break-words font-mono text-xs leading-5 text-foreground/78">
                        {project.path}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
