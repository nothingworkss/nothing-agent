"use client";

import { startTransition, useCallback, useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { categories } from "@/lib/projects";

export type DashboardView = "overview" | "grid";
type DashboardCategory = (typeof categories)[number]["id"];

const validCategoryIds = new Set<DashboardCategory>(
  categories.map((category) => category.id)
);

export function useDashboardFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = useMemo(() => {
    const value = searchParams.get("category") ?? "all";
    return validCategoryIds.has(value as DashboardCategory)
      ? (value as DashboardCategory)
      : "all";
  }, [searchParams]);

  const query = searchParams.get("q") ?? "";
  const deferredQuery = useDeferredValue(query);
  const view = (searchParams.get("view") as DashboardView | null) ?? "overview";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      const nextQuery = nextParams.toString();
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams]
  );

  return {
    category,
    setCategory: (nextCategory: string) =>
      updateParams({ category: nextCategory }),
    query,
    deferredQuery,
    setQuery: (nextQuery: string) => updateParams({ q: nextQuery || null }),
    view,
    setView: (nextView: DashboardView) => updateParams({ view: nextView }),
  };
}
