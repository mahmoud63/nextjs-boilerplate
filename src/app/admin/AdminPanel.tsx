"use client";

import { useState, useTransition } from "react";
import { adminToggleUserStatus, adminDeleteUser, adminDeleteMarketplaceItem } from "@/app/actions";
import { Shield, Users, Globe, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";
import { Chip, PageTitle, StatBlock, StatRow } from "@/components/ui";

export default function AdminPanel({
  initialUsers, 
  initialMarketplace 
}: { 
  initialUsers: any[], 
  initialMarketplace: any[] 
}) {
  const [users, setUsers] = useState(initialUsers);
  const [marketplace, setMarketplace] = useState(initialMarketplace);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"users" | "marketplace">("users");
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: AlertType, onConfirm?: () => void}>({
    isOpen: false, title: "", message: "", type: "info"
  });

  const handleToggle = (userId: string, email: string, currentStatus: boolean) => {
    setAlertConfig({
      isOpen: true,
      title: currentStatus ? "Deactivate User?" : "Activate User?",
      message: `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} ${email}?`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          const res = await adminToggleUserStatus(userId);
          if (res.success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: res.newStatus } : u));
          }
        });
      }
    });
  };

  const handleDeleteUser = (userId: string, email: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete User?",
      message: `Permanently delete ${email} and ALL their data? This cannot be undone.`,
      type: "error",
      onConfirm: () => {
        startTransition(async () => {
          const res = await adminDeleteUser(userId);
          if (res.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
          }
        });
      }
    });
  };

  const handleDeleteMarketplace = (itemId: string, name: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Marketplace Item?",
      message: `Remove "${name}" from the marketplace permanently?`,
      type: "warning",
      onConfirm: () => {
        startTransition(async () => {
          const res = await adminDeleteMarketplaceItem(itemId);
          if (res.success) {
            setMarketplace(prev => prev.filter(m => m.id !== itemId));
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-rise">
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-accent w-10 h-10" />
        </div>
      )}

      {/* Header */}
      <PageTitle
        title="Admin"
        eyebrow="Restricted access"
        right={<Chip variant="danger" icon={<Shield size={11} />}>Root</Chip>}
      />

      {/* Stats */}
      <div className="border border-line">
        <StatRow>
          <StatBlock label="Users" value={users.length} />
          <StatBlock label="Market items" value={marketplace.length} />
          <StatBlock label="Published" value={marketplace.filter((m: any) => m.isPublished !== false).length} />
        </StatRow>
      </div>

      {/* Tabs */}
      <div className="flex bg-field p-1 border border-line">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all ${
            activeTab === "users" ? "bg-panel text-fg" : "text-fg-muted hover:text-fg"
          }`}
        >
          <Users size={15} /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-all ${
            activeTab === "marketplace" ? "bg-panel text-fg" : "text-fg-muted hover:text-fg"
          }`}
        >
          <Globe size={15} /> Marketplace ({marketplace.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-panel border border-line p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-fg truncate">{user.name || "No name"}</p>
                  <p className="text-xs text-fg-muted truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-accent bg-field px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-danger bg-danger-fill/20 px-2 py-0.5 rounded-full">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                    {user.gender && <span className="text-xs text-fg-muted capitalize">{user.gender}</span>}
                    {user.height && <span className="text-xs text-fg-muted">{user.height}cm</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(user.id, user.email, user.isActive)}
                    className={`p-2 border transition-colors ${
                      user.isActive
                        ? "bg-danger-fill/20 text-danger border-danger/30 hover:bg-danger-fill/30"
                        : "bg-field text-accent border-line hover:bg-field"
                    }`}
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="p-2 border bg-danger-fill/20 text-danger border-danger/30 hover:bg-danger-fill/30 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-fg-muted py-10 text-sm">No users found.</p>
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <div className="space-y-3">
          {marketplace.map(item => (
            <div key={item.id} className="bg-panel border border-line p-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-fg truncate">{item.name}</p>
                <p className="text-xs text-fg-muted truncate">by {item.ownerName} ({item.ownerEmail})</p>
                {item.description && (
                  <p className="text-xs text-fg-dim mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-fg-dim mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteMarketplace(item.id, item.name)}
                className="shrink-0 p-2 border bg-danger-fill/20 text-danger border-danger/30 hover:bg-danger-fill/30 transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {marketplace.length === 0 && (
            <p className="text-center text-fg-muted py-10 text-sm">No marketplace items found.</p>
          )}
        </div>
      )}

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false, onConfirm: undefined }))}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.type === "error" ? "Delete" : "Confirm"}
        cancelText="Cancel"
      />
    </div>
  );
}
