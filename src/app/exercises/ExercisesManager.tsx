"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { createExercise, updateExercise, deleteExercise } from "@/app/actions";
import { Loader2, Plus, Edit2, Trash2, Upload, ImageIcon, Film, X, Link as LinkIcon } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import ExerciseMedia from "@/components/ExerciseMedia";
import { EXERCISE_TYPES, TYPE_HINTS, TYPE_LABELS, normalizeType, type ExerciseType } from "@/lib/exerciseTypes";

type Exercise = any;
type RefLink = { label: string; url: string };

const EMPTY_FORM = {
  name: "",
  type: "WEIGHTS" as ExerciseType,
  sets: 3,
  reps: "12",
  targetMuscle: "",
  rest: "60 sec",
  rpe: "",
  targetWeight: "",
  videoUrl: "",
  refLinks: [] as RefLink[],
  notes: "",
  imageUrl: "",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export default function ExercisesManager({ initialExercises }: { initialExercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exForm, setExForm] = useState({ ...EMPTY_FORM });
  const [showExModal, setShowExModal] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openNew = () => {
    setEditingEx(null);
    setExForm({ ...EMPTY_FORM });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError("");
    setShowExModal(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditingEx(ex);
    setExForm({
      name: ex.name,
      type: normalizeType(ex.type),
      sets: ex.sets,
      reps: ex.reps,
      targetMuscle: ex.targetMuscle,
      rest: ex.rest,
      rpe: ex.rpe || "",
      targetWeight: ex.targetWeight || "",
      videoUrl: ex.videoUrl || "",
      refLinks: (ex.refLinks || []).map((r: RefLink) => ({ label: r.label, url: r.url })),
      notes: ex.notes || "",
      imageUrl: ex.imageUrl || "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError("");
    setShowExModal(true);
  };

  const handleSaveExercise = async () => {
    setIsUploading(true);
    setUploadError("");
    let finalImageUrl = exForm.imageUrl;

    if (selectedFile) {
      try {
        const blob = await upload(`exercises/${selectedFile.name}`, selectedFile, {
          access: "private",
          handleUploadUrl: "/api/blob/upload",
          onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
        });
        finalImageUrl = blob.url;
      } catch (err: any) {
        setUploadError(err?.message || "Failed to upload image");
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
    }
    setUploadProgress(null);

    startTransition(async () => {
      // Drop half-filled ref links rather than persisting them.
      const refLinks = exForm.refLinks.filter(r => r.label.trim() && r.url.trim());
      const finalForm = { ...exForm, refLinks, imageUrl: finalImageUrl };
      if (editingEx) {
        await updateExercise(editingEx.id, finalForm);
      } else {
        await createExercise(finalForm);
      }
      setShowExModal(false);
      setEditingEx(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image exceeds 5MB limit");
      return;
    }

    setUploadError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /** Demo clips upload straight away so the preview can play the stored file. */
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_BYTES) {
      setUploadError("Video exceeds 50MB limit");
      return;
    }

    setUploadError("");
    setIsUploading(true);
    try {
      const blob = await upload(`exercise-videos/${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/blob/upload",
        multipart: true,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
      });
      setExForm(f => ({ ...f, videoUrl: blob.url }));
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    startTransition(async () => {
      await deleteExercise(deleteConfirmId);
      setDeleteConfirmId(null);
    });
  };

  const updateRefLink = (idx: number, patch: Partial<RefLink>) => {
    setExForm(f => ({
      ...f,
      refLinks: f.refLinks.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const inputClass = "w-full bg-background border border-line p-2 text-sm";
  const labelClass = "text-xs font-bold text-fg-muted block mb-1";

  return (
    <div className="space-y-6 pb-20">

      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-accent w-10 h-10" />
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={openNew}
          className="w-full bg-field text-accent py-4 border border-line font-bold flex items-center justify-center gap-2 hover:bg-field transition-colors"
        >
          <Plus size={18} /> Create New Exercise
        </button>

        <div className="space-y-3">
          {initialExercises.map(ex => (
            <div key={ex.id} className="bg-panel border border-line p-4 flex items-start justify-between group">
              <div>
                <div className="flex items-center gap-3">
                  {ex.imageUrl && <img src={`/api/blob?url=${encodeURIComponent(ex.imageUrl)}`} alt={ex.name} className="w-12 h-12 object-cover bg-black/50 border border-line" />}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-fg">{ex.name}</h3>
                      <span className="text-eyebrow uppercase text-fg-muted bg-field px-1.5 py-0.5 rounded">
                        {TYPE_LABELS[normalizeType(ex.type)]}
                      </span>
                    </div>
                    <p className="text-xs text-fg-muted mt-1">{ex.sets} sets × {ex.reps} • {ex.targetMuscle}</p>
                    {(ex.targetWeight || ex.rpe) && (
                      <p className="text-xs text-fg-muted mt-0.5">
                        {[ex.targetWeight, ex.rpe && `RPE ${ex.rpe}`].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(ex)}
                  className="p-2 text-fg-muted hover:text-accent transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(ex.id)}
                  className="p-2 text-fg-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EXERCISE MODAL */}
        {showExModal && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-4">
            <div className="bg-panel w-full max-w-md border border-line overflow-hidden animate-rise duration-300 max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-line font-bold text-lg shrink-0">
                {editingEx ? "Edit Exercise" : "New Exercise"}
              </div>
              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <label className={labelClass}>Name</label>
                  <input type="text" value={exForm.name} onChange={e => setExForm({...exForm, name: e.target.value})} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Exercise Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXERCISE_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setExForm({...exForm, type: t})}
                        className={`py-2 px-3 text-sm font-bold border transition-colors ${
                          exForm.type === t
                            ? "bg-accent-fill/15 border-accent/40 text-accent"
                            : "bg-background border-line text-fg-muted hover:bg-field"
                        }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-fg-muted mt-2">{TYPE_HINTS[exForm.type]}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={labelClass}>{exForm.type === "CARDIO" ? "Rounds" : "Sets"}</label>
                    <input type="number" value={exForm.sets} onChange={e => setExForm({...exForm, sets: parseInt(e.target.value) || 0})} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Target</label>
                    <input type="text" value={exForm.reps} onChange={e => setExForm({...exForm, reps: e.target.value})} placeholder={exForm.type === "WEIGHTS" ? "e.g. 8-10" : "e.g. 45 sec"} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Target Muscle</label>
                  <input type="text" value={exForm.targetMuscle} onChange={e => setExForm({...exForm, targetMuscle: e.target.value})} className={inputClass} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={labelClass}>Rest Time</label>
                    <input type="text" value={exForm.rest} onChange={e => setExForm({...exForm, rest: e.target.value})} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Target RPE</label>
                    <input type="text" value={exForm.rpe || ""} onChange={e => setExForm({...exForm, rpe: e.target.value})} placeholder="e.g. 7 or 7-8" className={inputClass} />
                  </div>
                </div>
                {exForm.type !== "TIMED" && exForm.type !== "CARDIO" && (
                  <div>
                    <label className={labelClass}>Target Weight (Optional)</label>
                    <input type="text" value={exForm.targetWeight || ""} onChange={e => setExForm({...exForm, targetWeight: e.target.value})} placeholder="e.g. 30 kg or calibrate" className={inputClass} />
                  </div>
                )}
                <div>
                  <label className={labelClass}>Notes (Optional)</label>
                  <input type="text" value={exForm.notes || ""} onChange={e => setExForm({...exForm, notes: e.target.value})} className={inputClass} />
                </div>

                {/* DEMO VIDEO */}
                <div className="border-t border-line pt-4">
                  <label className={labelClass}>Demo Video</label>
                  <input
                    type="url"
                    value={exForm.videoUrl || ""}
                    onChange={e => setExForm({...exForm, videoUrl: e.target.value})}
                    placeholder="YouTube link or direct .mp4 / .gif URL"
                    className={inputClass}
                  />
                  <p className="text-xs text-fg-muted mt-1">
                    YouTube links and direct video files play inside the app. Other pages (MuscleWiki, etc.) can only open in a browser tab.
                  </p>
                  <label className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-accent bg-field border border-line px-3 py-2 cursor-pointer hover:bg-field transition-colors">
                    <Film size={14} /> Upload a clip (max 50MB)
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={isUploading || isPending} />
                  </label>
                  {exForm.videoUrl && (
                    <div className="mt-2">
                      <ExerciseMedia videoUrl={exForm.videoUrl} imageUrl={null} name={exForm.name || "Preview"} />
                      <button type="button" onClick={() => setExForm({...exForm, videoUrl: ""})} className="mt-2 text-xs font-semibold text-danger hover:underline">
                        Remove video
                      </button>
                    </div>
                  )}
                </div>

                {/* REFERENCE LINKS */}
                <div className="border-t border-line pt-4">
                  <label className={labelClass}>Reference Links</label>
                  <div className="space-y-2">
                    {exForm.refLinks.map((ref, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={ref.label}
                          onChange={e => updateRefLink(idx, { label: e.target.value })}
                          placeholder="Label"
                          className="w-28 bg-background border border-line p-2 text-sm shrink-0"
                        />
                        <input
                          type="url"
                          value={ref.url}
                          onChange={e => updateRefLink(idx, { url: e.target.value })}
                          placeholder="https://..."
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() => setExForm(f => ({ ...f, refLinks: f.refLinks.filter((_, i) => i !== idx) }))}
                          className="p-2 text-fg-muted hover:text-danger transition-colors shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setExForm(f => ({ ...f, refLinks: [...f.refLinks, { label: "", url: "" }] }))}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline"
                  >
                    <LinkIcon size={14} /> Add reference link
                  </button>
                </div>

                {/* STILL IMAGE */}
                <div className="border-t border-line pt-4">
                  <label className="text-xs font-bold text-fg-muted block mb-2">Exercise Image</label>
                  {previewUrl || exForm.imageUrl ? (
                    <div className="relative w-full h-40 overflow-hidden bg-field group border border-line">
                      <img src={previewUrl || `/api/blob?url=${encodeURIComponent(exForm.imageUrl)}`} alt="Exercise" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <label className="cursor-pointer text-white flex flex-col items-center hover:scale-110 transition-transform">
                          <Upload size={24} />
                          <span className="text-xs mt-1 font-bold">Change</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading || isPending} />
                        </label>
                        <button onClick={() => { setExForm({...exForm, imageUrl: ""}); setSelectedFile(null); setPreviewUrl(null); }} type="button" className="text-danger flex flex-col items-center hover:scale-110 transition-transform">
                          <Trash2 size={24} />
                          <span className="text-xs mt-1 font-bold">Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line-foreground/30 cursor-pointer hover:bg-field/10 transition-colors">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" />
                          <span className="text-sm font-semibold text-accent">
                            {uploadProgress !== null ? `Uploading ${uploadProgress}%` : "Uploading..."}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-fg-muted mb-2" />
                          <span className="text-sm font-semibold text-fg-muted">Upload Image</span>
                          <span className="text-xs text-fg-dim mt-1">Max 5MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading || isPending} />
                    </label>
                  )}
                  {uploadError && <p className="text-danger text-xs mt-2 font-semibold">{uploadError}</p>}
                </div>
              </div>
              <div className="p-4 border-t border-line flex gap-3 bg-field shrink-0">
                <button onClick={() => { setShowExModal(false); setSelectedFile(null); setPreviewUrl(null); }} className="flex-1 py-2 font-semibold text-fg-muted hover:bg-field transition-colors">Cancel</button>
                <button onClick={handleSaveExercise} disabled={!exForm.name || !exForm.targetMuscle || isUploading} className="flex-1 py-2 font-bold bg-accent-fill text-on-accent disabled:opacity-50">
                  {isUploading ? (uploadProgress !== null ? `${uploadProgress}%` : "Saving...") : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Exercise"
        message="Are you sure you want to permanently delete this exercise? It will be removed from all your routines and past logs."
        danger={true}
        confirmText="Delete"
      />
    </div>
  );
}
