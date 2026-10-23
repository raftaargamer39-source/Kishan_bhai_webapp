import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let bgClass = 'bg-stone-900 text-white border-stone-800';
        let iconColor = 'text-stone-300';

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-900 text-white border-emerald-800 shadow-emerald-950/20';
          iconColor = 'text-emerald-400';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgClass = 'bg-red-950 text-white border-red-900 shadow-red-950/20';
          iconColor = 'text-red-400';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs text-white">{toast.title}</h5>
              <p className="text-[11px] text-stone-300 mt-0.5 break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
