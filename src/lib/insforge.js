import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || "https://rbxki34t.us-east.insforge.app";
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || "anon_992977496a2ecf64ba8d2b1207017f2ae6ebcadead842fa2679cc50de5779a73";

export const insforge = createClient({
  baseUrl,
  anonKey
});

export const API_ACCESS_TOKEN_KEY = "apiAccessToken";

export const getApiAccessToken = () =>
  typeof localStorage === "undefined"
    ? null
    : localStorage.getItem(API_ACCESS_TOKEN_KEY);

export const setApiAccessToken = (token) => {
  if (typeof localStorage !== "undefined") {
    if (token) {
      localStorage.setItem(API_ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(API_ACCESS_TOKEN_KEY);
    }
  }
  insforge.getHttpClient().setAuthToken(token || null);
};

const storedAccessToken = getApiAccessToken();
if (storedAccessToken) {
  insforge.getHttpClient().setAuthToken(storedAccessToken);
}

export const createIsolatedAuthClient = () => createClient({
  baseUrl,
  anonKey
});
