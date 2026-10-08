"use client";
import { useEffect, useEffectEvent, useRef } from "react";
import { X } from "lucide-react";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const close = useEffectEvent(onClose);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    const focusable = () =>
      panel?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input, select, textarea, [tabindex="0"]',
      );
    focusable()?.[0]?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const nodes = focusable();
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button
            aria-label="Close dialog"
            className="rounded-lg p-2 hover:bg-slate-100"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
