import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 pt-24">
      <div className="text-center">
        <p className="font-display text-6xl font-bold text-navy">404</p>
        <p className="mt-4 text-lg text-muted">Página no encontrada · Page not found</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/es" className="btn btn-primary !px-6 !py-3">
            Inicio <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/en" className="btn btn-ghost !px-6 !py-3">
            Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
