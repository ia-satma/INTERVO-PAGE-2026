import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { ArrowUpRight } from "@/components/icons";
import { isLocale } from "@/i18n/config";
import { getCmsDocument } from "@/lib/cms/repository";
import { asset } from "@/lib/asset";

type Section = {
  type: "rich_text" | "image_text" | "video" | "stats" | "cards" | "cta";
  visible?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  image?: string;
  imagePosition?: "left" | "right";
  video?: string;
  poster?: string;
  label?: string;
  href?: string;
  items?: Array<{ value?: string; label?: string; title?: string; body?: string }>;
};

type PageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: Section[];
};

async function contentFor(localeValue: string, slug: string) {
  const locale = isLocale(localeValue) ? localeValue : "es";
  const document = await getCmsDocument(`page:${slug}`, "published");
  return { locale, content: document?.data?.[locale] as PageContent | undefined };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await contentFor(locale, slug);
  if (!page.content) return {};
  return {
    title: page.content.seoTitle || page.content.title,
    description: page.content.seoDescription || page.content.subtitle,
    alternates: { canonical: `/${page.locale}/${slug}`, languages: { es: `/es/${slug}`, en: `/en/${slug}` } },
  };
}

export default async function ModularPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const page = await contentFor(locale, slug);
  if (!page.content) notFound();
  const content = page.content;
  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />
      {content.sections.filter((section) => section.visible !== false).map((section, index) => {
        if (section.type === "image_text") {
          return (
            <section key={index} className="section">
              <div className="container-x grid items-center gap-10 lg:grid-cols-2">
                <Reveal className={section.imagePosition === "left" ? "lg:order-1" : "lg:order-2"}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist">
                    {section.image && <Image src={asset(section.image)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />}
                  </div>
                </Reveal>
                <Reveal className={section.imagePosition === "left" ? "lg:order-2" : "lg:order-1"}>
                  {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
                  <h2 className="display-2 mt-5">{section.title}</h2>
                  <p className="lead mt-6 whitespace-pre-line text-muted">{section.body}</p>
                </Reveal>
              </div>
            </section>
          );
        }
        if (section.type === "video") {
          return <section key={index} className="section bg-mist"><div className="container-x"><Reveal><h2 className="display-2 max-w-3xl">{section.title}</h2><p className="lead mt-5 max-w-2xl text-muted">{section.body}</p>{section.video && <video src={section.video} poster={section.poster || undefined} controls playsInline className="mt-9 aspect-video w-full rounded-2xl bg-navy-950 object-cover shadow-card" />}</Reveal></div></section>;
        }
        if (section.type === "stats") {
          return <section key={index} className="section bg-navy-950 text-white"><div className="container-x"><h2 className="display-2 text-white">{section.title}</h2><div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2 lg:grid-cols-4">{section.items?.map((item, itemIndex) => <div key={itemIndex} className="bg-navy-950 p-7"><p className="font-serif text-4xl text-white">{item.value}</p><p className="mt-2 text-sm text-white/65">{item.label}</p></div>)}</div></div></section>;
        }
        if (section.type === "cards") {
          return <section key={index} className="section"><div className="container-x"><h2 className="display-2">{section.title}</h2><div className="mt-10 grid gap-4 md:grid-cols-2">{section.items?.map((item, itemIndex) => <article key={itemIndex} className="border-t border-navy pt-5"><h3 className="font-display text-xl font-semibold">{item.title}</h3><p className="mt-3 text-muted">{item.body}</p></article>)}</div></div></section>;
        }
        if (section.type === "cta") {
          return <section key={index} className="section bg-navy-950 text-white"><div className="container-x text-center"><h2 className="display-2 mx-auto max-w-3xl text-white">{section.title}</h2><p className="lead mx-auto mt-5 max-w-xl text-white/70">{section.body}</p>{section.href && <Link href={section.href} className="btn btn-light mt-8">{section.label}<ArrowUpRight className="h-4 w-4" /></Link>}</div></section>;
        }
        return <section key={index} className="section"><div className="container-x max-w-4xl"><Reveal>{section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}<h2 className="display-2 mt-5">{section.title}</h2><p className="lead mt-7 whitespace-pre-line text-muted">{section.body}</p></Reveal></div></section>;
      })}
    </>
  );
}
