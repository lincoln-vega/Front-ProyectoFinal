// Cliente unificado para el Motor de Reportes Institucionales (PDF binario estilo JasperReports + JSON/Excel)
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/supabase";

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "" && v !== "TODOS") {
      qs.set(k, String(v));
    }
  });
  return qs.toString();
}

function authHeaders() {
  const token = getApiAccessToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export const reportesService = {
  async getResumenEjecutivo(cicloId = null) {
    const qs = buildQuery({ ciclo_id: cicloId });
    const url = `${getApiBaseUrl()}/reportes/resumen-ejecutivo${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  async fetchReportData(endpointPath, params = {}) {
    const qs = buildQuery({ ...params, formato: "json" });
    const url = `${getApiBaseUrl()}${endpointPath}?${qs}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `No se pudo generar los datos del reporte (${res.status}).`);
    }
    return res.json();
  },

  async fetchReportPdf(endpointPath, params = {}) {
    const qs = buildQuery({ ...params, formato: "pdf" });
    const url = `${getApiBaseUrl()}${endpointPath}?${qs}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `No se pudo generar el documento PDF (${res.status}).`);
    }
    const blob = await res.blob();
    const disp = res.headers.get("Content-Disposition") || "";
    const match = disp.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || `reporte_oficial_${Date.now()}.pdf`;
    const blobUrl = URL.createObjectURL(blob);
    return { blob, blobUrl, filename };
  }
};
