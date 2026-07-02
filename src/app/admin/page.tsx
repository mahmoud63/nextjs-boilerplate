import { getCurrentUser, getAdminData } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminPanel from "./AdminPanel";

const ADMIN_EMAIL = 'mahmoudk63@gmail.com';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const result = await getAdminData();
  const users = result.success ? (result.data?.users || []) : [];
  const marketplace = result.success ? (result.data?.marketplace || []) : [];

  return (
    <div className="h-full">
      <AdminPanel initialUsers={users} initialMarketplace={marketplace} />
    </div>
  );
}
