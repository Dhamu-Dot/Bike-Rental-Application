import React, { createContext, useContext, useState, useCallback } from "react";
import Icon from "./Icon";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type} animate-slide-in`}>
            <span className="toast-icon">
              {t.type === "success" && <Icon name="check" size={18} />}
              {t.type === "error" && <Icon name="x" size={18} />}
              {t.type === "info" && <Icon name="bell" size={18} />}
            </span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { addToast: (msg) => console.log(msg) };
  }
  return ctx;
}
