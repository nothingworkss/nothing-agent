"use client";

import type { ReactNode } from "react";

import { ProjectRuntimeProvider } from "@/components/runtime/project-runtime-provider";
import { CommandPalette } from "@/components/shared/command-palette";
import { ProjectPeekPanel } from "@/components/shared/project-peek-panel";
import { ToastProvider } from "@/components/shared/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ToastProvider>
        <ProjectRuntimeProvider>
          {children}
          <CommandPalette />
          <ProjectPeekPanel />
        </ProjectRuntimeProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}
