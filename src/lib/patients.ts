import type { PatientClinicalSummary } from "@/lib/types";

export const samplePatients: PatientClinicalSummary[] = [
  {
    id: "PAC-001",
    name: "Marina Alves",
    age: 58,
    sourceLocale: "pt-BR",
    lastUpdated: "2026-05-12",
    profile: {
      firstName: "Marina",
      lastName: "Alves",
      sex: "feminino",
      birthDate: "1968-02-19",
      nationality: "brasileira",
      passportNumber: "YA123456",
      bloodType: "O+",
      heightCm: 164,
      weightKg: 72
    },
    allergies: {
      medication: [
        {
          substance: "Penicilina",
          reaction: "urticária intensa e falta de ar",
          severity: "grave",
          status: "ativa",
          recordedAt: "2018-09-14"
        },
        {
          substance: "Dipirona",
          reaction: "queda de pressão e náuseas",
          severity: "moderada",
          status: "ativa",
          recordedAt: "2021-03-02"
        }
      ],
      food: [
        {
          substance: "Frutos do mar",
          reaction: "inchaço nos lábios",
          severity: "moderada",
          status: "ativa",
          recordedAt: "2024-01-18"
        }
      ],
      other: [],
      noKnownAllergies: false,
      severeReactionHistory: {
        hasSevereReaction: true,
        description: "Teve falta de ar após uso de penicilina e precisou de atendimento."
      }
    },
    medicalHistory: {
      chronicConditions: [
        {
          name: "Hipertensão arterial sistêmica",
          since: "2015",
          status: "controlada",
          notes: "Mantém pressão em torno de 130/80 mmHg com uso contínuo."
        },
        {
          name: "Diabetes mellitus tipo 2",
          since: "2019",
          status: "em acompanhamento",
          notes: "Hemoglobina glicada de 7,1% no último exame."
        }
      ],
      continuousMedications: [
        {
          name: "Losartana",
          dosage: "50 mg",
          route: "via oral",
          frequency: "1 comprimido a cada 12 horas",
          use: "uso contínuo",
          startedAt: "2015-11-20",
          instructions: "Tomar pela manhã e à noite, mesmo sem sintomas."
        },
        {
          name: "Metformina",
          dosage: "850 mg",
          route: "via oral",
          frequency: "1 comprimido após o jantar",
          use: "uso contínuo",
          startedAt: "2019-04-10",
          instructions: "Tomar após refeição para reduzir desconforto gástrico."
        }
      ],
      surgeriesHospitalizations: [
        {
          type: "Colecistectomia",
          reason: "retirada da vesícula por cálculo biliar",
          year: "2012"
        }
      ],
      familyHistory: "Pai com infarto aos 62 anos e mãe com diabetes tipo 2.",
      lastMedicalVisit: {
        date: "2026-05-10",
        reason: "consulta de rotina para controle de hipertensão"
      },
      healthHabits: {
        smoking: "nunca fumou",
        alcohol: "social",
        exercise: "leve"
      },
      emergencyNotes:
        "Paciente viaja para os Estados Unidos em junho e solicitou resumo clínico em inglês."
    },
    vaccines: [
      {
        name: "Hepatite A",
        date: "2025-11-20",
        dose: "1ª dose",
        status: "segunda dose pendente"
      },
      {
        name: "Febre amarela",
        date: "2022-03-04",
        dose: "dose única",
        status: "válida"
      }
    ],
    documents: [
      {
        title: "Exame de hemoglobina glicada",
        documentType: "exame de sangue",
        documentDate: "2026-04-30",
        fileName: "hemoglobina-glicada-2026.pdf",
        status: "traduzido",
        summary: "Resultado de hemoglobina glicada em 7,1%, com recomendação de controle alimentar."
      },
      {
        title: "Prescrição de uso contínuo",
        documentType: "prescrição",
        documentDate: "2026-05-10",
        fileName: "prescricao-cardio.pdf",
        status: "original",
        summary: "Lista medicações de uso contínuo e orientação para manter horários regulares."
      }
    ],
    emergencyContacts: [
      {
        name: "Carlos Alves",
        relationship: "filho",
        phone: "+55 11 99999-0101",
        country: "Brasil"
      }
    ],
    diaryEntries: [
      {
        dateTime: "2026-05-11T08:30:00-03:00",
        note: "Sentiu leve tontura ao levantar após tomar losartana pela manhã.",
        tags: ["sintoma", "medicamento"],
        relatedMedication: "Losartana"
      }
    ],
    travelAlerts: [
      {
        destination: "Estados Unidos",
        departureDate: "2026-06-14",
        checklistItems: [
          "Levar medicação para 20 dias de viagem",
          "Carregar lista de alergias em local acessível"
        ],
        medicationRestrictions: [
          "Confirmar regras de transporte de metformina na bagagem de mão"
        ],
        localMedicalPhrases: [
          "Tenho alergia grave a penicilina",
          "Tenho diabetes tipo 2"
        ]
      }
    ]
  },
  {
    id: "PAC-002",
    name: "Roberto Nogueira",
    age: 42,
    sourceLocale: "pt-BR",
    lastUpdated: "2026-04-26",
    profile: {
      firstName: "Roberto",
      lastName: "Nogueira",
      sex: "masculino",
      birthDate: "1984-10-08",
      nationality: "brasileira",
      passportNumber: "YB654321",
      bloodType: "A+",
      heightCm: 178,
      weightKg: 84
    },
    allergies: {
      medication: [
        {
          substance: "Ibuprofeno",
          reaction: "broncoespasmo",
          severity: "grave",
          status: "ativa",
          recordedAt: "2020-08-18"
        }
      ],
      food: [],
      other: [
        {
          substance: "Poeira doméstica",
          reaction: "chiado no peito e tosse",
          severity: "moderada",
          status: "ativa",
          recordedAt: "2012-05-12"
        }
      ],
      noKnownAllergies: false,
      severeReactionHistory: {
        hasSevereReaction: true,
        description: "Teve crise de asma após uso de anti-inflamatório."
      }
    },
    medicalHistory: {
      chronicConditions: [
        {
          name: "Asma persistente moderada",
          since: "2007",
          status: "parcialmente controlada",
          notes: "Crises desencadeadas por anti-inflamatórios e poeira doméstica."
        },
        {
          name: "Rinite alérgica",
          since: "2012",
          status: "sazonal",
          notes: "Piora no outono, com espirros e obstrução nasal."
        }
      ],
      continuousMedications: [
        {
          name: "Budesonida + Formoterol",
          dosage: "200/6 mcg",
          route: "inalatória",
          frequency: "2 jatos a cada 12 horas",
          use: "uso contínuo",
          startedAt: "2023-02-05",
          instructions: "Enxaguar a boca após o uso do inalador."
        },
        {
          name: "Salbutamol",
          dosage: "100 mcg",
          route: "inalatória",
          frequency: "2 jatos se falta de ar",
          use: "resgate",
          startedAt: "2020-09-01",
          instructions: "Procurar atendimento se precisar usar mais de 3 vezes no dia."
        }
      ],
      surgeriesHospitalizations: [],
      familyHistory: "Irmão com asma e mãe com rinite alérgica.",
      lastMedicalVisit: {
        date: "2026-04-20",
        reason: "reavaliação de asma após crise recente"
      },
      healthHabits: {
        smoking: "fumava",
        alcohol: "não consome",
        exercise: "moderado"
      },
      emergencyNotes:
        "Paciente pretende viajar para Madrid e precisa de resumo em espanhol."
    },
    vaccines: [
      {
        name: "Influenza",
        date: "2026-03-10",
        dose: "dose anual",
        status: "válida"
      }
    ],
    documents: [
      {
        title: "Laudo de função pulmonar",
        documentType: "laudo",
        documentDate: "2026-04-20",
        fileName: "funcao-pulmonar.pdf",
        status: "processando",
        summary: "Espirometria compatível com asma parcialmente controlada."
      }
    ],
    emergencyContacts: [
      {
        name: "Luciana Nogueira",
        relationship: "esposa",
        phone: "+55 21 98888-0202",
        country: "Brasil"
      }
    ],
    diaryEntries: [
      {
        dateTime: "2026-04-18T20:15:00-03:00",
        note: "Apresentou chiado no peito após exposição a mofo em quarto de hotel.",
        tags: ["sintoma", "viagem"],
        relatedMedication: "Salbutamol"
      }
    ],
    travelAlerts: [
      {
        destination: "Espanha",
        departureDate: "2026-06-02",
        checklistItems: [
          "Levar inalador reserva",
          "Evitar anti-inflamatórios sem orientação médica"
        ],
        medicationRestrictions: [
          "Manter receita do inalador junto com os medicamentos"
        ],
        localMedicalPhrases: [
          "Tenho asma",
          "Sou alérgico a ibuprofeno"
        ]
      }
    ]
  },
  {
    id: "PAC-003",
    name: "Helena Costa",
    age: 71,
    sourceLocale: "pt-BR",
    lastUpdated: "2026-05-01",
    profile: {
      firstName: "Helena",
      lastName: "Costa",
      sex: "feminino",
      birthDate: "1955-07-04",
      nationality: "brasileira",
      passportNumber: "",
      bloodType: "Não sei",
      heightCm: 158,
      weightKg: 68
    },
    allergies: {
      medication: [],
      food: [],
      other: [
        {
          substance: "Látex",
          reaction: "vermelhidão e coceira na pele",
          severity: "leve",
          status: "ativa",
          recordedAt: "2016-01-30"
        }
      ],
      noKnownAllergies: false,
      severeReactionHistory: {
        hasSevereReaction: false,
        description: ""
      }
    },
    medicalHistory: {
      chronicConditions: [
        {
          name: "Doença renal crônica estágio 3",
          since: "2022",
          status: "estável",
          notes: "Evitar medicamentos nefrotóxicos e ajustar dose conforme função renal."
        },
        {
          name: "Osteoartrose de joelhos",
          since: "2018",
          status: "sintomática",
          notes: "Dor ao subir escadas, melhora parcial com fisioterapia."
        }
      ],
      continuousMedications: [
        {
          name: "Colecalciferol",
          dosage: "7000 UI",
          route: "via oral",
          frequency: "1 cápsula por semana",
          use: "uso contínuo",
          startedAt: "2022-07-17",
          instructions: "Tomar sempre no mesmo dia da semana."
        }
      ],
      surgeriesHospitalizations: [
        {
          type: "Artroplastia de quadril",
          reason: "fratura após queda",
          year: "2020"
        }
      ],
      familyHistory: "Sem histórico familiar relevante informado.",
      lastMedicalVisit: {
        date: "2026-04-28",
        reason: "acompanhamento de doença renal crônica"
      },
      healthHabits: {
        smoking: "nunca fumou",
        alcohol: "não consome",
        exercise: "leve"
      },
      emergencyNotes:
        "Paciente usa bengala para longas distâncias. Preferir comunicação clara, com frases curtas."
    },
    vaccines: [
      {
        name: "COVID-19",
        date: "2025-12-03",
        dose: "reforço",
        status: "válida"
      }
    ],
    documents: [
      {
        title: "Relatório de nefrologia",
        documentType: "consulta",
        documentDate: "2026-04-28",
        fileName: "nefrologia-helena.pdf",
        status: "original",
        summary: "Creatinina estável e sem edema em membros inferiores."
      }
    ],
    emergencyContacts: [
      {
        name: "Marta Costa",
        relationship: "filha",
        phone: "+55 31 97777-0303",
        country: "Brasil"
      }
    ],
    diaryEntries: [
      {
        dateTime: "2026-04-29T10:00:00-03:00",
        note: "Relatou dor leve no joelho ao subir escadas.",
        tags: ["sintoma", "mobilidade"],
        relatedMedication: ""
      }
    ],
    travelAlerts: [
      {
        destination: "Portugal",
        departureDate: "2026-08-18",
        checklistItems: [
          "Levar relatório de função renal",
          "Evitar automedicação durante a viagem"
        ],
        medicationRestrictions: [],
        localMedicalPhrases: [
          "Tenho doença renal crônica",
          "Tenho alergia a látex"
        ]
      }
    ]
  }
];

export function findSamplePatient(id: string): PatientClinicalSummary | undefined {
  return samplePatients.find((patient) => patient.id === id);
}
