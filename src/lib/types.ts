export type Locale = "pt-BR" | "en-US" | "es-ES";

export type TranslationProvider =
  | "google"
  | "openai"
  | "libretranslate";

export type PatientProfile = {
  firstName: string;
  lastName: string;
  sex: string;
  birthDate: string;
  nationality: string;
  passportNumber: string;
  bloodType: string;
  heightCm?: number;
  weightKg?: number;
  photoUrl?: string;
};

export type Allergy = {
  substance: string;
  reaction: string;
  severity: string;
  status: string;
  recordedAt: string;
};

export type AllergyPassportSection = {
  medication: Allergy[];
  food: Allergy[];
  other: Allergy[];
  noKnownAllergies: boolean;
  severeReactionHistory: {
    hasSevereReaction: boolean;
    description: string;
  };
};

export type ChronicCondition = {
  name: string;
  since: string;
  status: string;
  notes: string;
};

export type Medication = {
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  use: string;
  startedAt: string;
  instructions: string;
};

export type SurgeryHospitalization = {
  type: string;
  reason: string;
  year: string;
};

export type LastMedicalVisit = {
  date: string;
  reason: string;
};

export type HealthHabits = {
  smoking: string;
  alcohol: string;
  exercise: string;
};

export type MedicalHistory = {
  chronicConditions: ChronicCondition[];
  continuousMedications: Medication[];
  surgeriesHospitalizations: SurgeryHospitalization[];
  familyHistory: string;
  lastMedicalVisit: LastMedicalVisit;
  healthHabits: HealthHabits;
  emergencyNotes: string;
};

export type Vaccine = {
  name: string;
  date: string;
  dose: string;
  status: string;
};

export type MedicalDocument = {
  title: string;
  documentType: string;
  documentDate: string;
  fileName: string;
  status: string;
  summary: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  country: string;
};

export type HealthDiaryEntry = {
  dateTime: string;
  note: string;
  tags: string[];
  relatedMedication: string;
};

export type TravelAlert = {
  destination: string;
  departureDate: string;
  checklistItems: string[];
  medicationRestrictions: string[];
  localMedicalPhrases: string[];
};

export type PatientClinicalSummary = {
  id: string;
  name: string;
  age: number;
  sourceLocale: Locale;
  lastUpdated: string;
  profile: PatientProfile;
  allergies: AllergyPassportSection;
  medicalHistory: MedicalHistory;
  vaccines: Vaccine[];
  documents: MedicalDocument[];
  emergencyContacts: EmergencyContact[];
  diaryEntries: HealthDiaryEntry[];
  travelAlerts: TravelAlert[];
};

export type TextSegment = {
  id: string;
  path: Array<string | number>;
  label: string;
  text: string;
};

export type GlossaryHit = {
  key: string;
  sourceTerm: string;
  expectedTerms: string[];
  foundExpectedTerm: boolean;
};

export type TranslationWarning = {
  code:
    | "schema_changed"
    | "invariant_changed"
    | "glossary_miss"
    | "provider_unconfigured"
    | "provider_error"
    | "timeout";
  message: string;
};

export type TranslationResult = {
  provider: TranslationProvider;
  translatedPatient: PatientClinicalSummary | null;
  latencyMs: number;
  warnings: TranslationWarning[];
  glossaryHits: GlossaryHit[];
  schemaValid: boolean;
  error?: string;
};

export type ProviderStatus = {
  provider: TranslationProvider;
  label: string;
  configured: boolean;
  missingConfig: string[];
  detail: string;
};

export type TranslateRequestBody = {
  patient: PatientClinicalSummary;
  sourceLocale: Locale;
  targetLocale: Locale;
  providers: TranslationProvider[];
};
