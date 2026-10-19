/**
 * Utilidad para exportar colecciones de datos a archivos CSV estructurados
 * compatibles nativamente con Microsoft Excel, Google Sheets y LibreOffice.
 *
 * Incluye Byte Order Mark (BOM) UTF-8 (\uFEFF) para garantizar el renderizado
 * correcto de tildes, caracteres especiales y números en cualquier sistema operativo.
 */

/**
 * Exporta un arreglo de objetos a un archivo CSV descargable.
 * @param {Array<Object>} data - Conjunto de datos a exportar
 * @param {string} filename - Nombre base del archivo (sin extensión)
 * @param {Array<{key: string, label: string}>} columns - Especificación de columnas y cabeceras
 */
export function exportToCSV(data, filename = "reporte", columns = []) {
  if (!data || !data.length) {
    console.warn("[exportToCSV] No hay datos disponibles para exportar.");
    return false;
  }

  // Determinar columnas dinámicamente si no se suministran
  const cols = (columns && columns.length > 0)
    ? columns
    : Object.keys(data[0]).map((k) => ({ key: k, label: k.toUpperCase() }));

  // Cabecera separada por punto y coma (estándar en Excel en español)
  const headerRow = cols.map((c) => `"${(c.label || c.key).replace(/"/g, '""')}"`).join(";");

  // Filas de datos
  const dataRows = data.map((item) => {
    return cols
      .map((col) => {
        let value = item[col.key];
        if (value === null || value === undefined) {
          value = "";
        } else if (typeof value === "object") {
          value = JSON.stringify(value);
        } else {
          value = String(value);
        }
        // Escapar comillas dobles
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(";");
  });

  // Construir contenido con BOM UTF-8
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
