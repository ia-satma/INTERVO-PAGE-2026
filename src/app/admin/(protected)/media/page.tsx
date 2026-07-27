import { Images } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import MediaManager from "@/components/admin/MediaManager";

export default function MediaPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Biblioteca" title="Imágenes y videos" description="Reutiliza recursos existentes o sube nuevos archivos persistentes a App Storage." icon={Images} />
      <MediaManager />
    </>
  );
}
