/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The commit the demo was built from; set by the Pages workflow. */
  readonly VITE_COMMIT?: string
  readonly VITE_BUILT_AT?: string
}
