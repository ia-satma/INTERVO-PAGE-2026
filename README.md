# intervø — Sitio web corporativo

Sitio web bilingüe (ES/EN) de **intervø — Legal and Business Consulting** (Intervo Legal, S.C.),
firma boutique de asesoría legal y de negocios con sede en Monterrey.

**Tagline:** _El puente entre los negocios y la ley._

---

## Stack

- **Next.js 16** (App Router, React 19) — SSR/SSG + SEO
- **TypeScript 5.9**
- **Tailwind CSS v4** (configuración CSS-first, tokens de marca en `globals.css`)
- **Framer Motion** — animaciones de entrada, respetando `prefers-reduced-motion`
- Internacionalización propia (ES/EN) vía segmento `[locale]` + middleware de detección de idioma
- Sin dependencias de backend: el formulario de contacto usa `mailto:` (ver TODO)

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
      socios/            # Socios
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
  middleware.ts          # redirección/idioma
public/
  brand/                 # logos e isotipos (assets originales de la firma)
  images/                # fotografía real del despacho (optimizada)
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

- [ ] **Correo público de la firma:** no se encontró en la web ni en el brochure. Está como
      placeholder `contacto@intervo.legal` en `src/lib/site.ts`. **Confirmar el correo real.**
- [ ] **Formulario de contacto:** hoy abre el cliente de correo del usuario (`mailto:`).
      Para recibir mensajes directo en un inbox/CRM, conectar un endpoint
      (p. ej. Resend, Formspree, o una Route Handler `/api/contact`) en `src/components/ContactForm.tsx`.
- [ ] **Retratos individuales de socios (opcional):** hoy se usan avatares con iniciales para evitar
      atribuciones incorrectas. Si se desea, agregar los retratos ya mapeados a cada socio.
- [ ] **Aviso de Privacidad:** el texto en `dictionaries` es de referencia; debe validarlo la firma.
- [ ] **Dominio/URL canónica:** actualizar `SITE_URL` en `src/lib/site.ts` si difiere de `https://www.intervo.legal`.
- [ ] Verificar el orden/identidad de los socios en la foto grupal contra el material oficial.

## Despliegue

Compatible con Vercel (recomendado para Next.js), o cualquier host con soporte Node.
El middleware de i18n requiere runtime (no es export estático puro).

## Créditos de contenido

Investigación, textos e imágenes derivados de los materiales oficiales de la firma
(sitio actual, brand kit y brochure 2023). Fotografía del despacho: sesión profesional de la firma.
