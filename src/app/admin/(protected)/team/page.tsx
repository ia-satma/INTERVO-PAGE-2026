import { Users } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TeamManager from "@/components/admin/TeamManager";
import { getCurrentSession } from "@/lib/auth/session";
import { getCmsDocument } from "@/lib/cms/repository";

export default async function AdminTeamPage() {
  const [siteDocument, navigationDocument, context] = await Promise.all([
    getCmsDocument("site-config", "draft"),
    getCmsDocument("navegacion-seo", "draft"),
    getCurrentSession(),
  ]);

  if (!siteDocument || !navigationDocument || !context) return null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Contenido"
        title="Equipo y organigrama"
        description="Añade, edita, ordena u oculta abogados; administra perfiles bilingües, fotografías y la estructura completa del equipo."
        icon={Users}
      />
      <TeamManager
        siteDocument={{
          key: siteDocument.key,
          version: siteDocument.version,
          data: siteDocument.data as Record<string, unknown>,
          published: siteDocument.published as Record<string, unknown>,
        }}
        navigationDocument={{
          key: navigationDocument.key,
          version: navigationDocument.version,
          data: navigationDocument.data as Record<string, unknown>,
          published: navigationDocument.published as Record<string, unknown>,
        }}
        canPublish={context.user.permissions.includes("content:publish")}
      />
    </>
  );
}
