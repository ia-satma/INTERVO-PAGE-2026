import Link from "next/link";
import { ArrowRight, ChartLineUp, ClockCounterClockwise, FileText, Images, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CreatePageButton from "@/components/admin/CreatePageButton";
import { listCmsDocuments } from "@/lib/cms/repository";
import { getDb } from "@/lib/db";
import { contactSubmissions, mediaItems } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const documents = await listCmsDocuments();
  const db = getDb();
  const [submissionsCount, mediaCount] = db
    ? await Promise.all([
        db.select({ value: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, "new")),
        db.select({ value: count() }).from(mediaItems),
      ])
    : [[{ value: 0 }], [{ value: 0 }]];
  const drafts = documents.filter((document) => document.status === "draft").length;

  return (
    <>
      <AdminPageHeader eyebrow="Resumen" title="Centro editorial" description="Publica cambios con control de versiones y mantén cada idioma alineado." icon={ChartLineUp} actions={<CreatePageButton />} />
      <section className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
        {[
          { label: "Borradores pendientes", value: drafts, icon: PencilSimpleLine, href: "/admin/content/home" },
          { label: "Solicitudes nuevas", value: submissionsCount[0]?.value ?? 0, icon: FileText, href: "/admin/submissions" },
          { label: "Medios disponibles", value: mediaCount[0]?.value ?? 0, icon: Images, href: "/admin/media" },
        ].map((metric) => (
          <Link key={metric.label} href={metric.href} className="group bg-white p-6 transition-colors hover:bg-slate-50">
            <metric.icon size={21} className="text-sky-700" />
            <p className="mt-6 font-mono text-4xl font-semibold tracking-[-0.05em] text-slate-950">{metric.value}</p>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600"><span>{metric.label}</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></div>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Sitio público</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Áreas editables</h2></div>
          <span className="inline-flex items-center gap-2 text-xs text-slate-500"><ClockCounterClockwise size={16} /> Versiones recuperables</span>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {documents.map((document) => (
            <Link key={document.key} href={document.key === "equipo" ? "/admin/team" : `/admin/content/${document.key}`} className="group grid gap-3 py-5 transition-colors hover:bg-white sm:grid-cols-[1fr_180px_110px] sm:items-center sm:px-3">
              <div><h3 className="font-semibold text-slate-900">{document.label}</h3><p className="mt-1 max-w-2xl text-sm text-slate-500">{document.description}</p></div>
              <span className="text-xs text-slate-500">{document.updatedAt ? new Date(document.updatedAt).toLocaleDateString("es-MX") : "Contenido inicial"}</span>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${document.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{document.status === "draft" ? "Borrador" : "Publicado"}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
