import { useState, useEffect } from "react";
import { incidentService } from "../services/api";

export default function useTeacherIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    incidentService.getIncidents()
      .then(setIncidents)
      .catch((err) => {
        console.error("Error al cargar incidencias:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateIncident = async (id, updatedFields) => {
    setError("");
    await incidentService.updateIncident(id, updatedFields);
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, ...updatedFields } : incident
      )
    );
  };

  const updateIncidentStatus = async (id, newStatus) => {
    await updateIncident(id, { estado: newStatus });
  };

  const resetIncidents = async () => {
    setLoading(true);
    setError("");
    try {
      setIncidents(await incidentService.resetIncidents());
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { incidents, loading, error, updateIncidentStatus, updateIncident, resetIncidents };
}