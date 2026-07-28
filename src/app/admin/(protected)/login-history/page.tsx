import { SignIn } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoginHistory from "@/components/admin/LoginHistory";
import { getCurrentSession } from "@/lib/auth/session";

export default async function LoginHistoryPage() {
  const context = await getCurrentSession();
  if (!context?.user.permissions.includes("audit:read")) redirect("/admin");

  return (
    <>
      <AdminPageHeader
        eyebrow="Seguridad"
        title="Historial de accesos"
        description="Consulta quién inició o cerró sesión, los intentos rechazados, la fecha, el dispositivo y la dirección IP registrada."
        icon={SignIn}
      />
      <LoginHistory />
    </>
  );
}
