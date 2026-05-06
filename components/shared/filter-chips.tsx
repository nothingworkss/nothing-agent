"use client";

import { categories } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function FilterChips({
  value,
  onChange,
  compact = false,
}: FilterChipsProps) {
  return (
    <div className="scrollbar-none flex min-w-0 max-w-full gap-2 overflow-x-auto whitespace-nowrap pb-1 md:flex-wrap md:overflow-visible md:whitespace-normal md:pb-0">
      {categories.map((category) => {
        const active = category.id === value;

        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category.id)}
            className={cn(
              "touch-manipulation shrink-0 rounded-full border font-medium transition-colors",
              compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
              active
                ? "border-[#d4af37]/35 bg-[#d4af37]/18 text-[#4f4018]"
                : "border-black/8 bg-white/45 text-muted-foreground hover:bg-white/70 hover:text-foreground"
            )}
          >
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
