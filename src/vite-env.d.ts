/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BACKEND_API_URL?: string
  readonly VITE_CLIENT_ID: string
  readonly VITE_APP_NAME?: string
  readonly VITE_SHORT_URL_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
