/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QDRANT_CLOUD_URL: string;
  readonly VITE_QDRANT_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}