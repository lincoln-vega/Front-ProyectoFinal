import { useState, useEffect } from "react";
import { incidentService } from "../services/api";

export default function useTeacherIncidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    setIncidents(incidentService.getIncidents());
  }, []);

  const updateIncident = (id, updatedFields) => {
    const patch = typeof updatedFields === "string" ? { estado: updatedFields } : updatedFields;
    const updated = incidents.map((inc) =>
      inc.id === id ? { ...inc, ...patch } : inc
    );
    setIncidents(updated);
    incidentService.saveIncidents(updated);
  };

  const updateIncidentStatus = (id, newStatus) => {
    updateIncident(id, { estado: newStatus });
  };

  const resetIncidents = () => {
    const initial = incidentService.resetIncidents();
    setIncidents(initial);
  };

  return { incidents, updateIncidentStatus, updateIncident, resetIncidents };
}