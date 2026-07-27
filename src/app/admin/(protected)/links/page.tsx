import { ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LinksManager from "@/components/admin/LinksManager";
import { getCurrentSession } from "@/lib/auth/session";
import { getCmsDocument } from "@/lib/cms/repository";

export default async function LinksPage() {
  const [document, context] = await Promise.all([
    getCmsDocument("site-config", "draft"),
    getCurrentSession(),
  ]);
  if (!document || !context) return null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuración"
        title="Enlaces y redes"
        description="Controla desde un solo lugar navegación, botones internos, redes sociales, teléfonos, correos, privacidad y mapas."
        icon={ShareNetwork}
      />
      <LinksManager
        siteData={document.data as Record<string, unknown>}
        canPublish={context.user.permissions.includes("content:publish")}
      />
    </>
  );
}
