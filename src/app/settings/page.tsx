import ResetCycleButton from "@/components/ResetCycleButton";
import WipeProgressButton from "@/components/WipeProgressButton";
import { getCurrentUser, getWeightHistory } from "@/app/actions";
import { redirect } from "next/navigation";
import { LogOut, TriangleAlert, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import ChangePasswordForm from "./ChangePasswordForm";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import EditProfileForm from "./EditProfileForm";
import { Card, Chip, PageTitle } from "@/components/ui";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch the latest weight to display in profile
  const weightRes = await getWeightHistory();
  const logs = weightRes.success ? weightRes.data || [] : [];
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;

  return (
    <div className="space-y-5 animate-rise">
      <PageTitle
        title="Settings"
        eyebrow="Preferences & data"
        right={
          <form action={async () => {
            "use server";
            const { logout } = await import("@/app/actions");
            await logout();
            redirect("/login");
          }}>
            <button
              type="submit"
              title="Log out"
              className="p-2 text-fg-dim hover:text-danger hover:bg-field transition-colors"
            >
              <LogOut size={18} />
            </button>
          </form>
        }
      />

      <ProfilePictureUpload
        currentUrl={user.profilePicUrl || null}
        email={user.email}
        name={(user as any).name || null}
        gender={(user as any).gender || null}
        height={user.height}
        weight={currentWeight}
      />

      <EditProfileForm initialName={(user as any).name as string | null} initialGender={(user as any).gender as string | null} />

      <ChangePasswordForm />

      {user.email === 'mahmoudk63@gmail.com' && (
        <Link
          href="/admin"
          className="flex items-center justify-between gap-3 bg-panel border border-line p-4 hover:border-line-strong transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Shield size={18} className="text-fg-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-eyebrow uppercase text-fg">Admin panel</p>
              <p className="mt-1 text-body-sm text-fg-muted truncate">Users & marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Chip>Admin</Chip>
            <ChevronRight size={16} className="text-fg-dim" />
          </div>
        </Link>
      )}

      <Card>
        <p className="text-eyebrow uppercase text-fg">Cycle management</p>
        <p className="mt-2 mb-4 text-body-sm text-fg-muted">
          Resetting starts a new week of tracking. Past data is kept in History; the
          dashboard returns to a fresh state.
        </p>
        <ResetCycleButton />
      </Card>

      {/* Danger zone: the one place the danger tone is allowed to frame a whole block. */}
      <div className="border border-danger/40 p-4">
        <div className="flex items-center gap-2 text-danger">
          <TriangleAlert size={16} />
          <p className="text-eyebrow uppercase">Danger zone</p>
        </div>
        <p className="mt-2 mb-4 text-body-sm text-fg-muted">
          Permanently delete every exercise log, skipped day, and history entry.
          Routines and account settings survive; all progress does not.
        </p>
        <WipeProgressButton />
      </div>
    </div>
  );
}
