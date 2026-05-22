import type { Locale } from "@/lib/types";

export const LOCALES: Array<{ code: Locale; label: string; shortLabel: string }> =
  [
    { code: "pt-BR", label: "Português Brasil", shortLabel: "PT-BR" },
    { code: "en-US", label: "English US", shortLabel: "EN-US" },
    { code: "es-ES", label: "Español España", shortLabel: "ES-ES" }
  ];

export function isLocale(value: unknown): value is Locale {
  return value === "pt-BR" || value === "en-US" || value === "es-ES";
}

export function toBaseLanguage(locale: Locale): "pt" | "en" | "es" {
  if (locale === "pt-BR") return "pt";
  if (locale === "en-US") return "en";
  return "es";
}

export function toGoogleLanguage(locale: Locale): string {
  return locale;
}
