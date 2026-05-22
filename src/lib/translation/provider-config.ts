import type { ProviderStatus, TranslationProvider } from "@/lib/types";

export const PROVIDER_LABELS: Record<TranslationProvider, string> = {
  google: "Google Cloud",
  openai: "OpenAI LLM",
  libretranslate: "LibreTranslate"
};

export const PROVIDER_DETAILS: Record<TranslationProvider, string> = {
  google: "Cloud Translation Advanced com ADC",
  openai: "Responses API com schema clínico",
  libretranslate: "API local ou self-hosted"
};

export const PROVIDERS: TranslationProvider[] = [
  "google",
  "openai",
  "libretranslate"
];

export function getLibreTranslateUrl(): string {
  return process.env.LIBRETRANSLATE_URL || "http://localhost:5000";
}

export function isProviderConfigured(provider: TranslationProvider): boolean {
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  if (provider === "google") return Boolean(process.env.GOOGLE_CLOUD_PROJECT);
  return Boolean(getLibreTranslateUrl());
}

export function missingProviderConfig(provider: TranslationProvider): string[] {
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY ? [] : ["OPENAI_API_KEY"];
  }

  if (provider === "google") {
    return process.env.GOOGLE_CLOUD_PROJECT
      ? []
      : ["GOOGLE_CLOUD_PROJECT", "Application Default Credentials"];
  }

  return getLibreTranslateUrl() ? [] : ["LIBRETRANSLATE_URL"];
}

export function listProviderStatuses(): ProviderStatus[] {
  return PROVIDERS.map((provider) => ({
    provider,
    label: PROVIDER_LABELS[provider],
    configured: isProviderConfigured(provider),
    missingConfig: missingProviderConfig(provider),
    detail: PROVIDER_DETAILS[provider]
  }));
}
