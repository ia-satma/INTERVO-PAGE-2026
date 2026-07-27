import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MediaAssignments from "@/components/admin/MediaAssignments";
import { getCurrentSession } from "@/lib/auth/session";
import { getCmsDocument } from "@/lib/cms/repository";

export default async function MediaPlacementsPage() {
  const [document, context] = await Promise.all([
    getCmsDocument("site-config", "draft"),
    getCurrentSession(),
  ]);
  if (!document || !context) return null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Medios del sitio"
        title="Dónde aparece cada imagen"
        description="Reemplaza logos, fondos, fotografías, videos y posters desde posiciones nombradas del sitio público."
        icon={ImageSquare}
      />
      <MediaAssignments
        siteData={document.data as Record<string, unknown>}
        canPublish={context.user.permissions.includes("content:publish")}
      />
    </>
  );
}
