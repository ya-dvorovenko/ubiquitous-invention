"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastPotato({ type }: { type: ToastType }) {
  const isHappy = type === "success";
  const isSad = type === "error";

  return (
    <div className="toast-potato" style={{ width: 36, height: 36 }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="55" rx="38" ry="32" fill="#C4A574" />
        <ellipse cx="35" cy="45" rx="12" ry="8" fill="#D4B584" opacity="0.6" />
        <circle cx="60" cy="50" r="3" fill="#A08050" opacity="0.5" />
        <circle cx="45" cy="65" r="2.5" fill="#A08050" opacity="0.5" />
        <circle cx="70" cy="60" r="2" fill="#A08050" opacity="0.5" />
        {/* Eyes */}
        <circle cx="40" cy="50" r="4" fill="#333" />
        <circle cx="55" cy="48" r="4" fill="#333" />
        <circle cx="41" cy="49" r="1.5" fill="#fff" />
        <circle cx="56" cy="47" r="1.5" fill="#fff" />
        {/* Mouth - changes based on type */}
        {isHappy && (
          <path
            d="M 42 60 Q 48 68 54 60"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {isSad && (
          <path
            d="M 42 65 Q 48 58 54 65"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {!isHappy && !isSad && (
          <path d="M 42 62 L 54 62" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        )}
        {/* Fire under potato */}
        <g className="toast-flame">
          <path
            d="M 35 90 Q 40 80 45 90 Q 50 78 55 90 Q 60 80 65 90"
            stroke={isSad ? "#888" : "#FF6B35"}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 40 92 Q 45 85 50 92 Q 55 85 60 92"
            stroke={isSad ? "#aaa" : "#FFB347"}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <style jsx>{`
        .toast-potato {
          animation: toast-bounce 0.5s ease-in-out infinite;
        }
        .toast-flame {
          animation: toast-flicker 0.2s ease-in-out infinite alternate;
        }
        @keyframes toast-bounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes toast-flicker {
          0% { opacity: 0.8; transform: scaleY(0.95); }
          100% { opacity: 1; transform: scaleY(1.05); }
        }
      `}</style>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const borderColor = {
    success: "var(--accent)",
    error: "#ef4444",
    info: "var(--border-color)",
  }[toast.type];

  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: `2px solid ${borderColor}`,
        color: "var(--text-primary)",
      }}
    >
      <ToastPotato type={toast.type} />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
