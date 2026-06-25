import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const config = {
    success: {
      bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    },
    error: {
      bg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
    },
    info: {
      bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
      icon: <Info className="w-4 h-4 text-cyan-400 shrink-0" />
    },
    warning: {
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
    }
  };

  const style = config[toast.type] || config.info;

  return (
    <div className={`p-3.5 border rounded-xl flex items-center space-x-3 shadow-xl backdrop-blur-md animate-fade-in-up ${style.bg}`}>
      {style.icon}
      <p className="text-xs font-semibold leading-normal">{toast.text}</p>
    </div>
  );
}
