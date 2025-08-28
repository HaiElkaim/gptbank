# GPT BANK • Chatbot Q&A (CSV + OpenRouter)

This repository contains a fully functional, Netlify-ready chatbot application. It provides a question-answering interface based on a local knowledge base stored in CSV files, powered by large language models via OpenRouter.

## Features

- **Mono-page UI**: Full-screen chatbot interface built with Vite, React, and TypeScript.
- **Serverless Backend**: All backend logic is handled by Netlify Functions (TypeScript).
- **Local RAG**: Retrieval-Augmented Generation using a BM25 index on versioned CSV files.
- **LLM Integration**: Connects to OpenRouter, with a primary model and a fallback for resilience.
- **Admin Interface**: A basic-auth protected endpoint to view knowledge base content.
- **Ready to Deploy**: 1-click deployment to Netlify.

## Project Structure

```
/ (racine)
  netlify.toml
  package.json
  tsconfig.json
  vite.config.ts
  README.md
  /app
    /client
      index.html
      src/main.tsx
      ...
    /functions
      ask.ts
      health.ts
      ...
    /data
      faq.csv
      fees.csv
      ...
  /prompts
    system_v1.md
    ...
```

## Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Netlify Functions (TypeScript)
- **RAG**: `wink-bm25-text` for search, with custom re-ranking.
- **LLM Orchestration**: OpenRouter API.
- **Routing (Functions)**: `itty-router`

## Environment Variables

Create a `.env` file from the `.env.example` for local development. On Netlify, add these variables in **Site Settings → Build & deploy → Environment**.

```env
OPENROUTER_API_KEY=
PRIMARY_MODEL=anthropic/claude-3.5-sonnet
FALLBACK_MODEL=openai/gpt-4o-mini
HTTP_REFERER=https://your-netlify-site.netlify.app
X_TITLE=GPT BANK Assistant
ADMIN_BASIC_USER=admin
ADMIN_BASIC_PASS=change-me
ENABLE_PROMETHEUS=false
```

## Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    This command starts the Vite frontend and the Netlify Functions emulator simultaneously.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Deployment to Netlify

This repository is ready for a seamless deployment on Netlify.

1.  **Push to GitHub:**
    Create a new repository on GitHub and push the code.

2.  **Import to Netlify:**
    - Log in to your Netlify account.
    - Click **"Add new site"** → **"Import an existing project"**.
    - Connect to your Git provider and select the repository.

3.  **Configure Build Settings:**
    Netlify should automatically detect the settings from `netlify.toml`. Verify they are correct:
    - **Build command**: `npm run build`
    - **Publish directory**: `app/client/dist`
    - **Functions directory**: `app/functions`

4.  **Add Environment Variables:**
    - Go to your new site's settings.
    - Navigate to **Build & deploy → Environment**.
    - Add the environment variables listed above.

5.  **Deploy:**
    - Click **"Deploy site"**. Netlify will build and deploy your application.

## API Endpoints

- `POST /api/ask`: The main endpoint for the chatbot.
- `GET /api/health`: A simple health check, returns `{ "ok": true }`.
- `GET /api/admin`: View all CSV data (requires Basic Auth).
- `GET /api/metrics`: Exposes Prometheus metrics (if `ENABLE_PROMETHEUS=true`).
