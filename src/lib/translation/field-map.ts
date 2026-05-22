import type { Allergy, PatientClinicalSummary, TextSegment } from "@/lib/types";

type AllergyGroup = "medication" | "food" | "other";

function segmentId(path: Array<string | number>): string {
  return path.join(".");
}

function pushSegment(
  segments: TextSegment[],
  path: Array<string | number>,
  label: string,
  value: string | undefined
) {
  if (!value?.trim()) return;

  segments.push({
    id: segmentId(path),
    path,
    label,
    text: value
  });
}

function pushStringArraySegments(
  segments: TextSegment[],
  values: string[],
  path: Array<string | number>,
  label: string
) {
  values.forEach((value, index) => {
    pushSegment(segments, [...path, index], `${label} ${index + 1}`, value);
  });
}

function pushAllergySegments(
  segments: TextSegment[],
  group: AllergyGroup,
  allergies: Allergy[]
) {
  allergies.forEach((allergy, index) => {
    const labelPrefix = `Alergia ${group} ${index + 1}`;

    pushSegment(
      segments,
      ["allergies", group, index, "substance"],
      `${labelPrefix}: substância`,
      allergy.substance
    );
    pushSegment(
      segments,
      ["allergies", group, index, "reaction"],
      `${labelPrefix}: reação`,
      allergy.reaction
    );
    pushSegment(
      segments,
      ["allergies", group, index, "severity"],
      `${labelPrefix}: gravidade`,
      allergy.severity
    );
    pushSegment(
      segments,
      ["allergies", group, index, "status"],
      `${labelPrefix}: status`,
      allergy.status
    );
  });
}

