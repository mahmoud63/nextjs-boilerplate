"use client";

import { useState, useTransition } from "react";
import { resetCycle } from "@/app/actions";
import { RefreshCcw } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { Button } from "@/components/ui";

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
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        loading={isPending}
        icon={!isPending ? <RefreshCcw size={14} /> : undefined}
        title="Start next week"
      >
        New cycle
      </Button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReset}
        title="Start new cycle"
        message="Reset your dashboard for a new week? Your old sessions are saved to History."
        confirmText="Yes, start new week"
      />
    </>
  );
}
