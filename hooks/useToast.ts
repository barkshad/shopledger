import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { nanoid } from 'nanoid';

type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const newToast: ToastMessage = { id: nanoid(), message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
  return React.createElement(ToastContext.Provider, { value: { toasts, addToast, removeToast } }, children);
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// FIX: Removed the conflicting local implementation of nanoid.
// The project should rely on the imported version from the 'nanoid' package.