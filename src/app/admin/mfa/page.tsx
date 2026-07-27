import { redirect } from "next/navigation";
import MfaSetup from "@/components/admin/MfaSetup";
import { getCurrentSession } from "@/lib/auth/session";

export default async function MfaPage() {
  const context = await getCurrentSession();
  if (!context) redirect("/admin/login");
  if (context.user.mfaVerified) redirect("/admin");
  return (
    <main className="flex min-h-[100dvh] items-center bg-[#f5f7fa] px-5 py-12 font-[Bricolage_Grotesque_Variable]">
      <MfaSetup />
    </main>
  );
}
