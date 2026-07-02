"use client";

import { useTransition } from "react";
import { wipeAllProgress } from "@/app/actions";
import { AlertOctagon, Loader2 } from "lucide-react";

export default function WipeProgressButton() {
  const [isPending, startTransition] = useTransition();

  const handleWipe = () => {
    if (confirm("DANGER: Are you absolutely sure you want to delete all your tracking history and progress? Your routines will be saved, but ALL workout logs will be permanently deleted!")) {
      startTransition(async () => {
        await wipeAllProgress();
        alert("All progress has been completely wiped. Starting fresh!");
      });
    }
  };

  return (
    <button
      onClick={handleWipe}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-[0.98] border border-red-500/50 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <AlertOctagon size={18} />}
      {isPending ? "Wiping Data..." : "Factory Reset All Progress"}
    </button>
  );
}
