import { notFound } from "next/navigation";
import { PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ContentEditor from "@/components/admin/ContentEditor";
import { getCurrentSession } from "@/lib/auth/session";
import { getCmsDocument } from "@/lib/cms/repository";

export default async function AdminContentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const [document, context] = await Promise.all([getCmsDocument(key, "draft"), getCurrentSession()]);
  if (!document || !context) notFound();
  return (
    <>
      <AdminPageHeader eyebrow={document.group} title={document.label} description={document.description} icon={PencilSimpleLine} />
      <ContentEditor
        document={{
          key: document.key,
          label: document.label,
          description: document.description,
          status: document.status,
          version: document.version,
          data: document.data as never,
          published: document.published as never,
        }}
        canPublish={context.user.permissions.includes("content:publish")}
      />
    </>
  );
}
