"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions";
import { UserCog } from "lucide-react";
import { Button, Card, Field, SelectField } from "@/components/ui";

export default function EditProfileForm({ initialName, initialGender }: { initialName: string | null; initialGender: string | null }) {
  const [name, setName] = useState(initialName || "");
  const [gender, setGender] = useState(initialGender || "male");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const res = await updateProfile(name, gender);
      if (res.success) {
        setSuccess("Profile updated.");
      } else {
        setError(res.error || "Failed to update profile.");
      }
    });
  };

  return (
    <Card>
      <p className="flex items-center gap-2 text-eyebrow uppercase text-fg">
        <UserCog size={14} className="text-fg-dim" /> Edit profile
      </p>

      {error && <p className="mt-3 text-body-sm text-danger">{error}</p>}
      {success && <p className="mt-3 text-body-sm text-accent">{success}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Field
          label="Name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <SelectField label="Gender" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </SelectField>
        <Button type="submit" fullWidth disabled={!name} loading={isPending} className="mt-1">
          Update profile
        </Button>
      </form>
    </Card>
  );
}
