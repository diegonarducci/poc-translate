import { isLocale } from "@/lib/locales";
import { PROVIDERS } from "@/lib/translation/provider-config";
import { translatePatientForProviders } from "@/lib/translation/service";
import type {
  PatientClinicalSummary,
  TranslateRequestBody,
  TranslationProvider
} from "@/lib/types";

export const runtime = "nodejs";

function isProvider(value: unknown): value is TranslationProvider {
  return typeof value === "string" && PROVIDERS.includes(value as TranslationProvider);
}

function isPatientClinicalSummary(value: unknown): value is PatientClinicalSummary {
  if (!value || typeof value !== "object") return false;
  const patient = value as Partial<PatientClinicalSummary>;

  return (
    typeof patient.id === "string" &&
    typeof patient.name === "string" &&
    typeof patient.age === "number" &&
    isLocale(patient.sourceLocale) &&
    Boolean(patient.profile) &&
    Boolean(patient.allergies) &&
    Boolean(patient.medicalHistory) &&
    Array.isArray(patient.allergies?.medication) &&
    Array.isArray(patient.allergies?.food) &&
    Array.isArray(patient.allergies?.other) &&
    Array.isArray(patient.medicalHistory?.chronicConditions) &&
    Array.isArray(patient.medicalHistory?.continuousMedications) &&
    Array.isArray(patient.medicalHistory?.surgeriesHospitalizations) &&
    Array.isArray(patient.vaccines) &&
    Array.isArray(patient.documents) &&
    Array.isArray(patient.emergencyContacts) &&
    Array.isArray(patient.diaryEntries) &&
    Array.isArray(patient.travelAlerts)
  );
}

function parseBody(value: unknown): TranslateRequestBody {
  if (!value || typeof value !== "object") {
    throw new Error("Payload inválido.");
  }

  const body = value as Partial<TranslateRequestBody>;

  if (!isPatientClinicalSummary(body.patient)) {
    throw new Error("Paciente inválido.");
  }

  if (!isLocale(body.sourceLocale) || !isLocale(body.targetLocale)) {
    throw new Error("Idioma inválido.");
  }

  if (!Array.isArray(body.providers) || !body.providers.every(isProvider)) {
    throw new Error("Lista de provedores inválida.");
  }

  if (body.providers.length === 0) {
    throw new Error("Selecione pelo menos um provedor.");
  }

  return {
    patient: body.patient,
    sourceLocale: body.sourceLocale,
    targetLocale: body.targetLocale,
    providers: body.providers
  };
}

export async function POST(request: Request) {
  try {
    const body = parseBody(await request.json());
    const results = await translatePatientForProviders(body);

    return Response.json({
      requestId: crypto.randomUUID(),
      results
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Falha ao traduzir."
      },
      { status: 400 }
    );
  }
}
