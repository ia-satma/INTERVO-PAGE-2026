import { FileText } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SubmissionsManager from "@/components/admin/SubmissionsManager";

export default function SubmissionsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Contacto" title="Solicitudes recibidas" description="Da seguimiento a los mensajes enviados desde el formulario público." icon={FileText} />
      <SubmissionsManager />
    </>
  );
}
