"use client";

import { useState, useTransition } from "react";
import { resetCycle } from "@/app/actions";
import { RefreshCcw, Loader2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

export default function ResetCycleButton() {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReset = () => {
    startTransition(async () => {
      await resetCycle();
    });
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isPending}
        className="p-2 rounded-full border border-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center bg-card"
        title="Start Next Week"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReset}
        title="Start New Cycle"
        message="Are you sure you want to reset your dashboard for a new week? Your old sessions will be saved to your History."
        confirmText="Yes, Start New Week"
      />
    </>
  );
}
