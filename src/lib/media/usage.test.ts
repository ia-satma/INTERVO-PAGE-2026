import assert from "node:assert/strict";
import test from "node:test";
import { buildMediaUsageMap } from "./usage";

test("buildMediaUsageMap registra cada reutilización en borrador y publicado", () => {
  const image = "/api/media/media/team/example.webp";
  const usages = buildMediaUsageMap(
    [
      {
        key: "site-config",
        label: "Configuración",
        draft: {
          media: { heroPoster: image },
          organization: { lawyers: [{ photo: image }] },
        },
        published: { media: { heroPoster: image } },
      },
    ],
    [image],
  );

  assert.deepEqual(usages.get(image), [
    {
      documentKey: "site-config",
      documentLabel: "Configuración",
      state: "draft",
      path: "media.heroPoster",
    },
    {
      documentKey: "site-config",
      documentLabel: "Configuración",
      state: "draft",
      path: "organization.lawyers[0].photo",
    },
    {
      documentKey: "site-config",
      documentLabel: "Configuración",
      state: "published",
      path: "media.heroPoster",
    },
  ]);
});

test("buildMediaUsageMap ignora coincidencias parciales dentro de otros textos", () => {
  const image = "/images/team/person.webp";
  const usages = buildMediaUsageMap(
    [
      {
        key: "equipo",
        label: "Equipo",
        draft: { note: `Referencia: ${image}` },
        published: {},
      },
    ],
    [image],
  );

  assert.deepEqual(usages.get(image), []);
});
