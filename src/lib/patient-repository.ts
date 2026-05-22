import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import type { PatientClinicalSummary } from "@/lib/types";
import { getFirestoreDb, isFirestoreEnabled } from "@/lib/firebase/client";

const COLLECTION_NAME = "patients";

function isPatientClinicalSummary(value: unknown): value is PatientClinicalSummary {
  if (!value || typeof value !== "object") return false;

  const patient = value as Partial<PatientClinicalSummary>;
  return (
    typeof patient.id === "string" &&
    typeof patient.name === "string" &&
    typeof patient.age === "number" &&
    typeof patient.sourceLocale === "string"
  );
}

export async function listPatientsFromFirestore(): Promise<PatientClinicalSummary[] | null> {
  if (!isFirestoreEnabled()) {
    return null;
  }

  const db = getFirestoreDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  const patients = snapshot.docs
    .map((item) => item.data())
    .filter(isPatientClinicalSummary)
    .sort((a, b) => a.id.localeCompare(b.id));

  return patients;
}

export async function savePatientToFirestore(patient: PatientClinicalSummary): Promise<void> {
  if (!isFirestoreEnabled()) {
    return;
  }

  const db = getFirestoreDb();
  if (!db) {
    return;
  }

  await setDoc(doc(db, COLLECTION_NAME, patient.id), patient, { merge: true });
}
