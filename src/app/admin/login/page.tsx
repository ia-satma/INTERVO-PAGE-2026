import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-[100dvh] bg-[#f5f7fa] font-[Bricolage_Grotesque_Variable] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]">
      <section className="relative hidden overflow-hidden bg-[#071d36] lg:block">
        <Image
          src="/images/textures/brand-shapes-navy-4.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 0px"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[#071d36]/35" />
        <div className="relative flex min-h-[100dvh] flex-col justify-between p-14 xl:p-20">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">intervø</p>
          <div className="max-w-xl">
            <p className="text-[clamp(2.8rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.055em] text-white">
              El sitio, bajo control editorial.
            </p>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-300">
              Contenido bilingüe, equipo, publicaciones y medios organizados en un solo lugar.
            </p>
          </div>
          <p className="text-xs tracking-wide text-slate-400">Legal and Business Consulting</p>
        </div>
      </section>
      <section className="flex min-h-[100dvh] items-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f4386] text-lg font-semibold text-white">i</span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Centro editorial</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Bienvenido de nuevo</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Ingresa con la cuenta asignada por el propietario del sitio.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
