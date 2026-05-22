import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { samplePatients } from "../lib/patients";

function loadDotEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) return;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

async function seedFirestorePatients() {
  loadDotEnvLocal();

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      "Variaveis Firebase ausentes em .env.local (NEXT_PUBLIC_FIREBASE_*)."
    );
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey,
          authDomain,
          projectId,
          appId
        });

  const db = getFirestore(app);

  for (const patient of samplePatients) {
    await setDoc(doc(db, "patients", patient.id), patient, { merge: true });
  }

  console.log(`Seed concluido: ${samplePatients.length} pacientes enviados.`);
}

seedFirestorePatients().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  console.error(`Falha ao executar seed: ${message}`);
  process.exit(1);
});
