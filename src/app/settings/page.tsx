import ResetCycleButton from "@/components/ResetCycleButton";
import WipeProgressButton from "@/components/WipeProgressButton";
import { getCurrentUser, getWeightHistory } from "@/app/actions";
import { redirect } from "next/navigation";
import { User, LogOut, AlertTriangle } from "lucide-react";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch the latest weight to display in profile
  const weightRes = await getWeightHistory();
  const logs = weightRes.success ? weightRes.data || [] : [];
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            App preferences and data management
          </p>
        </div>
        <form action={async () => {
          "use server";
          const { logout } = await import("@/app/actions");
          await logout();
          redirect("/login");
        }}>
          <button type="submit" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-colors" title="Log Out">
            <LogOut size={20} />
          </button>
        </form>
      </header>

      {/* User Profile Card */}
      <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border-2 border-primary/30">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">{user.username}</h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Height: {user.height} cm • Weight: {currentWeight ? `${currentWeight} kg` : 'N/A'}
          </p>
        </div>
      </div>

      <ChangePasswordForm />

      <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-foreground">Cycle Management</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Resetting the cycle starts a new week of tracking. Your past data is saved in history, but your dashboard will return to a fresh state.
          </p>
          <ResetCycleButton />
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertTriangle size={20} />
          <h3 className="font-bold">Danger Zone</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Permanently delete all your exercise logs, skipped days, and history. Your routines and account settings will remain, but all progress will be wiped clean.
        </p>
        <WipeProgressButton />
      </div>
    </div>
  );
}
