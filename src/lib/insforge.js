import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || "https://rbxki34t.us-east.insforge.app";
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || "ik_d0819137e3c783ce6a002a534d62e4e6";

export const insforge = createClient({
  baseUrl,
  anonKey
});
