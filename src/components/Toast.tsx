import React from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'info' ? (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium text-slate-200 truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-200 p-1 -mr-1 rounded-md transition-colors"
            aria-label="閉じる"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
