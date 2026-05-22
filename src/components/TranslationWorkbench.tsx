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
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );
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
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </select>
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
