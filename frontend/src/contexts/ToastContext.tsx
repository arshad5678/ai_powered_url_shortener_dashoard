import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300',
            error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300',
            info: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-300',
          };

          const icons = {
            success: <CheckCircle className="text-emerald-500" size={16} />,
            error: <AlertCircle className="text-red-500" size={16} />,
            info: <Info className="text-indigo-500" size={16} />,
          };

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg pointer-events-auto animate-slide-in transition-all text-xs font-semibold ${typeStyles[toast.type]}`}
            >
              {icons[toast.type]}
              <span className="flex-1 leading-tight">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-current cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
