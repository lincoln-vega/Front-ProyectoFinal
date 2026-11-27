// Reemplazo real de DocumentPreview: utiliza el visor universal conectado a Supabase Storage (cero texto simulado)
import React from "react";
import FilePreviewModal from "../shared/FilePreviewModal";

export default function DocumentPreviewModal({ fileData, onClose }) {
  if (!fileData) return null;

  return (
    <FilePreviewModal
      isOpen={Boolean(fileData)}
      onClose={onClose}
      title={`Sustento Docente: ${fileData.tipo || "Incidencia"}`}
      subtitle={`${fileData.docente || ""} (DNI: ${fileData.dni || "—"}) • Materia: ${fileData.materia || "General"}`}
      fileName={fileData.archivoNombre || "justificante_docente.pdf"}
      bucket="justificantes-docentes"
      path={fileData.archivoPath || fileData.archivo_path || null}
      fallbackUrl={fileData.archivoUrl || fileData.archivo_url || null}
    />
  );
}
