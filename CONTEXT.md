# CONTEXT.md — intervø (Intervo Legal, S.C.)

Documento de contexto/handoff del proyecto. Complementa a `README.md` (que cubre stack y
desarrollo local) con el **estado real**, las **decisiones de diseño**, los **pendientes del
cliente** y los **gotchas técnicos** encontrados durante el desarrollo. Última actualización:
**2026-07-13**.

---

## 1. Quién es el cliente

**Intervo Legal, S.C.** ("intervø" — LEGAL AND BUSINESS CONSULTING), despacho boutique
corporativo/transaccional con sede en **Monterrey** y oficina en **Ciudad Juárez**. Tagline:
*"El puente entre los negocios y la ley."* Fundado 2019. 5 socios.

## 2. Coordenadas

| | |
|---|---|
| **Repositorio** | https://github.com/ia-satma/INTERVO-PAGE-2026 (público, rama `main`) |
| **GitHub Pages (sitio en vivo)** | https://ia-satma.github.io/INTERVO-PAGE-2026/ |
| **Local (Mac)** | `/Volumes/alejandro /INTERVO PAGINA WEB/intervo-web` |
| **Investigación/brand kit fuente** | `/Volumes/alejandro /INTERVO PAGINA WEB/00-research/` (no versionado en el repo) |
| **Dominio propio** | Pendiente — hoy vive en GitHub Pages. Migrar a `intervo.legal` requiere ajustar `basePath`/DNS. |

## 3. Stack técnico

- **Next.js 16** (App Router, React 19), **TypeScript 5.9**, **Tailwind CSS v4** (config
  CSS-first, tokens en `globals.css`).
- **Tipografía**: Fraunces (serif display) + Montserrat (UI) + Inter (cuerpo), vía `next/font`.
- **Motion**: CSS transitions a mano (sin librería de animación) + `Reveal.tsx`
  (IntersectionObserver) + `CountUp.tsx` (requestAnimationFrame). Un solo orquestador de
  reveal, sin GSAP.
- **Bilingüe** (ES/EN) vía segmento `[locale]` + `src/proxy.ts` (Next.js 16 renombró
  `middleware.ts` a `proxy.ts` — no es código muerto si lo ves con ese nombre).
- **Export estático** (`output: "export"`) a GitHub Pages vía `.github/workflows/deploy-pages.yml`,
  `images.unoptimized` (no pasa por el optimizador de Next en producción).
- Sin backend: el formulario de contacto usa `mailto:`.
- `sharp` en `dependencies` — necesaria solo para `npm run dev`/`npm start` locales (el
  optimizador de imágenes de Next falla sin ella, ver §6).

## 4. Estructura del sitio

Home · La Firma · Servicios · **Abogados** (`/socios`, muro interactivo + perfil individual
`/socios/[id]`) · Alcance Global · Publicaciones · Contacto · Aviso de Privacidad.

```
src/
  app/[locale]/            # es | en — layout, páginas, not-found.tsx
  app/not-found.tsx        # 404 raíz (necesario para GitHub Pages, ver §6)
  components/              # Header, Footer, Hero, TeamWall, cards, icons…
  i18n/dictionaries/       # es.ts (fuente de tipos) + en.ts (paridad forzada por TS)
  lib/site.ts              # contacto, oficinas, socios, servicios, navegación
  proxy.ts                 # idioma/redirección (Next 16)
public/
  brand/                   # logos e isotipos oficiales
  images/team/              # fotos individuales de los 5 socios
```

## 5. Marca

| Rol | Token | HEX |
|---|---|---|
| Azul brillante (Pantone 3005 C) | `--color-azure` | `#0a76b8` |
| Azul profundo (Pantone 2736 C) | `--color-navy` | `#0f4386` |
| Tinta | `--color-ink` | `#101820` |
| Acento champagne (contraste WCAG AA) | `--color-accent-deep` | `#8a6c34` |

Dirección editorial inspirada en **Woods Rogers** (espejo de sensación, no clon — branding
propio de intervø).

## 6. Decisiones de diseño y bugs reales (por orden cronológico)

### 6.1 Identidad de fotos del equipo — lección de integridad profesional
Las fotos individuales de los 5 socios se intentaron primero recortar de una foto de grupo sin
etiquetar, asumiendo que el orden izquierda→derecha coincidía con el del brochure oficial. Al
preguntar el cliente *"¿las fotos no estaban en pCloud?"*, se encontraron los 5 avatares
**oficiales nombrados sin ambigüedad** en una carpeta `/Web/` del sitio anterior — comparando,
**la foto atribuida a "Luis Romero" era la persona equivocada**. Se corrigió con los avatares
oficiales y **se eliminó la foto de grupo del sitio** por no poder verificarse con certeza.
**Regla adoptada:** nunca publicar una foto atribuida a un nombre sin verificarla contra una
fuente que confirme esa identidad directamente (no inferir por orden de otro documento).

### 6.2 Directorio de Abogados → muro de equipo interactivo (`TeamWall`)
El directorio pasó por 3 iteraciones: (1) grid simple + perfil individual; (2) banner de "muro
de fotos" agregado ENCIMA del directorio existente (duplicaba la sección); (3) **consolidación
total** en un único componente `TeamWall.tsx` — se eliminaron `SociosDirectory.tsx`,
`PartnerCard.tsx` y `FeaturedPartner.tsx`. Hoy: tiles a `flex-1` en reposo →
`hover:flex-[2.6]` (expansión real de tamaño) + zoom de foto + crossfade grayscale→color +
panel de especialidades revelado (`grid-template-rows: 0fr → 1fr`) + filtro por área de
práctica plegado en el header de la misma sección.

