import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none toast-container">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />
        };

        const bgClass = {
          success: 'bg-white border-emerald-300 text-slate-800 shadow-emerald-500/10',
          error: 'bg-white border-rose-300 text-slate-800 shadow-rose-500/10',
          warning: 'bg-white border-amber-300 text-slate-800 shadow-amber-500/10',
          info: 'bg-white border-sky-300 text-slate-800 shadow-sky-500/10'
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${bgClass}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-right">
              {toast.title && <h5 className="text-sm font-bold text-slate-800">{toast.title}</h5>}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
