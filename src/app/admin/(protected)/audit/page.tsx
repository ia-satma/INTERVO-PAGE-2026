import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AuditLog from "@/components/admin/AuditLog";
import { getCurrentSession } from "@/lib/auth/session";

export default async function AuditPage() {
  const context = await getCurrentSession();
  if (!context?.user.permissions.includes("audit:read")) redirect("/admin");

  return (
    <>
      <AdminPageHeader eyebrow="Trazabilidad" title="Registro de actividad" description="Cada guardado, publicación, archivo y cambio sensible queda asociado a su autor." icon={ClockCounterClockwise} />
      <AuditLog />
    </>
  );
}
