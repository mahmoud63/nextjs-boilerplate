"use client";

import { useState, useTransition } from "react";
import { createExercise, updateExercise, deleteExercise, uploadImage } from "@/app/actions";
import { Loader2, Plus, Edit2, Trash2, Upload, ImageIcon } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

type Exercise = any;

export default function ExercisesManager({ initialExercises }: { initialExercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exForm, setExForm] = useState({ name: "", sets: 3, reps: "12", targetMuscle: "", rest: "60 sec", notes: "", imageUrl: "" });
  const [showExModal, setShowExModal] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSaveExercise = async () => {
    setIsUploading(true);
    let finalImageUrl = exForm.imageUrl;
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        finalImageUrl = res.url;
      } else {
        setUploadError(res.error || "Failed to upload image");
        setIsUploading(false);
        return;
      }
    }

    startTransition(async () => {
      const finalForm = { ...exForm, imageUrl: finalImageUrl };
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
    
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("Image exceeds 3MB limit");
      return;
    }
    
    setUploadError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDeleteExercise = async (id: string) => {
    setDeleteConfirmId(id);
  };
  
  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    startTransition(async () => {
      await deleteExercise(deleteConfirmId);
      setDeleteConfirmId(null);
    });
  };

  return (
    <div className="space-y-6 pb-20">

      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={() => {
            setEditingEx(null);
            setExForm({ name: "", sets: 3, reps: "12", targetMuscle: "", rest: "60 sec", notes: "", imageUrl: "" });
            setSelectedFile(null);
            setPreviewUrl(null);
            setShowExModal(true);
          }}
          className="w-full bg-primary/10 text-primary py-4 rounded-xl border border-primary/20 font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
        >
          <Plus size={18} /> Create New Exercise
        </button>

        <div className="space-y-3">
          {initialExercises.map(ex => (
            <div key={ex.id} className="bg-card border border-muted p-4 rounded-xl flex items-start justify-between group">
              <div>
                <div className="flex items-center gap-3">
                  {ex.imageUrl && <img src={`/api/blob?url=${encodeURIComponent(ex.imageUrl)}`} alt={ex.name} className="w-12 h-12 object-cover rounded-xl bg-black/50 border border-muted" />}
                  <div>
                    <h3 className="font-bold text-foreground">{ex.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{ex.sets} sets × {ex.reps} • {ex.targetMuscle}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingEx(ex);
                    setExForm({
                      name: ex.name,
                      sets: ex.sets,
                      reps: ex.reps,
                      targetMuscle: ex.targetMuscle,
                      rest: ex.rest,
                      notes: ex.notes || "",
                      imageUrl: ex.imageUrl || ""
                    });
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setShowExModal(true);
                  }}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
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
            <div className="bg-card w-full max-w-md rounded-2xl border border-muted shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
              <div className="p-4 border-b border-muted font-bold text-lg">
                {editingEx ? "Edit Exercise" : "New Exercise"}
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Name</label>
                  <input type="text" value={exForm.name} onChange={e => setExForm({...exForm, name: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Sets</label>
                    <input type="number" value={exForm.sets} onChange={e => setExForm({...exForm, sets: parseInt(e.target.value) || 0})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground block mb-1">Reps</label>
                    <input type="text" value={exForm.reps} onChange={e => setExForm({...exForm, reps: e.target.value})} placeholder="e.g. 12 or 8-10" className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Target Muscle</label>
                  <input type="text" value={exForm.targetMuscle} onChange={e => setExForm({...exForm, targetMuscle: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Rest Time</label>
                  <input type="text" value={exForm.rest} onChange={e => setExForm({...exForm, rest: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Notes (Optional)</label>
                  <input type="text" value={exForm.notes || ""} onChange={e => setExForm({...exForm, notes: e.target.value})} className="w-full bg-background border border-muted rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-2">Exercise Image</label>
                  {previewUrl || exForm.imageUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted group border border-muted">
                      <img src={previewUrl || `/api/blob?url=${encodeURIComponent(exForm.imageUrl)}`} alt="Exercise" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <label className="cursor-pointer text-white flex flex-col items-center hover:scale-110 transition-transform">
                          <Upload size={24} />
                          <span className="text-xs mt-1 font-bold">Change</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading || isPending} />
                        </label>
                        <button onClick={() => { setExForm({...exForm, imageUrl: ""}); setSelectedFile(null); setPreviewUrl(null); }} type="button" className="text-red-400 flex flex-col items-center hover:scale-110 transition-transform">
                          <Trash2 size={24} />
                          <span className="text-xs mt-1 font-bold">Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:bg-muted/10 transition-colors">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                          <span className="text-sm font-semibold text-primary">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-semibold text-muted-foreground">Upload Image</span>
                          <span className="text-xs text-muted-foreground/70 mt-1">Max 3MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading || isPending} />
                    </label>
                  )}
                  {uploadError && <p className="text-red-500 text-xs mt-2 font-semibold">{uploadError}</p>}
                </div>
              </div>
              <div className="p-4 border-t border-muted flex gap-3 bg-muted/20">
                <button onClick={() => { setShowExModal(false); setSelectedFile(null); setPreviewUrl(null); }} className="flex-1 py-2 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSaveExercise} disabled={!exForm.name || !exForm.targetMuscle || isUploading} className="flex-1 py-2 rounded-xl font-bold bg-foreground text-background disabled:opacity-50">
                  {isUploading ? "Saving..." : "Save"}
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
