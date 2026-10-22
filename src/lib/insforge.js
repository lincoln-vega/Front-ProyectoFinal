import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("Faltan VITE_INSFORGE_URL y VITE_INSFORGE_ANON_KEY en el archivo .env.");
}

export const insforge = createClient({
  baseUrl,
  anonKey
});
