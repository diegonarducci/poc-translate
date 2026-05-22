import { evaluateTranslation } from "@/lib/translation/evaluator";
import {
  applyTranslatedSegments,
  extractTranslatableSegments
} from "@/lib/translation/field-map";
import {
  isProviderConfigured,
  PROVIDER_LABELS
} from "@/lib/translation/provider-config";
import { translateWithGoogle } from "@/lib/translation/adapters/google";
import { translateWithLibreTranslate } from "@/lib/translation/adapters/libretranslate";
import { translateWithOpenAI } from "@/lib/translation/adapters/openai";
import type {
  Locale,
  PatientClinicalSummary,
  TextSegment,
  TranslationProvider,
  TranslationResult
} from "@/lib/types";
import type {
  PatientTranslationAdapter,
  SegmentTranslationAdapter,
  TranslationAdapters
} from "@/lib/translation/adapters/shared";

export type TranslateProvidersInput = {
  patient: PatientClinicalSummary;
  sourceLocale: Locale;
  targetLocale: Locale;
  providers: TranslationProvider[];
};

export type TranslateProvidersOptions = {
  adapters?: TranslationAdapters;
  isConfigured?: (provider: TranslationProvider) => boolean;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 30000;

const defaultAdapters: Required<TranslationAdapters> = {
  google: translateWithGoogle,
  openai: translateWithOpenAI,
  libretranslate: translateWithLibreTranslate
};

function timeoutAfter<T>(ms: number, provider: TranslationProvider): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Tempo limite excedido para ${PROVIDER_LABELS[provider]}.`));
    }, ms);
  });
}

function emptyErrorResult(
  provider: TranslationProvider,
  latencyMs: number,
  message: string,
  code: "provider_unconfigured" | "provider_error" | "timeout"
): TranslationResult {
  return {
    provider,
    translatedPatient: null,
    latencyMs,
    warnings: [{ code, message }],
    glossaryHits: [],
    schemaValid: false,
    error: message
  };
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes("tempo limite");
}

async function translateOneProvider(
  provider: TranslationProvider,
  input: TranslateProvidersInput,
  options: TranslateProvidersOptions
): Promise<TranslationResult> {
  const startedAt = Date.now();
  const configured = options.isConfigured?.(provider) ?? isProviderConfigured(provider);

  if (!configured) {
    return emptyErrorResult(
      provider,
      Date.now() - startedAt,
      `${PROVIDER_LABELS[provider]} não configurado.`,
      "provider_unconfigured"
    );
  }

  try {
    const adapter = options.adapters?.[provider] || defaultAdapters[provider];
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    let translatedPatient: PatientClinicalSummary;

    if (provider === "openai") {
      const patientAdapter = adapter as PatientTranslationAdapter;
      translatedPatient = await Promise.race([
        patientAdapter({
          patient: input.patient,
          sourceLocale: input.sourceLocale,
          targetLocale: input.targetLocale
        }),
        timeoutAfter<PatientClinicalSummary>(timeoutMs, provider)
      ]);
    } else {
      const segments = extractTranslatableSegments(input.patient);
      const segmentAdapter = adapter as SegmentTranslationAdapter;
      const translationPromise: Promise<TextSegment[]> = segmentAdapter({
        patient: input.patient,
        sourceLocale: input.sourceLocale,
        targetLocale: input.targetLocale,
        segments
      });
      const timeoutPromise = timeoutAfter<TextSegment[]>(timeoutMs, provider);
      const translatedSegments = await Promise.race([
        translationPromise,
        timeoutPromise
      ]);

      translatedPatient = applyTranslatedSegments(
        input.patient,
        translatedSegments,
        input.targetLocale
      );
    }

    translatedPatient.sourceLocale = input.targetLocale;

    const evaluation = evaluateTranslation(
      input.patient,
      translatedPatient,
      input.sourceLocale,
      input.targetLocale
    );

    return {
      provider,
      translatedPatient,
      latencyMs: Date.now() - startedAt,
      warnings: evaluation.warnings,
      glossaryHits: evaluation.glossaryHits,
      schemaValid: evaluation.schemaValid
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido na tradução.";

    return emptyErrorResult(
      provider,
      Date.now() - startedAt,
      message,
      isTimeoutError(error) ? "timeout" : "provider_error"
    );
  }
}

export async function translatePatientForProviders(
  input: TranslateProvidersInput,
  options: TranslateProvidersOptions = {}
): Promise<TranslationResult[]> {
  return Promise.all(
    input.providers.map((provider) => translateOneProvider(provider, input, options))
  );
}
