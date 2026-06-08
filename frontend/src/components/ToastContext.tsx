import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'danger' | 'warning' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`toast show align-items-center text-bg-${msg.type} border-0 mb-2`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">
                {msg.type === 'danger' && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                {msg.type === 'success' && <i className="bi bi-check-circle-fill me-2"></i>}
                {msg.message}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setMessages((prev) => prev.filter(m => m.id !== msg.id))} aria-label="Close"></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
