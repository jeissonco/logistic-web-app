'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (message: string, opts?: { tone?: ToastTone; action?: Toast['action'] }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToasterProvider>');
  return ctx;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastApi['show']>(
    (message, opts) => {
      const id = Date.now() + Math.random();
      const toast: Toast = { id, message, tone: opts?.tone ?? 'info', action: opts?.action };
      setToasts((all) => [...all, toast]);
      if (!toast.action) setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              'pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm shadow-lg',
              t.tone === 'error'
                ? 'bg-red-600 text-white'
                : t.tone === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 text-white',
            ].join(' ')}
          >
            <span>{t.message}</span>
            {t.action ? (
              <button
                className="shrink-0 rounded-lg bg-white/20 px-3 py-1 font-medium"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
