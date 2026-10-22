import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || "https://rbxki34t.us-east.insforge.app";
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || "anon_992977496a2ecf64ba8d2b1207017f2ae6ebcadead842fa2679cc50de5779a73";
const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("Faltan VITE_INSFORGE_URL y VITE_INSFORGE_ANON_KEY en el archivo .env.");
}

export const insforge = createClient({
  baseUrl,
  anonKey
});
