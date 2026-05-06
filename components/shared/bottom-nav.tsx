"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Home, Newspaper, Settings, Sparkles } from "lucide-react";

import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Queue" },
  { href: "/nothing-matters", icon: Sparkles, label: "자동화" },
  { href: "/curation", icon: Newspaper, label: "큐레이션" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setCommandPaletteOpen, snapshot } = useProjectRuntime();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-black/8 bg-[#f6f2e8]/92 backdrop-blur-xl md:hidden">
      <div className="grid h-[4.25rem] grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl transition-all active:scale-95",
                isActive ? "text-[#25221d]" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-2xl",
                  isActive && "bg-[#25221d] text-[#f8f3e8]"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="빠른 실행 열기"
          className="relative flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-all active:scale-95"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <span className="relative flex size-8 items-center justify-center rounded-2xl border border-black/8 bg-white/65">
            <Command className="size-4" />
            {snapshot.summary.running > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-500" />
            )}
          </span>
          <span className="text-[10px] font-medium leading-none">실행</span>
        </button>
      </div>
    </nav>
  );
}
