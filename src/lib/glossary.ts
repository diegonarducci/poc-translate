import type { Locale } from "@/lib/types";

export type GlossaryEntry = {
  key: string;
  critical: boolean;
  terms: Record<Locale, string[]>;
};

export const medicalGlossary: GlossaryEntry[] = [
  {
    key: "alergia",
    critical: true,
    terms: {
      "pt-BR": ["alergia", "alergias"],
      "en-US": ["allergy", "allergies"],
      "es-ES": ["alergia", "alergias"]
    }
  },
  {
    key: "penicilina",
    critical: true,
    terms: {
      "pt-BR": ["penicilina"],
      "en-US": ["penicillin"],
      "es-ES": ["penicilina"]
    }
  },
  {
    key: "dipirona",
    critical: true,
    terms: {
      "pt-BR": ["dipirona", "metamizol"],
      "en-US": ["dipyrone", "metamizole"],
      "es-ES": ["dipirona", "metamizol"]
    }
  },
  {
    key: "hipertensao",
    critical: true,
    terms: {
      "pt-BR": ["hipertensão arterial", "hipertensão"],
      "en-US": ["hypertension", "high blood pressure", "arterial hypertension"],
      "es-ES": ["hipertensión arterial", "hipertensión"]
    }
  },
  {
    key: "diabetes_tipo_2",
    critical: true,
    terms: {
      "pt-BR": ["diabetes mellitus tipo 2", "diabetes tipo 2"],
      "en-US": ["type 2 diabetes mellitus", "type 2 diabetes"],
      "es-ES": ["diabetes mellitus tipo 2", "diabetes tipo 2"]
    }
  },
  {
    key: "asma",
    critical: true,
    terms: {
      "pt-BR": ["asma"],
      "en-US": ["asthma"],
      "es-ES": ["asma"]
    }
  },
  {
    key: "dose",
    critical: true,
    terms: {
      "pt-BR": ["dose", "dosagem"],
      "en-US": ["dose", "dosage"],
      "es-ES": ["dosis", "dosificación"]
    }
  },
  {
    key: "consulta",
    critical: false,
    terms: {
      "pt-BR": ["consulta", "atendimento"],
      "en-US": ["appointment", "visit", "consultation"],
      "es-ES": ["consulta", "visita"]
    }
  },
  {
    key: "uso_continuo",
    critical: true,
    terms: {
      "pt-BR": ["uso contínuo", "uso continuo"],
      "en-US": ["continuous use", "long-term use", "ongoing use"],
      "es-ES": ["uso continuo", "tratamiento continuo"]
    }
  }
];

export function normalizeMedicalText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function textIncludesAnyTerm(text: string, terms: string[]): boolean {
  const normalizedText = normalizeMedicalText(text);
  return terms.some((term) => normalizedText.includes(normalizeMedicalText(term)));
}
