/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly REACT_APP_GOOGLE_CLIENT_ID?: string;
    readonly REACT_APP_GOOGLE_API_KEY?: string;
    readonly REACT_APP_MICROSOFT_CLIENT_ID?: string;
    readonly REACT_APP_MICROSOFT_TENANT_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
