"use client";

import { TriangleAlert } from "lucide-react";
import { Button, Modal } from "@/components/ui";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

/** Thin wrapper over the Modal shell — prop API unchanged for existing call sites. */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false
}: ConfirmModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      tone={danger ? "danger" : "default"}
      icon={
        <TriangleAlert
          size={18}
          className={danger ? "text-danger shrink-0" : "text-accent shrink-0"}
        />
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
