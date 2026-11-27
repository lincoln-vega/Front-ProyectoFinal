export const getApiBaseUrl = () => {
  const apiUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL)?.trim();
  if (apiUrl) {
    return apiUrl.replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://127.0.0.1:8000";
  }
  throw new Error("Falta configurar la variable VITE_API_URL para conectar con el backend.");
};
