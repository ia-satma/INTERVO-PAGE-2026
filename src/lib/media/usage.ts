export type MediaUsage = {
  documentKey: string;
  documentLabel: string;
  state: "draft" | "published";
  path: string;
};

export type MediaUsageDocument = {
  key: string;
  label: string;
  draft: Record<string, unknown>;
  published: Record<string, unknown>;
};

function walk(
  value: unknown,
  path: string,
  visit: (value: string, path: string) => void,
) {
  if (typeof value === "string") {
    visit(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, visit));
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, item]) => {
    walk(item, path ? `${path}.${key}` : key, visit);
  });
}

export function buildMediaUsageMap(
  documents: MediaUsageDocument[],
  urls: string[],
) {
  const targets = new Set(urls.filter(Boolean));
  const usages = new Map<string, MediaUsage[]>();
  targets.forEach((url) => usages.set(url, []));

  for (const document of documents) {
    for (const state of ["draft", "published"] as const) {
      walk(document[state], "", (value, path) => {
        if (!targets.has(value)) return;
        usages.get(value)?.push({
          documentKey: document.key,
          documentLabel: document.label,
          state,
          path,
        });
      });
    }
  }

  return usages;
}
