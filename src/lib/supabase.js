import { createClient } from "@supabase/supabase-js";
import { getApiBaseUrl } from "./apiUrl";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

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
};

/**
 * Sube un archivo de forma validada a Supabase Storage a través del Backend FastAPI.
 * Buckets permitidos: "tareas-entregas" (15 MB), "materiales-clase" (15 MB),
 * "vouchers-pago" (5 MB), "justificantes-docentes" (5 MB).
 */
export async function uploadFileToStorage(bucket, file, folder = "general") {
  if (!file) {
    throw new Error("Debes seleccionar un archivo para subir.");
  }
  const token = getApiAccessToken();
  if (!token) {
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente antes de subir archivos.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch(`${getApiBaseUrl()}/storage/upload/${encodeURIComponent(bucket)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.detail || `No se pudo subir el archivo (HTTP ${response.status}).`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return body;
}

/**
 * Resuelve una URL firmada vigente para un archivo privado en Supabase Storage
 * (o devuelve `fallbackUrl` cuando solo se dispone del enlace directo).
 */
export async function resolveStorageUrl(bucket, path, fallbackUrl = null) {
  const token = getApiAccessToken();
  if (bucket && path && token) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/storage/signed-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bucket, path, expiresIn: 3600 })
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data?.url) {
          return data.url;
        }
      }
    } catch {}
  }
  if (fallbackUrl) {
    return fallbackUrl;
  }
  throw new Error("El archivo no tiene un enlace disponible en este momento.");
}

/**
 * Abre un archivo privado de Supabase Storage en una pestaña externa renovando su URL firmada.
 */
export async function openStorageFile(bucket, path, fallbackUrl = null) {
  const win = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;
  try {
    const url = await resolveStorageUrl(bucket, path, fallbackUrl);
    if (win) {
      win.location.href = url;
    } else if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    return url;
  } catch (err) {
    if (win) win.close();
    throw err;
  }
}
