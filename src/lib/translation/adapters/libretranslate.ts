import { toBaseLanguage } from "@/lib/locales";
import { getLibreTranslateUrl } from "@/lib/translation/provider-config";
import type { SegmentTranslationAdapter } from "@/lib/translation/adapters/shared";
import { cloneSegmentsWithText } from "@/lib/translation/adapters/shared";

type LibreTranslateResponse = {
  translatedText?: string;
  error?: string;
};

async function translateOne(
  text: string,
  source: string,
  target: string
): Promise<string> {
  const body: Record<string, string> = {
    q: text,
    source,
    target,
    format: "text"
  };

  if (process.env.LIBRETRANSLATE_API_KEY) {
    body.api_key = process.env.LIBRETRANSLATE_API_KEY;
  }

  const response = await fetch(
    `${getLibreTranslateUrl().replace(/\/$/, "")}/translate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const payload = (await response.json()) as LibreTranslateResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Falha na tradução via LibreTranslate.");
  }

  return payload.translatedText || text;
}

export const translateWithLibreTranslate: SegmentTranslationAdapter = async ({
  sourceLocale,
  targetLocale,
  segments
}) => {
  const source = toBaseLanguage(sourceLocale);
  const target = toBaseLanguage(targetLocale);

  const translatedTexts = await Promise.all(
    segments.map((segment) => translateOne(segment.text, source, target))
  );

  return cloneSegmentsWithText(segments, translatedTexts);
};
