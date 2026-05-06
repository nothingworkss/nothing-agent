"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Command, Settings } from "lucide-react";

import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { FilterChips } from "@/components/shared/filter-chips";
import { Separator } from "@/components/ui/separator";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useHydrated } from "@/hooks/use-hydrated";
import { getProjectInitial } from "@/lib/project-view-model";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { category, setCategory } = useDashboardFilters();
  const { connected, setCommandPaletteOpen, snapshot } = useProjectRuntime();
  const hydrated = useHydrated();
  const liveConnected = hydrated && connected;

  const filtered =
    category === "all"
      ? snapshot.projects
      : snapshot.projects.filter((project) => project.category === category);

  return (
    <aside className="hidden w-[17rem] flex-col border-r border-white/10 bg-[#25221d] text-[#f8f3e8] lg:flex">
      <div className="px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#d4af37] text-sm font-semibold text-[#25221d] shadow-[0_18px_44px_-30px_rgba(212,175,55,0.9)]">
            AH
          </span>
          <div>
            <p className="font-heading text-lg font-semibold leading-none">
              Agent Hub
            </p>
            <p className="mt-1 text-xs text-white/45">Premium Studio</p>
          </div>
        </Link>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-4 px-3 py-4">
        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Runtime
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px]",
                liveConnected
                  ? "bg-emerald-500/12 text-emerald-200"
                  : "bg-amber-500/12 text-amber-200"
              )}
            >
              <Activity className="size-3" />
              {liveConnected ? "Live" : "Sync"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-white/38">Run</p>
              <p className="mt-1 font-semibold">{snapshot.summary.running}</p>
            </div>
            <div>
              <p className="text-white/38">OK</p>
              <p className="mt-1 font-semibold">{snapshot.summary.healthy}</p>
            </div>
            <div>
              <p className="text-white/38">Err</p>
              <p className="mt-1 font-semibold">{snapshot.summary.errors}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
            Focus
          </p>
          <FilterChips value={category} onChange={setCategory} compact />
        </div>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-[1.1rem] border border-white/10 bg-white/[0.055] px-3 py-3 text-sm transition-colors hover:bg-white/[0.08]"
        >
          <span className="flex items-center gap-2">
            <Command className="size-4 text-[#d4af37]" />
            빠른 실행
          </span>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/45">
            Cmd K
          </span>
        </button>
      </div>

      <Separator className="bg-white/10" />

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          Projects
        </p>
        <ul className="space-y-1">
          {filtered.map((project) => {
            const isActive = pathname === project.route;
            return (
              <li key={project.id}>
                <Link
                  href={project.route}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-[#d4af37] text-[#25221d]"
                      : "text-white/78 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold",
                      isActive
                        ? "border-black/10 bg-black/5"
                        : "border-white/10 bg-white/[0.05]"
                    )}
                  >
                    {getProjectInitial(project)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {project.shortName}
                    </span>
                    <span
                      className={cn(
                        "block truncate text-xs",
                        isActive ? "text-[#25221d]/62" : "text-white/38"
                      )}
                    >
                      {project.category}
                    </span>
                  </span>
                  <ProjectStatusBadge project={project} compact />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-[#d4af37] text-[#25221d]"
              : "text-white/55 hover:bg-white/[0.07] hover:text-white"
          )}
        >
          <Settings className="size-4" />
          <span>운영 설정</span>
        </Link>
      </div>
    </aside>
  );
}
