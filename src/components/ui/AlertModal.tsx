"use client";

import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

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

export default function AlertModal({ isOpen, onClose, onConfirm, confirmText = "Confirm", cancelText = "Cancel", title, message, type = "info" }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-muted flex flex-col items-center text-center">
        
        {type === "success" && <CheckCircle2 size={48} className="text-green-500 mb-4" />}
        {type === "error" && <AlertCircle size={48} className="text-red-500 mb-4" />}
        {type === "warning" && <AlertCircle size={48} className="text-orange-500 mb-4" />}
        {type === "info" && <Info size={48} className="text-primary mb-4" />}

        <h3 className="text-xl font-black text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {message}
        </p>

        {onConfirm ? (
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-bold text-sm hover:bg-muted/80 transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 text-white py-3 rounded-xl font-bold text-sm transition-colors ${type === 'error' || type === 'warning' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button 
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Okay
          </button>
        )}
      </div>
    </div>
  );
}
