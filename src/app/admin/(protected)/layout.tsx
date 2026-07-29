import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getCurrentSession } from "@/lib/auth/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getCurrentSession();
  if (!context) redirect("/admin/login");
  return <AdminShell user={context.user}>{children}</AdminShell>;
}
