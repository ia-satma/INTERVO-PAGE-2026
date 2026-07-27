export function csrfToken() {
  if (typeof document === "undefined") return "";
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith("intervo_csrf="))
    ?.split("=")
    .slice(1)
    .join("=") ?? "";
}

export const csrfHeaders = () => ({ "x-csrf-token": csrfToken() });
