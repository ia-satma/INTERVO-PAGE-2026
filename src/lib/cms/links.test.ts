import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SITE_CONFIG } from "./defaults";
import {
  resolveHomeLink,
  resolveNavigationLink,
  resolvePrivacyLink,
  validateSiteConfigLinks,
  visibleSocialLinks,
} from "./links";

test("los destinos editables alimentan navegación, perfiles y enlaces auxiliares", () => {
  const config = structuredClone(DEFAULT_SITE_CONFIG);
  config.utilityLinks.homeEs = "/inicio";
  config.utilityLinks.privacyEn = "/en/privacy-notice";
  const team = config.navigation.find((item) => item.key === "socios");
  assert.ok(team);
  team.hrefEs = "/es/abogados";

  assert.equal(resolveHomeLink(config, "es"), "/inicio");
  assert.equal(resolvePrivacyLink(config, "en"), "/en/privacy-notice");
  assert.equal(resolveNavigationLink(config, "es", "socios"), "/es/abogados");
  assert.equal(resolveNavigationLink(config, "es", "socios", "alfredo"), "/es/abogados/alfredo");
});

test("las redes visibles se filtran y los protocolos peligrosos se rechazan", () => {
  const config = structuredClone(DEFAULT_SITE_CONFIG);
  config.socialLinks = [
    { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/intervo", visible: true },
    { id: "oculta", label: "Oculta", href: "https://example.com", visible: false },
    { id: "insegura", label: "Insegura", href: "javascript:alert(1)", visible: true },
  ];

  assert.deepEqual(visibleSocialLinks(config).map((item) => item.id), ["linkedin"]);
  assert.match(
    validateSiteConfigLinks(config as unknown as Record<string, unknown>).join(" "),
    /Red social 3/,
  );
});
