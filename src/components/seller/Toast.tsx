"use client";

import { useEffect } from "react";
import { CheckCircle2, Trash2, Info, X } from "lucide-react";
import "./Toast.css";

export type ToastVariant = "success" | "danger" | "info";

interface ToastProps {
  variant: ToastVariant;
  title: string;
  message: string;
  onClose: () => void;
  autoDismissMs?: number;
}

export default function Toast({
  variant,
  title,
  message,
  onClose,
  autoDismissMs = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onClose]);

  const Icon =
    variant === "success" ? CheckCircle2 : variant === "danger" ? Trash2 : Info;

  return (
    <div className={`toast toast--${variant}`} role="status">
      <Icon size={20} strokeWidth={1.8} className="toast__icon" />
      <div className="toast__body">
        <div className="toast__title">{title}</div>
        <div className="toast__message">{message}</div>
      </div>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}