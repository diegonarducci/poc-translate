import { medicalGlossary, textIncludesAnyTerm } from "@/lib/glossary";
import type {
  GlossaryHit,
  Locale,
  PatientClinicalSummary,
  TranslationWarning
} from "@/lib/types";

export type TranslationEvaluation = {
  schemaValid: boolean;
  warnings: TranslationWarning[];
  glossaryHits: GlossaryHit[];
};

type InvariantPair = {
  label: string;
  original: unknown;
  translated: unknown;
};

function flattenClinicalText(patient: PatientClinicalSummary): string {
  return JSON.stringify(patient);
}

function invariantPairs(
  original: PatientClinicalSummary,
  translated: PatientClinicalSummary
): InvariantPair[] {
  const pairs: InvariantPair[] = [
    { label: "id", original: original.id, translated: translated.id },
    { label: "name", original: original.name, translated: translated.name },
    { label: "age", original: original.age, translated: translated.age },
    {
      label: "lastUpdated",
      original: original.lastUpdated,
      translated: translated.lastUpdated
    },
    {
      label: "profile.firstName",
      original: original.profile.firstName,
      translated: translated.profile?.firstName
    },
    {
      label: "profile.lastName",
      original: original.profile.lastName,
      translated: translated.profile?.lastName
    },
    {
      label: "profile.birthDate",
      original: original.profile.birthDate,
      translated: translated.profile?.birthDate
    },
    {
      label: "profile.passportNumber",
      original: original.profile.passportNumber,
      translated: translated.profile?.passportNumber
    },
    {
      label: "profile.bloodType",
      original: original.profile.bloodType,
      translated: translated.profile?.bloodType
    },
    {
      label: "profile.heightCm",
      original: original.profile.heightCm,
      translated: translated.profile?.heightCm
    },
    {
      label: "profile.weightKg",
      original: original.profile.weightKg,
      translated: translated.profile?.weightKg
    }
  ];

  (["medication", "food", "other"] as const).forEach((group) => {
    original.allergies[group].forEach((allergy, index) => {
      pairs.push({
        label: `allergies.${group}.${index}.recordedAt`,
        original: allergy.recordedAt,
        translated: translated.allergies?.[group]?.[index]?.recordedAt
      });
    });
  });

  original.medicalHistory.chronicConditions.forEach((condition, index) => {
    pairs.push({
      label: `medicalHistory.chronicConditions.${index}.since`,
      original: condition.since,
      translated: translated.medicalHistory?.chronicConditions?.[index]?.since
    });
  });

  original.medicalHistory.continuousMedications.forEach((medication, index) => {
    pairs.push(
      {
        label: `medicalHistory.continuousMedications.${index}.name`,
        original: medication.name,
        translated: translated.medicalHistory?.continuousMedications?.[index]?.name
      },
      {
        label: `medicalHistory.continuousMedications.${index}.dosage`,
        original: medication.dosage,
        translated: translated.medicalHistory?.continuousMedications?.[index]?.dosage
      },
      {
        label: `medicalHistory.continuousMedications.${index}.startedAt`,
        original: medication.startedAt,
        translated: translated.medicalHistory?.continuousMedications?.[index]?.startedAt
      }
    );
  });

  original.medicalHistory.surgeriesHospitalizations.forEach((item, index) => {
    pairs.push({
      label: `medicalHistory.surgeriesHospitalizations.${index}.year`,
      original: item.year,
      translated: translated.medicalHistory?.surgeriesHospitalizations?.[index]?.year
    });
  });

  pairs.push({
    label: "medicalHistory.lastMedicalVisit.date",
    original: original.medicalHistory.lastMedicalVisit.date,
    translated: translated.medicalHistory?.lastMedicalVisit?.date
  });

  original.vaccines.forEach((vaccine, index) => {
    pairs.push({
      label: `vaccines.${index}.date`,
      original: vaccine.date,
      translated: translated.vaccines?.[index]?.date
    });
  });

  original.documents.forEach((document, index) => {
    pairs.push(
      {
        label: `documents.${index}.documentDate`,
        original: document.documentDate,
        translated: translated.documents?.[index]?.documentDate
      },
      {
        label: `documents.${index}.fileName`,
        original: document.fileName,
        translated: translated.documents?.[index]?.fileName
      }
    );
  });

  original.emergencyContacts.forEach((contact, index) => {
    pairs.push(
      {
        label: `emergencyContacts.${index}.name`,
        original: contact.name,
        translated: translated.emergencyContacts?.[index]?.name
      },
      {
        label: `emergencyContacts.${index}.phone`,
        original: contact.phone,
        translated: translated.emergencyContacts?.[index]?.phone
      }
    );
  });

  original.diaryEntries.forEach((entry, index) => {
    pairs.push(
      {
        label: `diaryEntries.${index}.dateTime`,
        original: entry.dateTime,
        translated: translated.diaryEntries?.[index]?.dateTime
      },
      {
        label: `diaryEntries.${index}.relatedMedication`,
        original: entry.relatedMedication,
        translated: translated.diaryEntries?.[index]?.relatedMedication
      }
    );
  });

  original.travelAlerts.forEach((alert, index) => {
    pairs.push({
      label: `travelAlerts.${index}.departureDate`,
      original: alert.departureDate,
      translated: translated.travelAlerts?.[index]?.departureDate
    });
  });

  return pairs;
}

