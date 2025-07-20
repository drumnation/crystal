/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_KANBAN?: string;
  readonly ENABLE_KANBAN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}