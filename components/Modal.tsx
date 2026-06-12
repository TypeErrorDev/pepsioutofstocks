"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: labelled, modal, scroll-locked, Escape-to-close, focus
 * trapped, and focus restored to the trigger on close. Renders as a bottom
 * sheet on mobile and a centered card on larger screens.
 */
export default function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex w-full flex-col rounded-t-3xl border border-app-border bg-app-card shadow-2xl outline-none h-[92vh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-app-border p-5">
          <div className="min-w-0">
            <h2 className="truncate pe-1 text-lg font-black uppercase italic tracking-tight text-app-text">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-xl border border-app-border bg-app-bg p-2 text-app-muted transition-colors hover:text-pepsi-red"
          >
            <X size={18} />
          </button>
        </header>
        <div className="custom-scrollbar overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
