import { toBaseLanguage } from "@/lib/locales";
import { getLibreTranslateUrl } from "@/lib/translation/provider-config";
import type { SegmentTranslationAdapter } from "@/lib/translation/adapters/shared";
import { cloneSegmentsWithText } from "@/lib/translation/adapters/shared";

type LibreTranslateResponse = {
  translatedText?: string;
  error?: string;
};

const DEFAULT_LIBRETRANSLATE_CONCURRENCY = 4;

function getLibreTranslateConcurrency(): number {
  const configured = Number(process.env.LIBRETRANSLATE_CONCURRENCY);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.floor(configured);
  }

  return DEFAULT_LIBRETRANSLATE_CONCURRENCY;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

async function readLibreTranslateResponse(
  response: Response
): Promise<LibreTranslateResponse> {
  const rawBody = await response.text();

  try {
    return rawBody ? (JSON.parse(rawBody) as LibreTranslateResponse) : {};
  } catch {
    const preview = rawBody.replace(/\s+/g, " ").trim().slice(0, 160);
    throw new Error(
      `LibreTranslate retornou resposta inesperada (${response.status}): ${preview}`
    );
  }
}

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

  const payload = await readLibreTranslateResponse(response);

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

  const translatedTexts = await mapWithConcurrency(
    segments,
    getLibreTranslateConcurrency(),
    (segment) => translateOne(segment.text, source, target)
  );

  return cloneSegmentsWithText(segments, translatedTexts);
};
