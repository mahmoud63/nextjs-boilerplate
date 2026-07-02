"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/app/actions";
import { Loader2, KeyRound } from "lucide-react";

export default function ChangePasswordForm() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }
    if (newPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      const res = await changePassword(oldPass, newPass);
      if (res.success) {
        setSuccess("Password changed successfully!");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setError(res.error || "Failed to change password.");
      }
    });
  };

  return (
    <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm space-y-4">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <KeyRound size={18} className="text-primary" /> Change Password
      </h3>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {success && <p className="text-green-500 text-xs font-medium">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1">Current Password</label>
          <input 
            type="password" 
            required 
            value={oldPass} 
            onChange={e => setOldPass(e.target.value)}
            className="w-full bg-background border border-muted rounded-lg p-2 text-sm focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1">New Password</label>
          <input 
            type="password" 
            required 
            value={newPass} 
            onChange={e => setNewPass(e.target.value)}
            className="w-full bg-background border border-muted rounded-lg p-2 text-sm focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1">Confirm New Password</label>
          <input 
            type="password" 
            required 
            value={confirmPass} 
            onChange={e => setConfirmPass(e.target.value)}
            className="w-full bg-background border border-muted rounded-lg p-2 text-sm focus:border-primary transition-colors"
          />
        </div>
        <button 
          type="submit" 
          disabled={isPending || !oldPass || !newPass || !confirmPass}
          className="w-full bg-foreground text-background py-2 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 mt-2 hover:bg-foreground/90 transition-colors"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
