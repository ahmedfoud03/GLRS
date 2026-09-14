import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../types';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    title?: string,
    duration: number = 4000
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, title: string = 'تم بنجاح') => {
    showToast(msg, 'success', title);
  }, [showToast]);

  const error = useCallback((msg: string, title: string = 'خطأ') => {
    showToast(msg, 'error', title, 6000);
  }, [showToast]);

  const warning = useCallback((msg: string, title: string = 'تنبيه') => {
    showToast(msg, 'warning', title, 5000);
  }, [showToast]);

  const info = useCallback((msg: string, title: string = 'معلومة') => {
    showToast(msg, 'info', title);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
