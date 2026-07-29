"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/app/actions";
import { KeyRound } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";

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
        setSuccess("Password changed.");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setError(res.error || "Failed to change password.");
      }
    });
  };

  return (
    <Card>
      <p className="flex items-center gap-2 text-eyebrow uppercase text-fg">
        <KeyRound size={14} className="text-fg-dim" /> Change password
      </p>

      {error && <p className="mt-3 text-body-sm text-danger">{error}</p>}
      {success && <p className="mt-3 text-body-sm text-accent">{success}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Field
          label="Current password"
          type="password"
          required
          value={oldPass}
          onChange={e => setOldPass(e.target.value)}
        />
        <Field
          label="New password"
          type="password"
          required
          hint="At least 6 characters"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
        />
        <Field
          label="Confirm new password"
          type="password"
          required
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          disabled={!oldPass || !newPass || !confirmPass}
          loading={isPending}
          className="mt-1"
        >
          Update password
        </Button>
      </form>
    </Card>
  );
}
