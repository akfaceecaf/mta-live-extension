/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MTA_MNR_FEED_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
