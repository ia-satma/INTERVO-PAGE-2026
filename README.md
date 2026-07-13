# intervø — Sitio web corporativo

Sitio web bilingüe (ES/EN) de **intervø — Legal and Business Consulting** (Intervo Legal, S.C.),
firma boutique de asesoría legal y de negocios con sede en Monterrey.

**Tagline:** _El puente entre los negocios y la ley._

---

## Stack

- **Next.js 16** (App Router, React 19) — SSR/SSG + SEO
- **TypeScript 5.9**
- **Tailwind CSS v4** (configuración CSS-first, tokens de marca en `globals.css`)
- **Tipografía editorial**: Fraunces (serif display) + Montserrat (UI) + Inter (cuerpo), vía `next/font`
- **Motion**: Framer Motion (reveals) + **GSAP + ScrollTrigger** (hero cinemático, contadores, parallax), todo con fallback `prefers-reduced-motion`
- **Imaginería conceptual** (dirección editorial estilo Woods Rogers, adaptada): gradient-mesh, grano, motivo puente/∞ y **texturas de mármol en duotono** de la foto propia de la firma (`public/images/textures/`)
- **Directorio de Abogados**: grid de socios con foto real + perfil individual por abogado (`/socios/[id]`) — bio, áreas de práctica, contacto directo
- Internacionalización propia (ES/EN) vía segmento `[locale]` + `proxy` de detección de idioma
- Sin dependencias de backend: el formulario de contacto usa `mailto:` (ver TODO)
- `sharp` como dependencia para el optimizador de imágenes de Next (necesaria para `npm run dev`/`npm start`
  locales; el export estático a GitHub Pages usa `images.unoptimized`, así que no la necesita en producción)

## Requisitos

- Node.js ≥ 20 (probado con Node 24)
- npm

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000  → redirige a /es
```

## Producción

```bash
npm run build
npm start
```

## Estructura

```
src/
  app/
    [locale]/            # es | en
      layout.tsx         # fuentes, metadata, Header + Footer
      page.tsx           # Home
      firma/             # La Firma
      servicios/         # Servicios
      socios/            # Abogados (grid)
        [id]/            # Perfil individual del abogado
      global/            # Alcance Global
      contacto/          # Contacto
      aviso-de-privacidad/
      not-found.tsx
    globals.css          # design system + tokens de marca
    sitemap.ts / robots.ts
  components/            # Header, Footer, Hero, cards, icons, etc.
  i18n/
    config.ts            # locales
    dictionaries/es.ts   # copy en español (fuente de tipos)
    dictionaries/en.ts   # copy en inglés
  lib/site.ts            # contacto, oficinas, socios, servicios, navegación
  proxy.ts               # redirección/idioma (proxy de Next 16; sustituye a middleware.ts)
public/
  brand/                 # logos e isotipos (assets originales de la firma)
  images/                # fotografía real del despacho (optimizada)
    team/                # retratos individuales por socio (ver nota abajo)
```

## Marca

Colores muestreados de los assets originales del logotipo:

| Rol | Token | HEX |
|---|---|---|
| Azul brillante (Pantone 3005 C) | `--color-azure` | `#0a76b8` |
| Azul profundo (Pantone 2736 C) | `--color-navy` | `#0f4386` |
| Tinta / casi negro | `--color-ink` | `#101820` |

Tipografía: **Montserrat** (display, en línea con el wordmark) + **Inter** (cuerpo), vía `next/font`.

## Contenido editable

- **Copy:** `src/i18n/dictionaries/es.ts` y `en.ts` (misma estructura; TypeScript valida la paridad).
- **Contacto / oficinas / socios:** `src/lib/site.ts`.
- **Imágenes:** `public/images/` y `public/brand/`.

## TODO antes de lanzar

- [x] **Correo de contacto:** resuelto con datos reales de la papelería oficial (tarjetas de
      presentación). No existe un inbox genérico `info@`/`contacto@`; cada socio tiene su propio
      correo (`inicial+apellido@intervo.legal`). El contacto general del sitio usa el del Socio
      Director (`agarcia@intervo.legal`) y cada `PartnerCard` en Socios muestra su correo/tel. directo.
- [ ] **Formulario de contacto:** hoy abre el cliente de correo del usuario (`mailto:`).
      Para recibir mensajes directo en un inbox/CRM, conectar un endpoint
      (p. ej. Resend, Formspree, o una Route Handler `/api/contact`) en `src/components/ContactForm.tsx`.
- [ ] **Publicaciones / Insights:** los 3 artículos son contenido de muestra (en `dictionaries/{es,en}.ts`,
      bloque `insights.items`). La firma debe proveer las publicaciones reales; hoy las tarjetas no enlazan
      a páginas de detalle (se puede añadir `[slug]` cuando exista contenido).
- [ ] **Aviso de Privacidad:** el texto en `dictionaries` es de referencia; debe validarlo la firma.
- [ ] **Dominio/URL canónica:** actualizar `SITE_URL` en `src/lib/site.ts` si difiere de `https://www.intervo.legal`.
- [ ] **Nombre completo de Carlos Marcos:** el brochure 2025 usa "Roberto Carlos Marcos Romero" en una
      tarjeta y "Carlos Marcos Iga" en otra (mismo correo `cmarcos@intervo.legal`). Se mantiene "Carlos
      Marcos Iga" (el usado en Chambers & Partners); confirmar con la firma cuál es el nombre preferido.
- [x] **Fotos individuales de socios:** cada abogado tiene su foto real en `/socios/[id]`, recortada de
      la foto de grupo de la firma (`int_3.jpg`, sesión "thisisraw" 2022-10-17) cuyo orden izquierda→derecha
      está confirmado por el brochure oficial (Jorge · Carlos · Luis · Alfredo · Faustino). No se usaron
      las fotos de estudio sueltas (carpeta AGV, ~61 fotos sin etiquetar) para evitar atribuir mal una cara.
- [ ] **Bios/currículum de los socios:** hoy solo la bio de Alfredo García incluye datos verificados de
      formación y trayectoria previa (LL.M. Universitat Pompeu Fabra, White & Case, Arizpe Valdés & Marcos —
      fuente: LinkedIn). Las bios de Jorge, Carlos, Luis y Faustino son deliberadamente genéricas (solo
      describen su enfoque de práctica) para no inventar universidades, años de experiencia o firmas
      previas no verificadas — **pedir a la firma el CV/perfil de cada socio para completarlas**.

## Despliegue

Compatible con Vercel (recomendado para Next.js), o cualquier host con soporte Node.
El middleware de i18n requiere runtime (no es export estático puro).

**GitHub Pages (actual):** export estático vía `EXPORT=true npm run build` (ver
`.github/workflows/deploy-pages.yml`), con `images.unoptimized` — las imágenes se sirven tal cual,
sin pasar por el optimizador de Next.

> **Nota:** si corres `npm run dev`/`npm start` en local SIN `sharp` instalado, el optimizador de
> imágenes de Next puede devolver un archivo corrupto (`Content-Type: application/octet-stream`,
> ~4KB) para ciertas fotos, cacheado en `.next/cache/images`. `sharp` ya está en `dependencies` para
> evitarlo; si reaparece, borra `.next` y reinstala (`rm -rf .next node_modules/.cache`).

## Créditos de contenido

Investigación, textos e imágenes derivados de los materiales oficiales de la firma: sitio actual,
brand kit, brochures 2023 y 2025, y papelería oficial (tarjetas de presentación, hoja membretada).
Fotografía del despacho: sesión profesional de la firma.
