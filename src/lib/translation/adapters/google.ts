import { toGoogleLanguage } from "@/lib/locales";
import type { SegmentTranslationAdapter } from "@/lib/translation/adapters/shared";
import {
  cloneSegmentsWithText,
  decodeHtmlEntities
} from "@/lib/translation/adapters/shared";

type GoogleTranslationResponse = {
  translations?: Array<{ translatedText?: string }>;
  error?: { message?: string };
};

export const translateWithGoogle: SegmentTranslationAdapter = async ({
  sourceLocale,
  targetLocale,
  segments
}) => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    throw new Error("GOOGLE_CLOUD_PROJECT não configurado.");
  }

  const location = process.env.GOOGLE_TRANSLATE_LOCATION || "global";
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-translation"]
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error("Não foi possível obter token ADC para Google Cloud.");
  }

  const response = await fetch(
    `https://translation.googleapis.com/v3/projects/${project}/locations/${location}:translateText`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: segments.map((segment) => segment.text),
        mimeType: "text/plain",
        sourceLanguageCode: toGoogleLanguage(sourceLocale),
        targetLanguageCode: toGoogleLanguage(targetLocale)
      })
    }
  );

  const payload = (await response.json()) as GoogleTranslationResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || "Falha na tradução via Google.");
  }

  const translatedTexts =
    payload.translations?.map((item) => decodeHtmlEntities(item.translatedText || "")) ||
    [];

  return cloneSegmentsWithText(segments, translatedTexts);
};
