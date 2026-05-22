import type { PatientClinicalSummary } from "@/lib/types";
import type { PatientTranslationAdapter } from "@/lib/translation/adapters/shared";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

const stringField = { type: "string" };
const numberField = { type: "number" };
const booleanField = { type: "boolean" };
const stringArrayField = {
  type: "array",
  items: stringField
};

function arrayOf(items: Record<string, unknown>) {
  return {
    type: "array",
    items
  };
}

function objectSchema(
  required: string[],
  properties: Record<string, unknown>
): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    required,
    properties
  };
}

const allergySchema = objectSchema(
  ["substance", "reaction", "severity", "status", "recordedAt"],
  {
    substance: stringField,
    reaction: stringField,
    severity: stringField,
    status: stringField,
    recordedAt: stringField
  }
);

const conditionSchema = objectSchema(["name", "since", "status", "notes"], {
  name: stringField,
  since: stringField,
  status: stringField,
  notes: stringField
});

const medicationSchema = objectSchema(
  ["name", "dosage", "route", "frequency", "use", "startedAt", "instructions"],
  {
    name: stringField,
    dosage: stringField,
    route: stringField,
    frequency: stringField,
    use: stringField,
    startedAt: stringField,
    instructions: stringField
  }
);

const patientJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "name",
    "age",
    "sourceLocale",
    "lastUpdated",
    "profile",
    "allergies",
    "medicalHistory",
    "vaccines",
    "documents",
    "emergencyContacts",
    "diaryEntries",
    "travelAlerts"
  ],
  properties: {
    id: stringField,
    name: stringField,
    age: numberField,
    sourceLocale: { enum: ["pt-BR", "en-US", "es-ES"] },
    lastUpdated: stringField,
    profile: objectSchema(
      [
        "firstName",
        "lastName",
        "sex",
        "birthDate",
        "nationality",
        "passportNumber",
        "bloodType",
        "heightCm",
        "weightKg"
      ],
      {
        firstName: stringField,
        lastName: stringField,
        sex: stringField,
        birthDate: stringField,
        nationality: stringField,
        passportNumber: stringField,
        bloodType: stringField,
        heightCm: numberField,
        weightKg: numberField
      }
    ),
    allergies: objectSchema(
      [
        "medication",
        "food",
        "other",
        "noKnownAllergies",
        "severeReactionHistory"
      ],
      {
        medication: arrayOf(allergySchema),
        food: arrayOf(allergySchema),
        other: arrayOf(allergySchema),
        noKnownAllergies: booleanField,
        severeReactionHistory: objectSchema(
          ["hasSevereReaction", "description"],
          {
            hasSevereReaction: booleanField,
            description: stringField
          }
        )
      }
    ),
    medicalHistory: objectSchema(
      [
        "chronicConditions",
        "continuousMedications",
        "surgeriesHospitalizations",
        "familyHistory",
        "lastMedicalVisit",
        "healthHabits",
        "emergencyNotes"
      ],
      {
        chronicConditions: arrayOf(conditionSchema),
        continuousMedications: arrayOf(medicationSchema),
        surgeriesHospitalizations: arrayOf(
          objectSchema(["type", "reason", "year"], {
            type: stringField,
            reason: stringField,
            year: stringField
          })
        ),
        familyHistory: stringField,
        lastMedicalVisit: objectSchema(["date", "reason"], {
          date: stringField,
          reason: stringField
        }),
        healthHabits: objectSchema(["smoking", "alcohol", "exercise"], {
          smoking: stringField,
          alcohol: stringField,
          exercise: stringField
        }),
        emergencyNotes: stringField
      }
    ),
    vaccines: arrayOf(
      objectSchema(["name", "date", "dose", "status"], {
        name: stringField,
        date: stringField,
        dose: stringField,
        status: stringField
      })
    ),
    documents: arrayOf(
      objectSchema(
        ["title", "documentType", "documentDate", "fileName", "status", "summary"],
        {
          title: stringField,
          documentType: stringField,
          documentDate: stringField,
          fileName: stringField,
          status: stringField,
          summary: stringField
        }
      )
    ),
    emergencyContacts: arrayOf(
      objectSchema(["name", "relationship", "phone", "country"], {
        name: stringField,
        relationship: stringField,
        phone: stringField,
        country: stringField
      })
    ),
    diaryEntries: arrayOf(
      objectSchema(["dateTime", "note", "tags", "relatedMedication"], {
        dateTime: stringField,
        note: stringField,
        tags: stringArrayField,
        relatedMedication: stringField
      })
    ),
    travelAlerts: arrayOf(
      objectSchema(
        [
          "destination",
          "departureDate",
          "checklistItems",
          "medicationRestrictions",
          "localMedicalPhrases"
        ],
        {
          destination: stringField,
          departureDate: stringField,
          checklistItems: stringArrayField,
          medicationRestrictions: stringArrayField,
          localMedicalPhrases: stringArrayField
        }
      )
    )
  }
};

function extractOutputText(payload: OpenAIResponse): string | undefined {
  if (payload.output_text) return payload.output_text;

  return payload.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text)
    .find((text): text is string => Boolean(text));
}

export const translateWithOpenAI: PatientTranslationAdapter = async ({
  patient,
  sourceLocale,
  targetLocale
}) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurado.");
  }

  const model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5.2";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You translate synthetic health passport data. Return only valid JSON matching the provided schema. Preserve patient identity, dates, passport number, blood type, measurements, medication names, dosages, file names, phone numbers, contact names, array lengths, and boolean values. Translate clinical display text from the source locale to the target locale."
        },
        {
          role: "user",
          content: JSON.stringify({
            sourceLocale,
            targetLocale,
            patient
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "translated_patient_clinical_summary",
          schema: patientJsonSchema,
          strict: true
        }
      }
    })
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || "Falha na tradução via OpenAI.");
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI não retornou JSON traduzido.");
  }

  return JSON.parse(outputText) as PatientClinicalSummary;
};
