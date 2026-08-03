import assert from "node:assert/strict";
import test from "node:test";
import { applyClientFeedbackToDocument, CLIENT_MAP_LINKS } from "./client-feedback";

test("patches site configuration without replacing unrelated editorial data", () => {
  const input = {
    custom: { preserved: true },
    contact: { phoneDisplay: "123", email: "old@example.com", whatsappHref: "https://wa.me/1" },
    navigation: [{ key: "firma", visible: true }, { key: "publicaciones", visible: true }],
    offices: [{ id: "monterrey", city: "Monterrey", mapsHref: "old" }],
    partners: [{ id: "alfredo", managing: true, name: "Alfredo" }, { id: "carlos", name: "Carlos" }],
    organization: { partners: [{ id: "alfredo", photo: "old" }] },
  };
  const result = applyClientFeedbackToDocument("site-config", input);
  assert.deepEqual(result.custom, { preserved: true });
  assert.equal((result.contact as Record<string, unknown>).email, "info@intervo.legal");
  assert.equal((result.navigation as Array<Record<string, unknown>>)[1].visible, false);
  assert.equal((result.offices as Array<Record<string, unknown>>)[0].mapsHref, CLIENT_MAP_LINKS.monterrey);
  assert.equal((result.media as Record<string, unknown>).logoColor, "/brand/logo-color-trim.png");
  assert.equal((result.media as Record<string, unknown>).logoWhite, "/brand/logo-white-trim.png");
  assert.equal("managing" in (result.partners as Array<Record<string, unknown>>)[0], false);
  assert.equal((result.partners as Array<Record<string, unknown>>)[1].name, "Carlos");
});

test("client feedback patch is idempotent", () => {
  const input = {
    es: { note: "old", organization: { lawyers: "Abogados" }, extra: "preserve" },
    en: { note: "old", organization: { lawyers: "Attorneys" } },
  };
  const once = applyClientFeedbackToDocument("equipo", input);
  const twice = applyClientFeedbackToDocument("equipo", once);
  assert.deepEqual(twice, once);
  assert.equal((once.es as Record<string, unknown>).extra, "preserve");
});

test("removes managing-partner wording from shared Alfredo profile", () => {
  const result = applyClientFeedbackToDocument("navegacion-seo", {
    es: { partners: { alfredo: { role: "Socio Director", specialties: ["Corporativo"] } } },
    en: { partners: { alfredo: { role: "Managing Partner", specialties: ["Corporate"] } } },
  });
  const esPartners = (result.es as Record<string, unknown>).partners as Record<string, Record<string, unknown>>;
  const enPartners = (result.en as Record<string, unknown>).partners as Record<string, Record<string, unknown>>;
  assert.equal(esPartners.alfredo.role, "Socio");
  assert.equal(enPartners.alfredo.role, "Partner");
  assert.deepEqual(esPartners.alfredo.specialties, ["Corporativo"]);
});
