import { Users } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UsersManager from "@/components/admin/UsersManager";
import { getCurrentSession } from "@/lib/auth/session";

export default async function UsersPage() {
  const context = await getCurrentSession();
  if (!context?.user.permissions.includes("users:manage")) redirect("/admin");

  return (
    <>
      <AdminPageHeader eyebrow="Seguridad" title="Usuarios y permisos" description="Dueños controlan usuarios; administradores publican; editores preparan borradores." icon={Users} />
      <UsersManager />
    </>
  );
}
