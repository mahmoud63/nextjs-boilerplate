"use client";

import { useState, useTransition } from "react";
import { updateMarketplaceProfile, deleteMarketplaceProfile, getCurrentUser } from "@/app/actions";
import { Loader2, Trash2, Edit3, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";

export default function MyPublishedManager({ 
  publishedProfiles, 
  setActiveTab,
  profiles
}: { 
  publishedProfiles: any[];
  setActiveTab: (tab: "profiles") => void;
  profiles: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editModal, setEditModal] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: AlertType, onConfirm?: () => void}>({
    isOpen: false, title: "", message: "", type: "info"
  });

  const handleEdit = (p: any) => {
    setEditName(p.name);
    setEditDesc(p.description);
    setEditModal(p);
  };

  const saveEdit = () => {
    if (!editModal) return;
    startTransition(async () => {
      await updateMarketplaceProfile(editModal.id, editName, editDesc);
      setEditModal(null);
    });
  };

  const handleDelete = (id: string, name: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Unpublish Routine?",
      message: `Are you sure you want to unpublish "${name}" from the marketplace? Anyone who has already added it will keep their local copy.`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          await deleteMarketplaceProfile(id);
        });
      }
    });
  };

  const editInStudio = (publishedName: string, sourceProfileId?: string) => {
    if (!sourceProfileId) {
      setAlertConfig({ isOpen: true, title: "Missing Link", message: "This profile cannot be edited in studio because it is missing its source link.", type: "error" });
      return;
    }
    router.push(`/studio?profileId=${sourceProfileId}`);
  };

  return (
    <div className="space-y-4">
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      {publishedProfiles.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 bg-card rounded-2xl border border-muted">
          You haven't published any routines yet.
        </div>
      ) : (
        publishedProfiles.map(p => (
          <div key={p.id} className="bg-card p-5 rounded-3xl border border-muted shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-foreground text-lg leading-tight uppercase truncate">{p.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground truncate">Last synced: {new Date(p.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="p-2 text-primary bg-primary/10 rounded-xl">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-destructive bg-destructive/10 rounded-xl">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-foreground/80 font-medium bg-muted/30 p-3 rounded-xl border border-muted/50 leading-snug">
              {p.description}
            </p>

            <button 
              onClick={() => editInStudio(p.name, p.sourceProfileId)}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground p-3 rounded-xl font-bold text-sm hover:bg-secondary/80 transition-colors"
            >
              Edit in Studio <ArrowRight size={16} />
            </button>
          </div>
        ))
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-muted">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-foreground">Edit Details</h3>
              <button onClick={() => setEditModal(null)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-background border border-muted rounded-xl p-3 text-sm font-semibold focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Description</label>
                <textarea 
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full bg-background border border-muted rounded-xl p-3 text-sm font-semibold focus:border-primary h-24 resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditModal(null)} className="flex-1 py-3 bg-muted rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }))}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
