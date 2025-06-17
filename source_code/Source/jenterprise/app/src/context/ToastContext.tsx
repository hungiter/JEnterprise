import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const successPosition = 'top-right';
const errorPosition = 'top-right';
const warningPosition = 'top-right';
const infoPosition = 'top-right';

interface ToastContextProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const showSuccess = useCallback((message: string) => {
        toast.success(message, {
            duration: 3000,
            position: successPosition,
            style: {
                background: '#10B981',
                color: '#fff',
            },
        });
    }, []);

    const showError = useCallback((message: string) => {
        toast.error(message, {
            duration: 3000,
            position: errorPosition,
            style: {
                background: '#EF4444',
                color: '#fff',
            },
        });
    }, []);

    const showWarning = useCallback((message: string) => {
        toast(message, {
            duration: 3000,
            position: warningPosition,
            icon: '⚠️',
            style: {
                background: '#F59E0B',
                color: '#fff',
            },
        });
    }, []);

    const showInfo = useCallback((message: string) => {
        toast(message, {
            duration: 3000,
            position: infoPosition,
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
            },
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
            {children}
            <Toaster />
        </ToastContext.Provider>
    );
};