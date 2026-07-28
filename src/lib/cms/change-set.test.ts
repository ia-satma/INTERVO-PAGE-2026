import assert from "node:assert/strict";
import test from "node:test";
import { buildChangeSet, formatChangeValue, humanizeChangePath } from "../client/change-set";

test("buildChangeSet reports added, removed and changed fields", () => {
  const changes = buildChangeSet(
    { title: "Anterior", visible: true, obsolete: "Quitar" },
    { title: "Nuevo", visible: true, image: "/nuevo.webp" },
  );

  assert.deepEqual(
    changes.map(({ path, kind }) => ({ path, kind })),
    [
      { path: "title", kind: "changed" },
      { path: "obsolete", kind: "removed" },
      { path: "image", kind: "added" },
    ],
  );
});

test("buildChangeSet identifies nested bilingual and array changes", () => {
  const changes = buildChangeSet(
    { es: { title: "Hola" }, team: [{ name: "Ana" }] },
    { es: { title: "Bienvenidos" }, team: [{ name: "Ana" }, { name: "Luis" }] },
  );

  assert.equal(changes[0].path, "es.title");
  assert.equal(changes[1].path, "team.1");
  assert.equal(changes[1].kind, "added");
  assert.match(humanizeChangePath("team.1.name"), /Elemento 2/);
});

test("sensitive values remain masked in review output", () => {
  assert.equal(formatChangeValue("example-password-value", "password"), "••••••••••••");
  assert.equal(formatChangeValue(true, "visible"), "Sí");
  assert.equal(formatChangeValue("", "title"), "Vacío");
});
