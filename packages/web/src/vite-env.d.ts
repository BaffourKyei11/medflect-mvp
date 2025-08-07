/// <reference types="vite/client" />

// Support for Vite PWA virtual modules
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onOfflineReady?: () => void;
    onNeedRefresh?: () => void;
  }
  export function registerSW(options?: RegisterSWOptions): (reload?: boolean) => Promise<void>;
  export default registerSW;
}
