"use client";

import { Check, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  title: string;
  message: string;
  type?: AlertType;
}

/* Green/red/orange are gone: the system is monochrome plus lime plus one danger
   tone, and a stoplight palette inside a lime-accented dialog reads as a different
   product. Icon shape carries the type instead of hue. */
const ICONS = {
  success: <Check size={18} className="text-accent shrink-0" />,
  error: <CircleAlert size={18} className="text-danger shrink-0" />,
  warning: <TriangleAlert size={18} className="text-danger shrink-0" />,
  info: <Info size={18} className="text-fg-muted shrink-0" />,
} as const;

/** Thin wrapper over the Modal shell — prop API unchanged for existing call sites. */
export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  title,
  message,
  type = "info",
}: AlertModalProps) {
  const destructive = type === "error" || type === "warning";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      tone={destructive ? "danger" : "default"}
      icon={ICONS[type]}
      footer={
        onConfirm ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={destructive ? "danger" : "primary"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose}>
            Okay
          </Button>
        )
      }
    >
      {message}
    </Modal>
  );
}
