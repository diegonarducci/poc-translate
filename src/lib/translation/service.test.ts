import { describe, expect, it } from "vitest";
import { samplePatients } from "@/lib/patients";
import { applyTranslatedSegments } from "@/lib/translation/field-map";
import { translatePatientForProviders } from "@/lib/translation/service";
import type { SegmentTranslationAdapter } from "@/lib/translation/adapters/shared";

describe("translation service", () => {
  it("returns partial results for mocked provider success, failure and timeout", async () => {
    const patient = samplePatients[0];
    const googleAdapter: SegmentTranslationAdapter = async ({ segments }) =>
      segments.map((segment) => ({ ...segment, text: `${segment.text} translated` }));

    const results = await translatePatientForProviders(
      {
        patient,
        sourceLocale: "pt-BR",
        targetLocale: "en-US",
        providers: ["google", "openai"]
      },
      {
        isConfigured: () => true,
        timeoutMs: 10,
        adapters: {
          google: googleAdapter,
          openai: async () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(applyTranslatedSegments(patient, [], "en-US")), 30);
            })
        }
      }
    );

    expect(results).toHaveLength(2);
    expect(results.find((result) => result.provider === "google")?.translatedPatient).not.toBeNull();
    expect(results.find((result) => result.provider === "openai")?.warnings[0].code).toBe(
      "timeout"
    );
  });
});
