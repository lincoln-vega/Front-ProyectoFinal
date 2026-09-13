import React, { useState } from "react";
import {
    Download,
    AlertTriangle,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    ShieldCheck,
    Check,
    X
} from "lucide-react";
import useTeacherIncidents from "../../hooks/useTeacherIncidents";
import DocumentPreviewModal from "../../components/admin/DocumentPreview";
import Notification from "../../components/admin/Notification";

export default function ControlAsistenciasPage() {
    const { incidents, updateIncidentStatus } = useTeacherIncidents();
    const [filterType, setFilterType] = useState("TODOS");
    const [selectedFile, setSelectedFile] = useState(null);
    const [notification, setNotification] = useState(null);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    const handleAction = (id, status) => {
        updateIncidentStatus(id, status);
        showNotification(`Justificación marcada como: ${status}`);
    };

    const pendingCount = incidents.filter(i => i.estado === "Pendiente").length;

    const filteredIncidents = incidents.filter(inc => {
        if (filterType === "Tardanza") return inc.tipo.includes("Tardanza");
        if (filterType === "Inasistencia") return inc.tipo.includes("Inasistencia");
        return true;
    });

    return (
        <div className="space-y-6">
            {notification && (
                <Notification message={notification} onClose={() => setNotification(null)} />
            )}

            {/* BANNER SUPERIOR */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{pendingCount} Casos Pendientes de Docentes</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800">
                            Registro de Asistencia y Gestión de Incidencias Docentes
                        </h1>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                            Auditoría sincrónica en tiempo real, control de permanencia virtual y flujo de aprobación de justificaciones médicas o técnicas presentadas por la plana docente.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => showNotification("Exportación de reporte de incidencias en Excel iniciada.")}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-slate-500" />
                            <span>Descargar Excel</span>
                        </button>
                        <button
                            onClick={() => showNotification("Funcionalidad de registro manual habilitada.")}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] text-white hover:bg-blue-800 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            <span>+ Registrar Justificación Manual</span>
                        </button>
                    </div>
                </div>

                {/* TARJETAS DE MÉTRICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Docentes Conectados</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800">28 / 30 activos</span>
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium mt-1 block">93.3% puntualidad general</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tardanzas Registradas</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800">{incidents.filter(i => i.tipo.includes("Tardanza")).length} incidencias</span>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 block">Promedio retraso: 12.5 min</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salas virtuales activas</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800">12 / 12 salas</span>
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[11px] text-emerald-600 font-medium mt-1 block"> Meet sincronizado</span>
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Casos por Validar</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-amber-900">{pendingCount} pendientes</span>
                            <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
                        </div>
                        <span className="text-[11px] text-amber-700 mt-1 block">Requiere revisión administrativa</span>
                    </div>
                </div>
            </div>

            {/* BANDEJA DE GESTIÓN */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-bold text-slate-800">Bandeja de Gestión de Incidencias Docentes</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                {pendingCount} Pendientes
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">Revisión de sustentos médicos, fallas de conectividad y solicitudes de dispensa del personal docente.</p>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
                        <button
                            onClick={() => setFilterType("TODOS")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "TODOS" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Todos ({incidents.length})
                        </button>
                        <button
                            onClick={() => setFilterType("Tardanza")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "Tardanza" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Tardanzas
                        </button>
                        <button
                            onClick={() => setFilterType("Inasistencia")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "Inasistencia" ? "bg-white text-slate-800 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Inasistencias
                        </button>
                    </div>
                </div>

                {/* LISTA DE TARJETAS */}
                <div className="space-y-4">
                    {filteredIncidents.length > 0 ? (
                        filteredIncidents.map((inc) => (
                            <div
                                key={inc.id}
                                className={`p-5 rounded-2xl border transition-all ${inc.estado === "Aprobado"
                                        ? "bg-emerald-50/40 border-emerald-200"
                                        : inc.estado === "Rechazado"
                                            ? "bg-rose-50/40 border-rose-200"
                                            : "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${inc.tipo.includes("Tardanza")
                                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                                    : "bg-rose-100 text-rose-800 border-rose-200"
                                                }`}>
                                                {inc.tipo}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#1E3A8A] border border-blue-200">
                                                Docente Titular
                                            </span>
                                            <span className="text-xs font-bold text-slate-900">{inc.docente}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                                            <span>DNI: {inc.dni}</span>
                                            <span>•</span>
                                            <span>Presentado: {inc.fechaPresentacion}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Materia y horario asignado:</span>
                                                <strong className="text-slate-800 block">{inc.materia}</strong>
                                                <span className="text-slate-600">{inc.horario}</span>
                                            </div>

                                            <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                                                <span className="text-[10px] uppercase font-bold text-blue-600 block mb-0.5">Motivo del Docente:</span>
                                                <p className="text-slate-700 italic leading-relaxed">"{inc.motivo}"</p>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedFile(inc)}
                                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-rose-600" />
                                                <span>{inc.archivoNombre}</span>
                                                <span className="text-[10px] text-blue-600 font-bold ml-1">(Ver Documento)</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                                        {inc.estado === "Pendiente" ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(inc.id, "Aprobado")}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Aprobar Justificación</span>
                                                </button>
                                                <button
                                                    onClick={() => handleAction(inc.id, "Rechazado")}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Rechazar</span>
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 ${inc.estado === "Aprobado"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                                                }`}>
                                                {inc.estado === "Aprobado" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                                                <span>Caso {inc.estado}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                            <p className="text-sm font-semibold text-slate-700">No hay incidencias pendientes en esta categoría.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE VISTA PREVIA */}
            {selectedFile && (
                <DocumentPreviewModal
                    fileData={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </div>
    );
}