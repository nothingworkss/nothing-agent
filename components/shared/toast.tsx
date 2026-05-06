"use client";

import { CheckCircle, XCircle, Loader2, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "loading";

interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (kind: ToastKind, message: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = `toast-${++counter}`;
      setToasts((current) => [...current, { id, kind, message }]);

      if (kind !== "loading") {
        setTimeout(() => dismiss(id), 2800);
      }

      return id;
    },
    [dismiss]
  );

  const icons: Record<ToastKind, ReactNode> = {
    success: <CheckCircle className="size-4 text-emerald-500" />,
    error: <XCircle className="size-4 text-destructive" />,
    loading: <Loader2 className="size-4 animate-spin text-muted-foreground" />,
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-20 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-scale-in flex items-center gap-2.5 rounded-2xl border border-black/8 bg-[#f6f2e8]/94 px-4 py-3 text-sm shadow-[0_18px_54px_-28px_rgba(31,28,24,0.72)] backdrop-blur-xl",
              t.kind === "error" && "border-red-500/20"
            )}
          >
            {icons[t.kind]}
            <span className="text-foreground">{t.message}</span>
            <button
              type="button"
              aria-label="닫기"
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => dismiss(t.id)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
