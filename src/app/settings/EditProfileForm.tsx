"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions";
import { Loader2, UserCog } from "lucide-react";

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
        setSuccess("Profile updated successfully!");
      } else {
        setError(res.error || "Failed to update profile.");
      }
    });
  };

  return (
    <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm space-y-4 mt-6">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <UserCog size={18} className="text-primary" /> Edit Profile
      </h3>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      {success && <p className="text-green-500 text-xs font-medium">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1">Name</label>
          <input 
            type="text" 
            required 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full bg-background border border-muted rounded-lg p-2 text-sm focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-1">Gender</label>
          <select 
            value={gender} 
            onChange={e => setGender(e.target.value)}
            className="w-full bg-background border border-muted rounded-lg p-2 text-sm focus:border-primary transition-colors"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={isPending || !name}
          className="w-full bg-foreground text-background py-2 rounded-lg font-bold flex items-center justify-center disabled:opacity-50 mt-2 hover:bg-foreground/90 transition-colors"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