export function extractTranslatableSegments(
  patient: PatientClinicalSummary
): TextSegment[] {
  const segments: TextSegment[] = [];

  pushSegment(segments, ["profile", "sex"], "Perfil: sexo", patient.profile.sex);
  pushSegment(
    segments,
    ["profile", "nationality"],
    "Perfil: nacionalidade",
    patient.profile.nationality
  );

  pushAllergySegments(segments, "medication", patient.allergies.medication);
  pushAllergySegments(segments, "food", patient.allergies.food);
  pushAllergySegments(segments, "other", patient.allergies.other);
  pushSegment(
    segments,
    ["allergies", "severeReactionHistory", "description"],
    "Alergias: reação grave",
    patient.allergies.severeReactionHistory.description
  );

  patient.medicalHistory.chronicConditions.forEach((condition, index) => {
    pushSegment(
      segments,
      ["medicalHistory", "chronicConditions", index, "name"],
      `Doença ${index + 1}: nome`,
      condition.name
    );
    pushSegment(
      segments,
      ["medicalHistory", "chronicConditions", index, "status"],
      `Doença ${index + 1}: status`,
      condition.status
    );
    pushSegment(
      segments,
      ["medicalHistory", "chronicConditions", index, "notes"],
      `Doença ${index + 1}: notas`,
      condition.notes
    );
  });

  patient.medicalHistory.continuousMedications.forEach((medication, index) => {
    pushSegment(
      segments,
      ["medicalHistory", "continuousMedications", index, "route"],
      `Medicamento ${index + 1}: via`,
      medication.route
    );
    pushSegment(
      segments,
      ["medicalHistory", "continuousMedications", index, "frequency"],
      `Medicamento ${index + 1}: frequência`,
      medication.frequency
    );
    pushSegment(
      segments,
      ["medicalHistory", "continuousMedications", index, "use"],
      `Medicamento ${index + 1}: uso`,
      medication.use
    );
    pushSegment(
      segments,
      ["medicalHistory", "continuousMedications", index, "instructions"],
      `Medicamento ${index + 1}: instruções`,
      medication.instructions
    );
  });

  patient.medicalHistory.surgeriesHospitalizations.forEach((item, index) => {
    pushSegment(
      segments,
      ["medicalHistory", "surgeriesHospitalizations", index, "type"],
      `Cirurgia ${index + 1}: tipo`,
      item.type
    );
    pushSegment(
      segments,
      ["medicalHistory", "surgeriesHospitalizations", index, "reason"],
      `Cirurgia ${index + 1}: motivo`,
      item.reason
    );
  });

  pushSegment(
    segments,
    ["medicalHistory", "familyHistory"],
    "Histórico familiar",
    patient.medicalHistory.familyHistory
  );
  pushSegment(
    segments,
    ["medicalHistory", "lastMedicalVisit", "reason"],
    "Última consulta: motivo",
    patient.medicalHistory.lastMedicalVisit.reason
  );
  pushSegment(
    segments,
    ["medicalHistory", "healthHabits", "smoking"],
    "Hábitos: tabagismo",
    patient.medicalHistory.healthHabits.smoking
  );
  pushSegment(
    segments,
    ["medicalHistory", "healthHabits", "alcohol"],
    "Hábitos: álcool",
    patient.medicalHistory.healthHabits.alcohol
  );
  pushSegment(
    segments,
    ["medicalHistory", "healthHabits", "exercise"],
    "Hábitos: exercício",
    patient.medicalHistory.healthHabits.exercise
  );
  pushSegment(
    segments,
    ["medicalHistory", "emergencyNotes"],
    "Observações de emergência",
    patient.medicalHistory.emergencyNotes
  );

  patient.vaccines.forEach((vaccine, index) => {
    pushSegment(
      segments,
      ["vaccines", index, "name"],
      `Vacina ${index + 1}: nome`,
      vaccine.name
    );
    pushSegment(
      segments,
      ["vaccines", index, "dose"],
      `Vacina ${index + 1}: dose`,
      vaccine.dose
    );
    pushSegment(
      segments,
      ["vaccines", index, "status"],
      `Vacina ${index + 1}: status`,
      vaccine.status
    );
  });

  patient.documents.forEach((document, index) => {
    pushSegment(
      segments,
      ["documents", index, "title"],
      `Documento ${index + 1}: título`,
      document.title
    );
    pushSegment(
      segments,
      ["documents", index, "documentType"],
      `Documento ${index + 1}: tipo`,
      document.documentType
    );
    pushSegment(
      segments,
      ["documents", index, "status"],
      `Documento ${index + 1}: status`,
      document.status
    );
    pushSegment(
      segments,
      ["documents", index, "summary"],
      `Documento ${index + 1}: resumo`,
      document.summary
    );
  });

  patient.emergencyContacts.forEach((contact, index) => {
    pushSegment(
      segments,
      ["emergencyContacts", index, "relationship"],
      `Contato ${index + 1}: relação`,
      contact.relationship
    );
    pushSegment(
      segments,
      ["emergencyContacts", index, "country"],
      `Contato ${index + 1}: país`,
      contact.country
    );
  });

  patient.diaryEntries.forEach((entry, index) => {
    pushSegment(
      segments,
      ["diaryEntries", index, "note"],
      `Diário ${index + 1}: nota`,
      entry.note
    );
    pushStringArraySegments(
      segments,
      entry.tags,
      ["diaryEntries", index, "tags"],
      `Diário ${index + 1}: tag`
    );
  });

  patient.travelAlerts.forEach((alert, index) => {
    pushSegment(
      segments,
      ["travelAlerts", index, "destination"],
      `Alerta ${index + 1}: destino`,
      alert.destination
    );
    pushStringArraySegments(
      segments,
      alert.checklistItems,
      ["travelAlerts", index, "checklistItems"],
      `Alerta ${index + 1}: checklist`
    );
    pushStringArraySegments(
      segments,
      alert.medicationRestrictions,
      ["travelAlerts", index, "medicationRestrictions"],
      `Alerta ${index + 1}: restrição`
    );
    pushStringArraySegments(
      segments,
      alert.localMedicalPhrases,
      ["travelAlerts", index, "localMedicalPhrases"],
      `Alerta ${index + 1}: frase médica`
    );
  });

  return segments;
}

function clonePatient(patient: PatientClinicalSummary): PatientClinicalSummary {
  return JSON.parse(JSON.stringify(patient)) as PatientClinicalSummary;
}

function setValueAtPath(
  target: PatientClinicalSummary,
  path: Array<string | number>,
  value: string
) {
  let cursor: unknown = target;

  for (let index = 0; index < path.length - 1; index += 1) {
    if (typeof cursor !== "object" || cursor === null) {
      throw new Error(`Invalid segment path: ${path.join(".")}`);
    }

    cursor = (cursor as Record<string, unknown>)[String(path[index])];
  }

  if (typeof cursor !== "object" || cursor === null) {
    throw new Error(`Invalid segment path: ${path.join(".")}`);
  }

  (cursor as Record<string, string>)[String(path[path.length - 1])] = value;
}

export function applyTranslatedSegments(
  patient: PatientClinicalSummary,
  translatedSegments: TextSegment[],
  targetLocale?: PatientClinicalSummary["sourceLocale"]
): PatientClinicalSummary {
  const translatedPatient = clonePatient(patient);
  const knownSegments = new Map(
    extractTranslatableSegments(patient).map((segment) => [segment.id, segment])
  );

  translatedSegments.forEach((segment) => {
    const originalSegment = knownSegments.get(segment.id);
    if (!originalSegment) {
      throw new Error(`Unknown translated segment: ${segment.id}`);
    }

    setValueAtPath(translatedPatient, originalSegment.path, segment.text);
  });

  if (targetLocale) {
    translatedPatient.sourceLocale = targetLocale;
  }

  return translatedPatient;
}
