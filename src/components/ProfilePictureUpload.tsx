"use client";

import { useState, useTransition } from "react";
import { uploadImage, updateProfilePicture } from "@/app/actions";
import { User, Loader2, Camera } from "lucide-react";

export default function ProfilePictureUpload({ 
  currentUrl, 
  email, 
  height, 
  weight 
}: { 
  currentUrl: string | null;
  email: string;
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
    <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4 relative">
      <div className="relative group shrink-0">
        <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center border-2 border-primary/30 overflow-hidden relative">
          {currentUrl ? (
            <img src={`/api/blob?url=${encodeURIComponent(currentUrl)}`} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} />
          )}
          
          <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            {isPending ? (
              <Loader2 className="animate-spin text-white w-6 h-6" />
            ) : (
              <Camera className="text-white w-6 h-6" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isPending} />
          </label>
        </div>
      </div>
      
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-black text-foreground">{email}</h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Height: {height} cm • Weight: {weight ? `${weight} kg` : 'N/A'}
        </p>
        {error && <p className="text-red-500 text-xs mt-2 font-semibold">{error}</p>}
        <p className="text-[10px] text-muted-foreground mt-2 sm:hidden">Tap image to change (Max 3MB)</p>
      </div>
    </div>
  );
}