function hasSameShape(
  original: PatientClinicalSummary,
  translated: PatientClinicalSummary
): boolean {
  return (
    Boolean(translated.profile) &&
    Boolean(translated.allergies) &&
    Boolean(translated.medicalHistory) &&
    Array.isArray(translated.allergies.medication) &&
    Array.isArray(translated.allergies.food) &&
    Array.isArray(translated.allergies.other) &&
    Array.isArray(translated.medicalHistory.chronicConditions) &&
    Array.isArray(translated.medicalHistory.continuousMedications) &&
    Array.isArray(translated.medicalHistory.surgeriesHospitalizations) &&
    Array.isArray(translated.vaccines) &&
    Array.isArray(translated.documents) &&
    Array.isArray(translated.emergencyContacts) &&
    Array.isArray(translated.diaryEntries) &&
    Array.isArray(translated.travelAlerts) &&
    original.allergies.medication.length === translated.allergies.medication.length &&
    original.allergies.food.length === translated.allergies.food.length &&
    original.allergies.other.length === translated.allergies.other.length &&
    original.medicalHistory.chronicConditions.length ===
      translated.medicalHistory.chronicConditions.length &&
    original.medicalHistory.continuousMedications.length ===
      translated.medicalHistory.continuousMedications.length &&
    original.medicalHistory.surgeriesHospitalizations.length ===
      translated.medicalHistory.surgeriesHospitalizations.length &&
    original.vaccines.length === translated.vaccines.length &&
    original.documents.length === translated.documents.length &&
    original.emergencyContacts.length === translated.emergencyContacts.length &&
    original.diaryEntries.length === translated.diaryEntries.length &&
    original.travelAlerts.length === translated.travelAlerts.length &&
    original.diaryEntries.every(
      (entry, index) => entry.tags.length === translated.diaryEntries[index]?.tags?.length
    ) &&
    original.travelAlerts.every((alert, index) => {
      const translatedAlert = translated.travelAlerts[index];

      return (
        alert.checklistItems.length === translatedAlert?.checklistItems?.length &&
        alert.medicationRestrictions.length ===
          translatedAlert?.medicationRestrictions?.length &&
        alert.localMedicalPhrases.length ===
          translatedAlert?.localMedicalPhrases?.length
      );
    })
  );
}

export function findGlossaryHits(
  original: PatientClinicalSummary,
  translated: PatientClinicalSummary,
  sourceLocale: Locale,
  targetLocale: Locale
): GlossaryHit[] {
  const originalText = flattenClinicalText(original);
  const translatedText = flattenClinicalText(translated);

  return medicalGlossary.flatMap((entry) => {
    const sourceTerms = entry.terms[sourceLocale];
    if (!textIncludesAnyTerm(originalText, sourceTerms)) return [];

    const expectedTerms = entry.terms[targetLocale];

    return [
      {
        key: entry.key,
        sourceTerm: sourceTerms[0],
        expectedTerms,
        foundExpectedTerm: textIncludesAnyTerm(translatedText, expectedTerms)
      }
    ];
  });
}

export function evaluateTranslation(
  original: PatientClinicalSummary,
  translated: PatientClinicalSummary,
  sourceLocale: Locale,
  targetLocale: Locale
): TranslationEvaluation {
  const warnings: TranslationWarning[] = [];
  const schemaValid = hasSameShape(original, translated);

  if (!schemaValid) {
    warnings.push({
      code: "schema_changed",
      message: "A estrutura do passaporte de saúde foi alterada."
    });
  }

  invariantPairs(original, translated).forEach((pair) => {
    if (pair.original !== pair.translated) {
      warnings.push({
        code: "invariant_changed",
        message: `Campo preservado alterado: ${pair.label}.`
      });
    }
  });

  const glossaryHits = findGlossaryHits(
    original,
    translated,
    sourceLocale,
    targetLocale
  );

  glossaryHits.forEach((hit) => {
    if (!hit.foundExpectedTerm) {
      warnings.push({
        code: "glossary_miss",
        message: `Termo crítico sem tradução esperada: ${hit.sourceTerm}.`
      });
    }
  });

  return {
    schemaValid:
      schemaValid && warnings.every((warning) => warning.code !== "invariant_changed"),
    warnings,
    glossaryHits
  };
}
