"use client";

import { useState, useTransition } from "react";
import { wipeAllProgress } from "@/app/actions";
import { OctagonAlert } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { Button } from "@/components/ui";

export default function WipeProgressButton() {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWipe = () => {
    startTransition(async () => {
      await wipeAllProgress();
    });
  };

  return (
    <>
      <Button
        variant="danger"
        size="lg"
        fullWidth
        onClick={() => setIsModalOpen(true)}
        loading={isPending}
        icon={<OctagonAlert size={16} />}
      >
        {isPending ? "Wiping data" : "Factory reset all progress"}
      </Button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleWipe}
        title="Wipe All Progress"
        message="Are you absolutely sure you want to delete all your tracking history and progress? Your routines will be saved, but ALL workout logs will be permanently deleted!"
        confirmText="Yes, Wipe Data"
        cancelText="Cancel"
        danger={true}
      />
    </>
  );
}
