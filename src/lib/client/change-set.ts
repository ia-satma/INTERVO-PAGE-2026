export type ChangeKind = "added" | "removed" | "changed";

export type ChangeItem = {
  path: string;
  label: string;
  before: unknown;
  after: unknown;
  kind: ChangeKind;
};

const fieldLabels: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  title: "Título",
  subtitle: "Subtítulo",
  description: "Descripción",
  body: "Contenido",
  label: "Etiqueta",
  href: "Enlace",
  image: "Imagen",
  photo: "Fotografía",
  video: "Video",
  poster: "Portada del video",
  name: "Nombre",
  role: "Puesto",
  email: "Correo",
  phone: "Teléfono",
  visible: "Visible",
  published: "Publicado",
  status: "Estado",
  notes: "Notas",
  password: "Contraseña",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function equal(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right) return false;
  if (left === null || right === null) return false;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => equal(item, right[index]));
  }
  if (isRecord(left) && isRecord(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return [...keys].every((key) => equal(left[key], right[key]));
  }
  return false;
}

export function humanizeChangePath(path: string) {
  return path
    .split(".")
    .filter(Boolean)
    .map((segment) => {
      if (/^\d+$/.test(segment)) return `Elemento ${Number(segment) + 1}`;
      return fieldLabels[segment] ?? segment
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/^./, (character) => character.toUpperCase());
    })
    .join(" › ");
}

export function buildChangeSet(before: unknown, after: unknown, limit = 120): ChangeItem[] {
  const changes: ChangeItem[] = [];

  function visit(previous: unknown, next: unknown, path: string) {
    if (changes.length >= limit || equal(previous, next)) return;

    if (Array.isArray(previous) && Array.isArray(next)) {
      const length = Math.max(previous.length, next.length);
      for (let index = 0; index < length && changes.length < limit; index += 1) {
        visit(previous[index], next[index], path ? `${path}.${index}` : String(index));
      }
      return;
    }

    if (isRecord(previous) && isRecord(next)) {
      const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
      for (const key of keys) {
        if (changes.length >= limit) break;
        visit(previous[key], next[key], path ? `${path}.${key}` : key);
      }
      return;
    }

    changes.push({
      path,
      label: humanizeChangePath(path || "contenido"),
      before: previous,
      after: next,
      kind: typeof previous === "undefined" ? "added" : typeof next === "undefined" ? "removed" : "changed",
    });
  }

  visit(before, after, "");
  return changes;
}

export function formatChangeValue(value: unknown, path = "") {
  if (/(password|contraseña|token|secret|secreto)/i.test(path) && value) return "••••••••••••";
  if (typeof value === "undefined" || value === null || value === "") return "Vacío";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
