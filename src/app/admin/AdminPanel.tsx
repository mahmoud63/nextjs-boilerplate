"use client";

import { useState, useTransition } from "react";
import { adminToggleUserStatus, adminDeleteUser, adminDeleteMarketplaceItem } from "@/app/actions";
import { Shield, Users, Globe, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import AlertModal, { AlertType } from "@/components/ui/AlertModal";

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
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-muted">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-accent uppercase">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Restricted access • mahmoudk63@gmail.com</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-muted rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-primary">{users.length}</p>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Total Users</p>
        </div>
        <div className="bg-card border border-muted rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-primary">{marketplace.length}</p>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Market Items</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted/40 p-1 rounded-2xl border border-muted/50">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "users" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={15} /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "marketplace" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe size={15} /> Marketplace ({marketplace.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-card border border-muted rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user.name || "No name"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                    {user.gender && <span className="text-xs text-muted-foreground capitalize">{user.gender}</span>}
                    {user.height && <span className="text-xs text-muted-foreground">{user.height}cm</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(user.id, user.email, user.isActive)}
                    className={`p-2 rounded-xl border transition-colors ${
                      user.isActive
                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                        : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                    }`}
                    title={user.isActive ? "Deactivate" : "Activate"}
                  >
                    {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="p-2 rounded-xl border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-sm">No users found.</p>
          )}
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <div className="space-y-3">
          {marketplace.map(item => (
            <div key={item.id} className="bg-card border border-muted rounded-2xl p-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">by {item.ownerName} ({item.ownerEmail})</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground/50 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteMarketplace(item.id, item.name)}
                className="shrink-0 p-2 rounded-xl border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {marketplace.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-sm">No marketplace items found.</p>
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
