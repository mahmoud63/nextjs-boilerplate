"use client";

import { useTransition } from "react";
import { resetCycle } from "@/app/actions";
import { RefreshCcw, Loader2 } from "lucide-react";

export default function ResetCycleButton() {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      await resetCycle();
    });
  };

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      className="p-2 rounded-full border border-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all shadow-sm flex items-center justify-center bg-card"
      title="Start Next Week"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
    </button>
  );
}
