"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Command, Search } from "lucide-react";

import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { projects } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const currentProject = projects.find((project) => project.route === pathname);
  const { connected, setCommandPaletteOpen, snapshot } = useProjectRuntime();
  const hydrated = useHydrated();
  const liveConnected = hydrated && connected;

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[#f6f2e8]/82 backdrop-blur-xl">
      <div className="flex h-14 min-w-0 items-center gap-3 px-3 md:h-16 md:px-6 xl:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-xl bg-[#25221d] text-[11px] font-semibold tracking-tight text-[#f8f3e8]">
            AH
          </span>
          <span className="hidden font-heading text-sm font-semibold tracking-tight sm:inline md:text-base">
            Agent Hub
          </span>
        </Link>

        {currentProject ? (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="text-muted-foreground">/</span>
            <span className="truncate font-medium">{currentProject.name}</span>
          </div>
        ) : (
          <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground md:flex">
            <span className="text-muted-foreground">/</span>
            <span>Command Queue</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-black/8 bg-white/55 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <Activity className="size-3.5" />
            {liveConnected ? "실시간 연결" : "상태 동기화 중"}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white/55 px-2.5 py-1.5 text-xs md:px-3">
            <span
              className={cn(
                "size-2 rounded-full",
                liveConnected ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
            <span className="font-medium text-foreground">
              {snapshot.summary.running}
            </span>
            <span className="hidden text-muted-foreground sm:inline">running</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="rounded-full border-black/8 bg-white/65 px-2.5 md:px-3"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">빠른 실행</span>
            <span className="hidden items-center gap-1 rounded-full border border-black/8 px-2 py-0.5 text-[11px] text-muted-foreground md:inline-flex">
              <Command className="size-3" />
              K
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
