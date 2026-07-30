"use client";

import { useState, useTransition } from "react";
import { uploadImage, updateProfilePicture } from "@/app/actions";
import { User, Camera } from "lucide-react";
import { PendingBars, StatBlock, StatRow } from "@/components/ui";

export default function ProfilePictureUpload({
  currentUrl,
  email,
  name,
  gender,
  height,
  weight
}: {
  currentUrl: string | null;
  email: string;
  name: string | null;
  gender: string | null;
  height: number;
  weight: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Image exceeds 3MB limit");
      return;
    }

    setError("");
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const uploadRes = await uploadImage(formData);
      if (uploadRes.success && uploadRes.url) {
        const updateRes = await updateProfilePicture(uploadRes.url);
        if (!updateRes.success) {
          setError(updateRes.error || "Failed to update profile");
        }
      } else {
        setError(uploadRes.error || "Failed to upload image");
      }
    });
  };

  return (
    <div className="border border-line">
      <div className="bg-panel p-4 flex items-center gap-4">
        {/* The avatar keeps its circle — the single intentional exception to radius 0. */}
        <label className="relative group shrink-0 cursor-pointer">
          <span className="block w-16 h-16 rounded-full bg-field text-fg-dim overflow-hidden border border-line-strong">
            {currentUrl ? (
              <img
                src={`/api/blob?url=${encodeURIComponent(currentUrl)}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center">
                <User size={26} />
              </span>
            )}
          </span>
          <span className="absolute inset-0 rounded-full bg-black/65 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isPending ? (
              <PendingBars className="h-3 w-5 text-accent" />
            ) : (
              <Camera className="text-accent w-5 h-5" />
            )}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isPending}
          />
        </label>

        <div className="min-w-0">
          <p className="font-display text-title-md uppercase text-fg truncate">
            {name || email}
          </p>
          <p className="mt-0.5 font-mono text-data-sm text-fg-dim truncate">{email}</p>
          {error && <p className="mt-1.5 text-body-sm text-danger">{error}</p>}
          <p className="mt-1.5 text-body-sm text-fg-dim sm:hidden">
            Tap image to change (max 3MB)
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <StatRow>
          <StatBlock label="Height" value={height || "—"} unit={height ? "cm" : undefined} />
          <StatBlock label="Weight" value={weight || "—"} unit={weight ? "kg" : undefined} />
          <StatBlock
            label="Gender"
            value={gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "—"}
            size="sm"
          />
        </StatRow>
      </div>
    </div>
  );
}
