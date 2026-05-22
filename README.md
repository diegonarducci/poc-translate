# POC de Tradução Médica Multi-Motor

App Next.js para comparar traduções de dados médicos sintéticos entre `pt-BR`, `en-US` e `es-ES`.

## Motores da POC

- Google Cloud Translation Advanced via Application Default Credentials.
- OpenAI Responses API com saída estruturada.
- LibreTranslate local via Docker.

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## LibreTranslate local

```bash
docker run --rm -it -p 5001:5000 libretranslate/libretranslate
```

## Variáveis de ambiente

Frontend (Firebase Web SDK):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Backend (Cloud Run):
- `OPENAI_API_KEY`
- `OPENAI_TRANSLATION_MODEL`, default `gpt-5.2`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_QUOTA_PROJECT`, opcional (se omitido, usa `GOOGLE_CLOUD_PROJECT`)
- `GOOGLE_TRANSLATE_LOCATION`, default `global`
- `LIBRETRANSLATE_URL` (URL do serviço LibreTranslate em Cloud Run)
- `LIBRETRANSLATE_API_KEY`, opcional

Deploy helpers:
- `PROJECT_ID`, default `poc-translate-497120`
- `REGION`, default `us-central1`
- `SERVICE_NAME`, default `poc-traducao-web`

Para Google em desenvolvimento local, configure ADC com `gcloud auth application-default login`.

## Persistência Firebase

Quando as variáveis `NEXT_PUBLIC_FIREBASE_*` estiverem configuradas, os novos pacientes
criados ou editados na UI são salvos na coleção `patients` do Cloud Firestore.

Regras mínimas para POC de teste manual:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if true;
    }
  }
}
```

Sem Firebase configurado, a aplicação funciona normalmente usando apenas os pacientes locais.

## Deploy em produção (Firebase Hosting + Cloud Run + LibreTranslate)

Arquitetura implementada:
- Firebase Hosting recebe domínio/SSL.
- Hosting faz rewrite para o serviço Next.js no Cloud Run.
- O backend Next.js chama OpenAI, Google e LibreTranslate.
- O navegador nunca chama LibreTranslate direto (evita CORS e protege credenciais).

### 1. Deploy do LibreTranslate (Docker)

```bash
export PROJECT_ID=poc-translate-497120
export REGION=us-central1
export LIBRETRANSLATE_API_KEY="sua-chave-opcional"
npm run deploy:libretranslate
```

Depois do deploy, copie a URL do serviço (exemplo: `https://libretranslate-xxxxx-uc.a.run.app`).

### 2. Deploy do serviço web/api (Next.js)

```bash
export PROJECT_ID=poc-translate-497120
export REGION=us-central1
export SERVICE_NAME=poc-traducao-web
export NEXT_PUBLIC_FIREBASE_API_KEY="..."
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="poc-translate-497120.firebaseapp.com"
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=poc-translate-497120
export NEXT_PUBLIC_FIREBASE_APP_ID="..."
export GOOGLE_CLOUD_PROJECT=poc-translate-497120
export GOOGLE_CLOUD_QUOTA_PROJECT=poc-translate-497120
export GOOGLE_TRANSLATE_LOCATION=global
export LIBRETRANSLATE_URL="https://libretranslate-xxxxx-uc.a.run.app"
# opcional: export LIBRETRANSLATE_API_KEY="..."
# opção A: usar Secret Manager com segredo OPENAI_API_KEY
# opção B: export OPENAI_API_KEY="..."
npm run deploy:web
```

### 3. Publicar Firebase Hosting e regras Firestore

```bash
npm run deploy:hosting
```

A configuração de rewrite está em `firebase.json` e encaminha tráfego para o serviço `poc-traducao-web` em `us-central1`.

## Seeds e testes

Popular Firestore com pacientes de seed:

```bash
npm run seed:firestore
```

Rodar testes:

```bash
npm test
```
