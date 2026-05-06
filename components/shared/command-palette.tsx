"use client";

import {
  ArrowUpRight,
  Command,
  PanelRightOpen,
  Play,
  RotateCcw,
  Search,
  Square,
} from "lucide-react";
import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { useProjectRuntime } from "@/components/runtime/project-runtime-provider";
import { ProjectStatusBadge } from "@/components/dashboard/project-status-badge";
import { getProjectServerLabel } from "@/lib/projects";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  group: string;
  label: string;
  description: string;
  keywords: string;
  icon: ReactNode;
  action: () => void;
  meta?: string;
};

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    commandPaletteOpen,
    openProjectWindow,
    runAction,
    setCommandPaletteOpen,
    setPeekProjectId,
    snapshot,
  } = useProjectRuntime();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const commandItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    for (const project of snapshot.projects) {
      items.push({
        id: `${project.id}-open-page`,
        group: "Navigation",
        label: `${project.name} 페이지 열기`,
        description: `${project.route}로 이동합니다.`,
        keywords: `${project.name} ${project.keywords.join(" ")} page`,
        icon: <ArrowUpRight className="size-4" />,
        action: () => router.push(project.route),
        meta: project.shortName,
      });

      items.push({
        id: `${project.id}-peek`,
        group: "Inspect",
        label: `${project.name} Peek`,
        description: "오른쪽 패널에서 로그와 상태를 바로 확인합니다.",
        keywords: `${project.name} peek inspect logs`,
        icon: <PanelRightOpen className="size-4" />,
        action: () => setPeekProjectId(project.id),
        meta: "Peek",
      });

      if (project.runtime.status === "running") {
        items.push({
          id: `${project.id}-open-live`,
          group: "Live",
          label: `${project.name} 실행 화면 열기`,
          description: `${getProjectServerLabel(project)}를 새 탭에서 엽니다.`,
          keywords: `${project.name} open live localhost ${project.port}`,
          icon: <ArrowUpRight className="size-4" />,
          action: () => openProjectWindow(project),
          meta: getProjectServerLabel(project),
        });
        items.push({
          id: `${project.id}-stop`,
          group: "Controls",
          label: `${project.name} 중지`,
          description: "실행 중인 프로세스를 종료합니다.",
          keywords: `${project.name} stop halt`,
          icon: <Square className="size-4" />,
          action: () => void runAction(project.id, "stop"),
          meta: "Stop",
        });
        items.push({
          id: `${project.id}-restart`,
          group: "Controls",
          label: `${project.name} 재시작`,
          description: "프로세스를 다시 올리고 상태를 새로 고칩니다.",
          keywords: `${project.name} restart reload`,
          icon: <RotateCcw className="size-4" />,
          action: () => void runAction(project.id, "restart"),
          meta: "Restart",
        });
      } else {
        items.push({
          id: `${project.id}-start`,
          group: "Controls",
          label: `${project.name} 시작`,
          description: `localhost:${project.port}에 앱을 띄웁니다.`,
          keywords: `${project.name} start run boot`,
          icon: <Play className="size-4" />,
          action: () => void runAction(project.id, "start"),
          meta: "Start",
        });
      }
    }

    return items;
  }, [
    openProjectWindow,
    router,
    runAction,
    setPeekProjectId,
    snapshot.projects,
  ]);

  const filteredItems = useMemo(() => {
    if (!deferredQuery) return commandItems;

    return commandItems.filter((item) => {
      const haystack = `${item.label} ${item.description} ${item.keywords}`.toLowerCase();
      return haystack.includes(deferredQuery);
    });
  }, [commandItems, deferredQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }

      if (!commandPaletteOpen && event.key === "/" && !isTypingTarget) {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }

      if (commandPaletteOpen && event.key === "Escape") {
        event.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const desktop = window.matchMedia("(min-width: 640px)").matches;
    if (!desktop) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const activeIndex =
    filteredItems.length > 0
      ? Math.min(selectedIndex, filteredItems.length - 1)
      : 0;
  const activeItem = filteredItems[activeIndex];

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="명령 팔레트 닫기"
        className="absolute inset-0 bg-[#25221d]/45 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="빠른 실행"
        className="relative mx-auto mt-[10vh] flex w-[min(48rem,calc(100%-1.25rem))] flex-col overflow-hidden rounded-[1.6rem] border border-black/8 bg-[#f6f2e8]/96 shadow-[0_40px_140px_-58px_rgba(31,28,24,0.76)] backdrop-blur-xl"
      >
        <div className="border-b border-black/8 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/72 px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSelectedIndex((current) =>
                    Math.min(current + 1, filteredItems.length - 1)
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSelectedIndex((current) => Math.max(current - 1, 0));
                }
                if (event.key === "Enter" && activeItem) {
                  event.preventDefault();
                  activeItem.action();
                  setCommandPaletteOpen(false);
                }
              }}
              placeholder="프로젝트, 액션, 포트를 검색하세요…"
              className="h-7 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <span className="hidden rounded-full border border-black/10 px-2 py-1 text-[11px] text-muted-foreground md:inline-flex">
              ESC
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>페이지 이동, 시작/중지, Peek를 키보드만으로 바로 실행할 수 있어요.</p>
            <div className="hidden items-center gap-2 md:flex">
              <span className="inline-flex items-center gap-1 rounded-full border border-black/10 px-2 py-1">
                <Command className="size-3" />
                K
              </span>
              <span className="rounded-full border border-black/10 px-2 py-1">
                /
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center">
              <p className="font-medium text-foreground">검색 결과가 없어요.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                프로젝트 이름, 카테고리, 액션 이름으로 다시 찾아보세요.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.action();
                  setCommandPaletteOpen(false);
                }}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                  index === activeIndex
                    ? "bg-[#25221d] text-[#f8f3e8]"
                    : "hover:bg-white/70"
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-2xl border",
                      index === activeIndex
                        ? "border-white/10 bg-white/10"
                        : "border-black/8 bg-white/65"
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p
                      className={cn(
                        "mt-1 line-clamp-2 text-sm",
                        index === activeIndex
                          ? "text-white/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.description}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[11px] uppercase tracking-[0.2em]",
                        index === activeIndex
                          ? "text-white/45"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.group}
                    </p>
                  </div>
                </div>
                {item.meta ? (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-[11px]",
                      index === activeIndex
                        ? "border-white/10 text-white/75"
                        : "border-black/10 text-muted-foreground"
                    )}
                  >
                    {item.meta}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-black/8 bg-white/58 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>실행 중</span>
            {snapshot.projects
              .filter((project) => project.runtime.status === "running")
              .slice(0, 3)
              .map((project) => (
                <div
                  key={project.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-background px-2 py-1"
                >
                  <ProjectStatusBadge project={project} compact />
                  <Link
                    href={project.route}
                    className="truncate text-foreground hover:text-primary"
                    onClick={() => setCommandPaletteOpen(false)}
                  >
                    {project.shortName}
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
