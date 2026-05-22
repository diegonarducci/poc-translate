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
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_QUOTA_PROJECT`, opcional (se omitido, usa `GOOGLE_CLOUD_PROJECT`)
- `GOOGLE_TRANSLATE_LOCATION`, default `global`
- `LIBRETRANSLATE_URL`, default `http://localhost:5000`
- `LIBRETRANSLATE_API_KEY`, opcional

Para Google, configure ADC com `gcloud auth application-default login`.

## Testes

```bash
npm test
```
