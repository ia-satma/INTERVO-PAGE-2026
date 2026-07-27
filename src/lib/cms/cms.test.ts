import assert from "node:assert/strict";
import test from "node:test";
import { CMS_DOCUMENTS } from "./defaults";
import { deepMerge } from "./merge";
import { can, permissionsForRole } from "@/lib/auth/rbac";

test("deepMerge conserva defaults, combina objetos y reemplaza arreglos", () => {
  const base = { hero: { title: "Original", body: "Texto" }, items: ["a", "b"], visible: true };
  const merged = deepMerge(base, { hero: { title: "Nuevo" }, items: ["c"] });
  assert.deepEqual(merged, {
    hero: { title: "Nuevo", body: "Texto" },
    items: ["c"],
    visible: true,
  });
});

test("cada documento editorial tiene clave única y contenido bilingüe cuando corresponde", () => {
  assert.equal(new Set(CMS_DOCUMENTS.map((document) => document.key)).size, CMS_DOCUMENTS.length);
  for (const document of CMS_DOCUMENTS.filter((item) => item.key !== "site-config")) {
    assert.ok(document.defaults.es);
    assert.ok(document.defaults.en);
  }
});

test("RBAC impide publicar y gestionar usuarios al editor", () => {
  assert.equal(can("editor", "content:publish"), false);
  assert.equal(can("editor", "users:manage"), false);
  assert.equal(can("admin", "content:publish"), true);
  assert.equal(can("admin", "users:manage"), false);
  assert.equal(can("owner", "users:manage"), true);
  assert.ok(permissionsForRole("owner").length > permissionsForRole("editor").length);
});
