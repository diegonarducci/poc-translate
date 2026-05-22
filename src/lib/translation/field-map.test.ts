import { describe, expect, it } from "vitest";
import { samplePatients } from "@/lib/patients";
import {
  applyTranslatedSegments,
  extractTranslatableSegments
} from "@/lib/translation/field-map";

describe("translation field map", () => {
  it("extracts only translatable clinical fields and preserves invariants", () => {
    const patient = samplePatients[0];
    const segments = extractTranslatableSegments(patient);

    expect(
      segments.some(
        (segment) => segment.id === "medicalHistory.continuousMedications.0.dosage"
      )
    ).toBe(false);
    expect(
      segments.some(
        (segment) => segment.id === "medicalHistory.lastMedicalVisit.date"
      )
    ).toBe(false);
    expect(segments.some((segment) => segment.id === "name")).toBe(false);
    expect(
      segments.some((segment) => segment.id === "allergies.medication.0.reaction")
    ).toBe(true);
    expect(
      segments.some((segment) => segment.id === "documents.0.summary")
    ).toBe(true);
  });

  it("rebuilds the patient JSON with translated segment values", () => {
    const patient = samplePatients[0];
    const translatedSegments = extractTranslatableSegments(patient).map((segment) => ({
      ...segment,
      text: `${segment.text} [EN]`
    }));

    const translated = applyTranslatedSegments(patient, translatedSegments, "en-US");

    expect(translated.sourceLocale).toBe("en-US");
    expect(translated.name).toBe(patient.name);
    expect(translated.profile.passportNumber).toBe(patient.profile.passportNumber);
    expect(translated.medicalHistory.continuousMedications[0].dosage).toBe(
      patient.medicalHistory.continuousMedications[0].dosage
    );
    expect(translated.medicalHistory.lastMedicalVisit.date).toBe(
      patient.medicalHistory.lastMedicalVisit.date
    );
    expect(translated.allergies.medication[0].reaction).toContain("[EN]");
  });
});
