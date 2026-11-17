export const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    throw new Error("Falta configurar la variable VITE_API_URL para conectar con el backend.");
  }
  return apiUrl.replace(/\/+$/, "");
};
