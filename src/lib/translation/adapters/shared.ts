import type {
  Locale,
  PatientClinicalSummary,
  TextSegment,
  TranslationProvider
} from "@/lib/types";

export type SegmentTranslationParams = {
  patient: PatientClinicalSummary;
  sourceLocale: Locale;
  targetLocale: Locale;
  segments: TextSegment[];
};

export type SegmentTranslationAdapter = (
  params: SegmentTranslationParams
) => Promise<TextSegment[]>;

export type PatientTranslationAdapter = (params: {
  patient: PatientClinicalSummary;
  sourceLocale: Locale;
  targetLocale: Locale;
}) => Promise<PatientClinicalSummary>;

export type TranslationAdapters = Partial<
  Record<TranslationProvider, SegmentTranslationAdapter | PatientTranslationAdapter>
>;

export function cloneSegmentsWithText(
  segments: TextSegment[],
  translatedTexts: string[]
): TextSegment[] {
  return segments.map((segment, index) => ({
    ...segment,
    text: translatedTexts[index] ?? segment.text
  }));
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}
