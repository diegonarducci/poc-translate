import { describe, expect, it } from "vitest";
import { samplePatients } from "@/lib/patients";
import { evaluateTranslation } from "@/lib/translation/evaluator";

describe("translation evaluator", () => {
  it("detects invariant changes", () => {
    const patient = samplePatients[0];
    const translated = structuredClone(patient);
    translated.medicalHistory.continuousMedications[0].dosage = "100 mg";

    const evaluation = evaluateTranslation(patient, translated, "pt-BR", "en-US");

    expect(evaluation.schemaValid).toBe(false);
    expect(evaluation.warnings.some((warning) => warning.code === "invariant_changed")).toBe(
      true
    );
  });

  it("detects expected glossary terms in translated text", () => {
    const patient = samplePatients[0];
    const translated = structuredClone(patient);
    translated.medicalHistory.chronicConditions[0].name = "Hypertension";
    translated.medicalHistory.chronicConditions[1].name =
      "Type 2 diabetes mellitus";
    translated.allergies.medication[0].substance = "Penicillin";
    translated.allergies.medication[1].substance = "Dipyrone";
    translated.medicalHistory.continuousMedications[0].use = "continuous use";

    const evaluation = evaluateTranslation(patient, translated, "pt-BR", "en-US");
    const hypertension = evaluation.glossaryHits.find(
      (hit) => hit.key === "hipertensao"
    );

    expect(hypertension?.foundExpectedTerm).toBe(true);
    expect(evaluation.glossaryHits.length).toBeGreaterThan(0);
  });
});