**Bug de color corregido:** un filtro CSS compuesto de 6 funciones (con `hue-rotate`)
transicionando a `none` producía tonos intermedios visualmente feos. Fix: dos capas
independientes — `grayscale` simple en la imagen + overlay `mix-blend-multiply` con su propia
`opacity`, cada una transicionando por su cuenta.

**Badges de Chambers & Partners:** removidos de los tiles del muro (quedan solo en el perfil
individual `/socios/[id]`). El cliente confirmó que el reconocimiento SÍ debe destacarse, pero
como **logo oficial** en la sección "Reconocimiento" (Home/Firma) — bloqueado por requerir login
a `myaccount.chambers.com` (cuenta propia de la firma), diferido por decisión del cliente.

### 6.3 `not-found.tsx` — bug de GitHub Pages con i18n
`not-found.tsx` bajo `[locale]/` **no** es el archivo que Next.js usa para generar el
`out/404.html` raíz que GitHub Pages sirve ante cualquier URL rota — hace falta **también** un
`not-found.tsx` en la raíz de `app/`, si no se sirve el 404 genérico de Next en vez del propio.

### 6.4 Tailwind v4 — `transition-[transform,...]` no anima `translate`/`scale`
Tailwind v4 separó `transform` en propiedades CSS independientes (`translate`, `scale`,
`rotate`). Un `transition-[transform,...]` con `hover:-translate-y-1`/`hover:scale-105` **no
anima nada** — hay que usar `transition-transform` (shorthand que expande correcto) o listar
`transition-[translate,scale,...]`. Bug de sitio completo, corregido en `ServiceCard`,
`ValueCard`, `InsightCard`, `servicios/page.tsx` y los links de "otros socios" del perfil.

### 6.5 Optimizador de imágenes de Next sin `sharp`
En local (`npm run dev`/`npm start`) sin `sharp` instalado, `/_next/image` devolvía archivos
corruptos (`Content-Type: application/octet-stream`, ~4KB) cacheados. `sharp` ya está en
`dependencies`. Irrelevante en producción (GitHub Pages usa `images.unoptimized`).

### 6.6 Auditoría de diseño y animación
Se corrieron auditorías (`/frontend-design`, `/ui-ux-pro-max`, y las skills
`redesign-existing-projects`/`improve-animations`) que produjeron, entre otros: fix de contraste
WCAG AA en dos tokens de color usados en todo el sitio (`--color-muted-2`,
`--color-accent-deep`), `spotlight-border` en cards, `btn:active` con feedback de presión,
`tabular-nums` en contadores, y el fix del glitch de color de §6.2.

## 7. Limpieza de código (2026-07-13)

`npm run lint`/`npx eslint` no funcionan en este entorno (la ruta local tiene un espacio que
rompe el parseo de `next lint`; sin `eslint.config.js` propio). Verificación alterna:
`npx tsc --noEmit` (0 errores) + grep sistemático. Se encontró y corrigió una regresión real
(animación de entrada de los chips de filtro, perdida al fusionar componentes) y se eliminó
código muerto confirmado: `motion/Parallax.tsx`, helper `initials()`, CSS
`.hairline`/`.display-3`, imagen `marble-table.jpg`.

## 8. Pendientes reales para el cliente

🔴 **Contenido que falta validar con la firma:**
- **Bios de socios:** solo Alfredo García tiene formación/trayectoria verificada (LL.M.
  Universitat Pompeu Fabra, White & Case, Arizpe Valdés & Marcos). Las otras 4 bios son
  deliberadamente genéricas — pedir CV real de cada socio.
- **Fotos de mayor resolución:** Jorge, Carlos, Luis y Faustino usan avatares de 271px del sitio
  anterior — pedir sesión fotográfica actualizada si existe.
- **Nombre completo de Carlos Marcos:** "Roberto Carlos Marcos Romero" vs "Carlos Marcos Iga"
  (mismo correo) — confirmar preferencia.
- **Teléfono de Ciudad Juárez:** dígitos insuficientes en la hoja membretada — no publicado.
- **Aviso de Privacidad:** texto de referencia, sin validar legalmente.
- **Publicaciones/Insights:** 3 artículos son contenido de muestra.
- **Logo oficial de Chambers & Partners:** requiere login a `myaccount.chambers.com` — diferido.

🟡 **Decisiones de infraestructura diferidas:**
- **Formulario de contacto sin backend real** (usa `mailto:`) — conectar Resend/Formspree/Route
  Handler propia si se quiere recibir mensajes en un inbox/CRM.
- **Dominio propio** (`intervo.legal`) — hoy vive en GitHub Pages.

## 9. Reglas de trabajo establecidas

- Cada cambio de diseño se verifica en el **export estático servido bajo el basePath real**
  (no `npm run dev`) antes de darlo por bueno.
- Nunca publicar una foto atribuida a un nombre sin verificarla contra una fuente que confirme
  esa identidad directamente.
- Push a GitHub tras cada tanda de cambios + confirmar el deploy de GitHub Actions en verde +
  verificar en la URL pública real.

## 10. Créditos

Investigación, textos e imágenes derivados de los materiales oficiales de la firma: sitio
actual, brand kit, brochures 2023 y 2025, papelería oficial. Fotografía: sesión profesional de
la firma.
