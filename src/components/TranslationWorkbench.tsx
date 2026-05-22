"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Languages,
  LoaderCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Stethoscope,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LOCALES } from "@/lib/locales";
import {
  listPatientsFromFirestore,
  savePatientToFirestore
} from "@/lib/patient-repository";
import { PROVIDER_LABELS, PROVIDERS } from "@/lib/translation/provider-config";
import type {
  Locale,
  PatientClinicalSummary,
  ProviderStatus,
  TranslationProvider,
  TranslationResult
} from "@/lib/types";

type ProvidersResponse = {
  providers: ProviderStatus[];
};

type TranslateResponse = {
  results?: TranslationResult[];
  error?: string;
};

type Props = {
  patients: PatientClinicalSummary[];
};

type NewPatientFormState = {
  name: string;
  age: string;
  sourceLocale: Locale;
};

type PersistenceStatus = "ready" | "disabled" | "syncing" | "error";

function isLocale(value: unknown): value is Locale {
  return value === "pt-BR" || value === "en-US" || value === "es-ES";
}

function isPatientClinicalSummary(value: unknown): value is PatientClinicalSummary {
  if (!value || typeof value !== "object") return false;

  const patient = value as Partial<PatientClinicalSummary>;
  return (
    typeof patient.id === "string" &&
    typeof patient.name === "string" &&
    typeof patient.age === "number" &&
    isLocale(patient.sourceLocale) &&
    typeof patient.lastUpdated === "string" &&
    Boolean(patient.profile) &&
    Boolean(patient.allergies) &&
    Boolean(patient.medicalHistory) &&
    Array.isArray(patient.vaccines) &&
    Array.isArray(patient.documents) &&
    Array.isArray(patient.emergencyContacts) &&
    Array.isArray(patient.diaryEntries) &&
    Array.isArray(patient.travelAlerts)
  );
}

function allAllergies(patient: PatientClinicalSummary) {
  return [
    ...patient.allergies.medication,
    ...patient.allergies.food,
    ...patient.allergies.other
  ];
}

