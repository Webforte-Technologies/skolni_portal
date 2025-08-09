/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG_MODE: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Runtime configuration interface
interface Window {
  APP_CONFIG?: {
    API_URL: string
    API_TIMEOUT: number
    APP_NAME: string
    APP_VERSION: string
    ENABLE_ANALYTICS: boolean
    ENABLE_DEBUG_MODE: boolean
  }
} 