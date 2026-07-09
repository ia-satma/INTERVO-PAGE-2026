import type { Locale } from "@/i18n/config";
import es, { type Dictionary } from "./dictionaries/es";
import en from "./dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? es;
}

export type { Dictionary };