function chooseDefaultTarget(sourceLocale: Locale): Locale {
  return sourceLocale === "en-US" ? "pt-BR" : "en-US";
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "Paciente", lastName: "Teste" };

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "Teste" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function nextPatientId(existingPatients: PatientClinicalSummary[]): string {
  const maxNumericId = existingPatients.reduce((max, patient) => {
    const match = /^PAC-(\d+)$/.exec(patient.id);
    if (!match) return max;
    const value = Number.parseInt(match[1], 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);

  return `PAC-${String(maxNumericId + 1).padStart(3, "0")}`;
}

function buildPatientFromTemplate(
  template: PatientClinicalSummary,
  form: NewPatientFormState,
  existingPatients: PatientClinicalSummary[]
): PatientClinicalSummary {
  const id = nextPatientId(existingPatients);
  const age = Math.max(1, Number.parseInt(form.age, 10) || template.age);
  const { firstName, lastName } = splitName(form.name);
  const nowIso = new Date().toISOString().slice(0, 10);
  const clone = structuredClone(template);

  clone.id = id;
  clone.name = form.name.trim();
  clone.age = age;
  clone.sourceLocale = form.sourceLocale;
  clone.lastUpdated = nowIso;
  clone.profile.firstName = firstName;
  clone.profile.lastName = lastName;
  clone.documents = clone.documents.map((document) => ({
    ...document,
    fileName: `${id.toLowerCase()}-${document.fileName}`
  }));

  return clone;
}

function formatWarnings(result: TranslationResult): string[] {
  if (result.error) return [result.error, ...result.warnings.map((warning) => warning.message)];
  return result.warnings.map((warning) => warning.message);
}

function ProviderIcon({ provider }: { provider: TranslationProvider }) {
  if (provider === "libretranslate") return <Server size={17} />;
  if (provider === "openai") return <Stethoscope size={17} />;
  return <Languages size={17} />;
}

function ClinicalSummary({ patient }: { patient: PatientClinicalSummary }) {
  const allergies = allAllergies(patient);

  return (
    <div className="source-grid">
      <div className="clinical-block">
        <h3>Alergias</h3>
        {allergies.map((allergy) => (
          <p key={`${allergy.substance}-${allergy.recordedAt}`}>
            <strong>{allergy.substance}</strong>: {allergy.reaction} ({allergy.severity})
          </p>
        ))}
        {patient.allergies.severeReactionHistory.description && (
          <p>{patient.allergies.severeReactionHistory.description}</p>
        )}
      </div>
      <div className="clinical-block">
        <h3>Perfil e emergência</h3>
        <p>
          <strong>{patient.profile.bloodType}</strong> · {patient.profile.sex} ·{" "}
          {patient.profile.nationality}
        </p>
        {patient.emergencyContacts.map((contact) => (
          <p key={contact.phone}>
            <strong>{contact.relationship}</strong>: {contact.name}, {contact.phone}
          </p>
        ))}
      </div>
      <div className="clinical-block">
        <h3>Histórico médico</h3>
        {patient.medicalHistory.chronicConditions.map((condition) => (
          <p key={condition.name}>
            <strong>{condition.name}</strong>: {condition.status}. {condition.notes}
          </p>
        ))}
        <p>{patient.medicalHistory.familyHistory}</p>
        <p>{patient.medicalHistory.emergencyNotes}</p>
      </div>
      <div className="clinical-block">
        <h3>Medicamentos</h3>
        {patient.medicalHistory.continuousMedications.map((medication) => (
          <p key={medication.name}>
            <strong>{medication.name}</strong> {medication.dosage}, {medication.route},{" "}
            {medication.frequency}. {medication.instructions}
          </p>
        ))}
      </div>
      <div className="clinical-block">
        <h3>Consultas, cirurgias e hábitos</h3>
        <p>
          <strong>{patient.medicalHistory.lastMedicalVisit.date}</strong>:{" "}
          {patient.medicalHistory.lastMedicalVisit.reason}
        </p>
        {patient.medicalHistory.surgeriesHospitalizations.map((item) => (
          <p key={`${item.type}-${item.year}`}>
            <strong>{item.year}</strong> {item.type}: {item.reason}
          </p>
        ))}
        <p>
          {patient.medicalHistory.healthHabits.smoking};{" "}
          {patient.medicalHistory.healthHabits.alcohol};{" "}
          {patient.medicalHistory.healthHabits.exercise}
        </p>
      </div>
      <div className="clinical-block">
        <h3>Documentos, vacinas e viagem</h3>
        {patient.vaccines.map((vaccine) => (
          <p key={`${vaccine.name}-${vaccine.date}`}>
            <strong>{vaccine.name}</strong>: {vaccine.dose}, {vaccine.status}
          </p>
        ))}
        {patient.documents.map((document) => (
          <p key={document.fileName}>
            <strong>{document.title}</strong>: {document.summary}
          </p>
        ))}
        {patient.travelAlerts.map((alert) => (
          <p key={`${alert.destination}-${alert.departureDate}`}>
            <strong>{alert.destination}</strong>: {alert.checklistItems.join("; ")}
          </p>
        ))}
        {patient.diaryEntries.map((entry) => (
          <p key={entry.dateTime}>{entry.note}</p>
        ))}
      </div>
    </div>
  );
}

function TranslatedPatient({ patient }: { patient: PatientClinicalSummary }) {
  const allergies = allAllergies(patient);

  return (
    <div className="translated-grid">
      <div className="translation-section">
        <h4>Allergies</h4>
        {allergies.map((allergy) => (
          <p key={`${allergy.substance}-${allergy.recordedAt}`}>
            <strong>{allergy.substance}</strong>: {allergy.reaction} ({allergy.severity})
          </p>
        ))}
        {patient.allergies.severeReactionHistory.description && (
          <p>{patient.allergies.severeReactionHistory.description}</p>
        )}
      </div>
      <div className="translation-section">
        <h4>Profile</h4>
        <p>
          <strong>{patient.profile.bloodType}</strong> · {patient.profile.sex} ·{" "}
          {patient.profile.nationality}
        </p>
        {patient.emergencyContacts.map((contact) => (
          <p key={contact.phone}>
            <strong>{contact.relationship}</strong>: {contact.name}, {contact.phone}
          </p>
        ))}
      </div>
      <div className="translation-section">
        <h4>Medical history</h4>
        {patient.medicalHistory.chronicConditions.map((condition) => (
          <p key={condition.name}>
            <strong>{condition.name}</strong>: {condition.status}. {condition.notes}
          </p>
        ))}
        <p>{patient.medicalHistory.familyHistory}</p>
        <p>{patient.medicalHistory.emergencyNotes}</p>
      </div>
      <div className="translation-section">
        <h4>Medications</h4>
        {patient.medicalHistory.continuousMedications.map((medication) => (
          <p key={medication.name}>
            <strong>{medication.name}</strong> {medication.dosage}, {medication.route},{" "}
            {medication.frequency}. {medication.instructions}
          </p>
        ))}
      </div>
      <div className="translation-section">
        <h4>Visits and habits</h4>
        <p>
          <strong>{patient.medicalHistory.lastMedicalVisit.date}</strong>:{" "}
          {patient.medicalHistory.lastMedicalVisit.reason}
        </p>
        {patient.medicalHistory.surgeriesHospitalizations.map((item) => (
          <p key={`${item.type}-${item.year}`}>
            <strong>{item.year}</strong> {item.type}: {item.reason}
          </p>
        ))}
        <p>
          {patient.medicalHistory.healthHabits.smoking};{" "}
          {patient.medicalHistory.healthHabits.alcohol};{" "}
          {patient.medicalHistory.healthHabits.exercise}
        </p>
      </div>
      <div className="translation-section">
        <h4>Documents and travel</h4>
        {patient.vaccines.map((vaccine) => (
          <p key={`${vaccine.name}-${vaccine.date}`}>
            <strong>{vaccine.name}</strong>: {vaccine.dose}, {vaccine.status}
          </p>
        ))}
        {patient.documents.map((document) => (
          <p key={document.fileName}>
            <strong>{document.title}</strong>: {document.summary}
          </p>
        ))}
        {patient.travelAlerts.map((alert) => (
          <p key={`${alert.destination}-${alert.departureDate}`}>
            <strong>{alert.destination}</strong>: {alert.checklistItems.join("; ")}
          </p>
        ))}
        {patient.diaryEntries.map((entry) => (
          <p key={entry.dateTime}>{entry.note}</p>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: TranslationResult }) {
  const warnings = formatWarnings(result);

  return (
    <article className="result-card">
      <header className="result-header">
        <div>
          <div className="result-title">
            <ProviderIcon provider={result.provider} />
            {PROVIDER_LABELS[result.provider]}
          </div>
          <div className="metric-row">
            <Clock3 size={14} />
            {result.latencyMs} ms
          </div>
        </div>
        {result.error ? (
          <span className="chip error">
            <XCircle size={14} /> erro
          </span>
        ) : result.schemaValid ? (
          <span className="chip ok">
            <CheckCircle2 size={14} /> schema ok
          </span>
        ) : (
          <span className="chip warn">
            <AlertTriangle size={14} /> revisar
          </span>
        )}
      </header>
      <div className="result-body">
        {warnings.length > 0 && (
          <ul className="warning-list" aria-label={`Alertas ${PROVIDER_LABELS[result.provider]}`}>
            {warnings.map((warning) => (
              <li key={warning}>
                <AlertTriangle size={15} />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        )}

        {result.glossaryHits.length > 0 && (
          <div className="glossary-table" aria-label={`Glossário ${PROVIDER_LABELS[result.provider]}`}>
            {result.glossaryHits.map((hit) => (
              <div className="glossary-row" key={hit.key}>
                <strong>{hit.sourceTerm}</strong>
                <span>{hit.expectedTerms.join(", ")}</span>
                {hit.foundExpectedTerm ? (
                  <span className="chip ok">
                    <CheckCircle2 size={13} /> ok
                  </span>
                ) : (
                  <span className="chip warn">
                    <AlertTriangle size={13} /> falta
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {result.translatedPatient ? (
          <TranslatedPatient patient={result.translatedPatient} />
        ) : (
          <div className="empty-state">
            <AlertTriangle size={24} />
            <span>Resultado indisponível para este motor.</span>
          </div>
        )}
      </div>
    </article>
  );
}

export function TranslationWorkbench({ patients }: Props) {
  const [patientList, setPatientList] = useState<PatientClinicalSummary[]>(patients);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const selectedPatient = useMemo(
    () => patientList.find((patient) => patient.id === selectedPatientId) || patientList[0],
    [patientList, selectedPatientId]
  );
  const [newPatientForm, setNewPatientForm] = useState<NewPatientFormState>({
    name: "",
    age: "",
    sourceLocale: selectedPatient?.sourceLocale || "pt-BR"
  });
  const [sourceLocale, setSourceLocale] = useState<Locale>(
    selectedPatient?.sourceLocale || "pt-BR"
  );
  const [targetLocale, setTargetLocale] = useState<Locale>(
    chooseDefaultTarget(selectedPatient?.sourceLocale || "pt-BR")
  );
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [selectedProviders, setSelectedProviders] =
    useState<TranslationProvider[]>(PROVIDERS);
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>("syncing");
  const [persistenceMessage, setPersistenceMessage] = useState<string>(
    "Carregando pacientes do Firebase..."
  );
  const [patientEditorJson, setPatientEditorJson] = useState("");
  const [patientEditorError, setPatientEditorError] = useState<string | null>(null);
  const [isSavingEdits, setIsSavingEdits] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      try {
        const persisted = await listPatientsFromFirestore();

        if (!active) return;

        if (persisted === null) {
          setPatientList(patients);
          setPersistenceStatus("disabled");
          setPersistenceMessage(
            "Firebase não configurado. Usando apenas pacientes locais."
          );
          return;
        }

        if (persisted.length > 0) {
          setPatientList(persisted);
          setPersistenceStatus("ready");
          setPersistenceMessage("Pacientes carregados do Firebase.");
          return;
        }

        setPatientList(patients);
        setPersistenceStatus("ready");
        setPersistenceMessage("Firebase ativo. Nenhum paciente salvo ainda.");
      } catch {
        if (!active) return;
        setPatientList(patients);
        setPersistenceStatus("error");
        setPersistenceMessage(
          "Falha ao acessar Firebase. Continuando com pacientes locais."
        );
      }
    }

    loadPatients();

    return () => {
      active = false;
    };
  }, [patients]);

  useEffect(() => {
    setSelectedPatientId((current) => {
      if (current && patientList.some((patient) => patient.id === current)) {
        return current;
      }
      return patientList[0]?.id || "";
    });
  }, [patientList]);

  useEffect(() => {
    let active = true;

    fetch("/api/providers")
      .then((response) => response.json() as Promise<ProvidersResponse>)
      .then((payload) => {
        if (active) setProviderStatuses(payload.providers);
      })
      .catch(() => {
        if (active) setProviderStatuses([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setSourceLocale(selectedPatient.sourceLocale);
    setTargetLocale((current) =>
      current === selectedPatient.sourceLocale
        ? chooseDefaultTarget(selectedPatient.sourceLocale)
        : current
    );
  }, [selectedPatient]);

  useEffect(() => {
    if (!selectedPatient) return;

    setNewPatientForm((current) => {
      if (current.name.trim()) return current;
      return {
        name: `${selectedPatient.profile.firstName} ${selectedPatient.profile.lastName}`,
        age: String(selectedPatient.age),
        sourceLocale: selectedPatient.sourceLocale
      };
    });

    setPatientEditorJson(JSON.stringify(selectedPatient, null, 2));
    setPatientEditorError(null);
  }, [selectedPatient]);

  const providerStatusMap = useMemo(
    () => new Map(providerStatuses.map((status) => [status.provider, status])),
    [providerStatuses]
  );

  function toggleProvider(provider: TranslationProvider) {
    setSelectedProviders((current) =>
      current.includes(provider)
        ? current.filter((item) => item !== provider)
        : [...current, provider]
    );
  }

  async function handleCreatePatient() {
    const basePatient = selectedPatient || patientList[0];
    const trimmedName = newPatientForm.name.trim();

    if (!basePatient || !trimmedName) return;

    const created = buildPatientFromTemplate(
      basePatient,
      { ...newPatientForm, name: trimmedName },
      patientList
    );

    setPatientList((current) => [created, ...current]);
    setSelectedPatientId(created.id);
    setSourceLocale(created.sourceLocale);
    setTargetLocale(chooseDefaultTarget(created.sourceLocale));
    setResults([]);
    setError(null);

    if (persistenceStatus === "disabled") return;

    setPersistenceStatus("syncing");
    setPersistenceMessage("Salvando novo paciente no Firebase...");

    try {
      await savePatientToFirestore(created);
      setPersistenceStatus("ready");
      setPersistenceMessage("Paciente salvo no Firebase.");
    } catch {
      setPersistenceStatus("error");
      setPersistenceMessage(
        "Paciente criado localmente, mas não foi possível salvar no Firebase."
      );
    }
  }

  async function handleTranslate() {
    if (!selectedPatient || selectedProviders.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: selectedPatient,
          sourceLocale,
          targetLocale,
          providers: selectedProviders
        })
      });

      const payload = (await response.json()) as TranslateResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Falha ao traduzir.");
      }

      setResults(payload.results || []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha inesperada ao traduzir."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePatientEdits() {
    if (!selectedPatient) return;

    setPatientEditorError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(patientEditorJson);
    } catch {
      setPatientEditorError("JSON inválido. Revise a sintaxe antes de salvar.");
      return;
    }

    if (!isPatientClinicalSummary(parsed)) {
      setPatientEditorError(
        "Estrutura inválida. Mantenha os campos principais do paciente (id, nome, idade, profile, allergies, medicalHistory)."
      );
      return;
    }

    const editedPatient = {
      ...parsed,
      id: selectedPatient.id,
      lastUpdated: new Date().toISOString().slice(0, 10)
    } as PatientClinicalSummary;

    setPatientList((current) =>
      current.map((patient) =>
        patient.id === selectedPatient.id ? editedPatient : patient
      )
    );
    setResults([]);

    if (persistenceStatus === "disabled") {
      setPersistenceMessage("Paciente editado localmente.");
      return;
    }

    setIsSavingEdits(true);
    setPersistenceStatus("syncing");
    setPersistenceMessage("Salvando edição no Firebase...");

    try {
      await savePatientToFirestore(editedPatient);
      setPersistenceStatus("ready");
      setPersistenceMessage("Paciente atualizado no Firebase.");
    } catch {
      setPersistenceStatus("error");
      setPersistenceMessage(
        "Paciente atualizado localmente, mas falhou ao sincronizar no Firebase."
      );
    } finally {
      setIsSavingEdits(false);
    }
  }

  if (!selectedPatient) {
    return (
      <main className="app-shell">
        <div className="empty-state">Nenhum paciente sintético cadastrado.</div>
      </main>
    );
  }

  const selectedAllergies = allAllergies(selectedPatient);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Languages size={25} />
          </div>
          <div className="brand-text">
            <p className="eyebrow">POC SIDEMED</p>
            <h1>Comparador de tradução médica</h1>
          </div>
        </div>
        <div className="privacy-note">
          <ShieldCheck size={18} />
          <span>Dados sintéticos</span>
        </div>
      </header>

      <div className="workbench">
        <aside className="left-rail">
          <section className="rail-section">
            <label className="field-label" htmlFor="patient">
              Paciente
            </label>
            <select
              className="select"
              id="patient"
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
            >
              {patientList.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </select>

            <div className="new-patient-grid">
              <label className="field-label" htmlFor="newPatientName">
                Novo paciente
              </label>
              <input
                className="text-input"
                id="newPatientName"
                value={newPatientForm.name}
                onChange={(event) =>
                  setNewPatientForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Nome completo"
              />
              <div className="new-patient-row">
                <input
                  className="text-input"
                  type="number"
                  min={1}
                  value={newPatientForm.age}
                  onChange={(event) =>
                    setNewPatientForm((current) => ({
                      ...current,
                      age: event.target.value
                    }))
                  }
                  placeholder="Idade"
                  aria-label="Idade do novo paciente"
                />
                <select
                  className="select"
                  value={newPatientForm.sourceLocale}
                  onChange={(event) =>
                    setNewPatientForm((current) => ({
                      ...current,
                      sourceLocale: event.target.value as Locale
                    }))
                  }
                  aria-label="Idioma base do novo paciente"
                >
                  {LOCALES.map((locale) => (
                    <option key={locale.code} value={locale.code}>
                      {locale.shortLabel}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={handleCreatePatient}
                disabled={!newPatientForm.name.trim()}
              >
                Criar paciente
              </button>
              <p className={`sync-note ${persistenceStatus}`} role="status">
                {persistenceMessage}
              </p>
            </div>
          </section>

          <section className="rail-section">
            <h2 className="section-title">
              <FileText size={17} />
              Editar paciente (JSON)
            </h2>
            <label className="field-label" htmlFor="patientEditorJson">
              Dados completos
            </label>
            <textarea
              className="textarea"
              id="patientEditorJson"
              rows={12}
              value={patientEditorJson}
              onChange={(event) => setPatientEditorJson(event.target.value)}
              spellCheck={false}
            />
            {patientEditorError && <p className="sync-note error">{patientEditorError}</p>}
            <button
              className="ghost-button"
              type="button"
              onClick={handleSavePatientEdits}
              disabled={isSavingEdits || !patientEditorJson.trim()}
            >
              {isSavingEdits ? "Salvando..." : "Salvar edição"}
            </button>
          </section>

          <section className="rail-section">
            <h2 className="section-title">
              <FileText size={17} />
              Resumo
            </h2>
            <div className="patient-meta">
              <div className="meta-row">
                <span>Idade</span>
                <span>{selectedPatient.age}</span>
              </div>
              <div className="meta-row">
                <span>Sexo</span>
                <span>{selectedPatient.profile.sex}</span>
              </div>
              <div className="meta-row">
                <span>Tipo sanguíneo</span>
                <span>{selectedPatient.profile.bloodType}</span>
              </div>
              <div className="meta-row">
                <span>Nacionalidade</span>
                <span>{selectedPatient.profile.nationality}</span>
              </div>
              <div className="meta-row">
                <span>Atualizado</span>
                <span>{selectedPatient.lastUpdated}</span>
              </div>
            </div>
          </section>

          <section className="rail-section">
            <h2 className="section-title">
              <Stethoscope size={17} />
              Pontos clínicos
            </h2>
            <ul className="clinical-list">
              {selectedAllergies.map((allergy) => (
                <li key={allergy.substance}>
                  <strong>{allergy.substance}</strong>
                  <span>{allergy.reaction}</span>
                </li>
              ))}
              {selectedPatient.medicalHistory.chronicConditions.map((condition) => (
                <li key={condition.name}>
                  <strong>{condition.name}</strong>
                  <span>{condition.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="main-panel">
          <div className="controls">
            <div>
              <label className="field-label" htmlFor="sourceLocale">
                Origem
              </label>
              <select
                className="select"
                id="sourceLocale"
                value={sourceLocale}
                onChange={(event) => setSourceLocale(event.target.value as Locale)}
              >
                {LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="targetLocale">
                Destino
              </label>
              <select
                className="select"
                id="targetLocale"
                value={targetLocale}
                onChange={(event) => setTargetLocale(event.target.value as Locale)}
              >
                {LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="field-label">Motores</span>
              <div className="provider-grid">
                {PROVIDERS.map((provider) => {
                  const status = providerStatusMap.get(provider);
                  return (
                    <label className="provider-toggle" key={provider}>
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(provider)}
                        onChange={() => toggleProvider(provider)}
                      />
                      <span>{PROVIDER_LABELS[provider]}</span>
                      <span
                        className={`status-dot ${status?.configured ? "ready" : "missing"}`}
                        title={
                          status?.configured
                            ? "Configurado"
                            : `Não configurado: ${(status?.missingConfig || []).join(", ")}`
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={
                isLoading ||
                sourceLocale === targetLocale ||
                selectedProviders.length === 0
              }
              onClick={handleTranslate}
              title="Executar comparação de tradução"
            >
              {isLoading ? <LoaderCircle className="spinner" size={18} /> : <RefreshCw size={18} />}
              Comparar
            </button>
          </div>

          <div className="workspace-body">
            {sourceLocale === targetLocale && (
              <div className="error-banner">
                <AlertTriangle size={18} />
                <span>Origem e destino precisam ser diferentes.</span>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <section className="source-preview">
              <h2 className="section-title">
                <FileText size={17} />
                Entrada clínica
              </h2>
              <ClinicalSummary patient={selectedPatient} />
            </section>

            {results.length > 0 ? (
              <section className="results-grid" aria-label="Resultados de tradução">
                {results.map((result) => (
                  <ResultCard key={result.provider} result={result} />
                ))}
              </section>
            ) : (
              <div className="empty-state">
                <Languages size={26} />
                <span>Os resultados aparecerão lado a lado após a execução.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
