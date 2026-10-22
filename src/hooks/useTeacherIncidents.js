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

  const updateIncidentStatus = async (id, newStatus) => {
    setError("");
    await incidentService.updateIncidentStatus(id, newStatus);
    setIncidents((current) => current.map((incident) =>
      incident.id === id ? { ...incident, estado: newStatus } : incident
    ));
  };

  const updateIncident = async (id, updatedFields) => {
    setError("");
    const patch = typeof updatedFields === "string" ? { estado: updatedFields } : updatedFields;
    await incidentService.updateIncident(id, patch);
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, ...patch } : incident
      )
    );
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
