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

- `OPENAI_API_KEY`
- `OPENAI_TRANSLATION_MODEL`, default `gpt-5.2`
- `NEXT_PUBLIC_FIREBASE_API_KEY`, opcional para persistir pacientes
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, opcional para persistir pacientes
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, opcional para persistir pacientes
- `NEXT_PUBLIC_FIREBASE_APP_ID`, opcional para persistir pacientes
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_QUOTA_PROJECT`, opcional (se omitido, usa `GOOGLE_CLOUD_PROJECT`)
- `GOOGLE_TRANSLATE_LOCATION`, default `global`
- `LIBRETRANSLATE_URL`, default `http://localhost:5000`
- `LIBRETRANSLATE_API_KEY`, opcional

Para Google, configure ADC com `gcloud auth application-default login`.

## Persistência Firebase (opcional)

Quando as variáveis `NEXT_PUBLIC_FIREBASE_*` estiverem configuradas, os novos pacientes
criados na UI são salvos na coleção `patients` do Cloud Firestore.

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

## Testes

```bash
npm test
```
