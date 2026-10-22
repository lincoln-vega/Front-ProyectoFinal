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
  const updateIncident = (id, updatedFields) => {
    const patch = typeof updatedFields === "string" ? { estado: updatedFields } : updatedFields;
    const updated = incidents.map((inc) =>
      inc.id === id ? { ...inc, ...patch } : inc
    );
    setIncidents(updated);
    incidentService.saveIncidents(updated);
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

  return { incidents, loading, error, updateIncidentStatus, resetIncidents };
  return { incidents, loading, error, updateIncidentStatus, updateIncident, resetIncidents };
  const resetIncidents = () => {
    const initial = incidentService.resetIncidents();
    setIncidents(initial);
  };

  return { incidents, updateIncidentStatus, updateIncident, resetIncidents };
}