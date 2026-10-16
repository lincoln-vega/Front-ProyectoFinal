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
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/30 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{pendingCount} Casos Pendientes de Docentes</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                            Registro de Asistencia y Gestión de Incidencias Docentes
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            Auditoría sincrónica en tiempo real, control de permanencia virtual y flujo de aprobación de justificaciones médicas o técnicas presentadas por la plana docente.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => showNotification("Exportación de reporte de incidencias en Excel iniciada.")}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white bg-white/60 dark:bg-white/5 backdrop-blur-2xl hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Descargar Excel</span>
                        </button>
                        <button
                            onClick={() => showNotification("Funcionalidad de registro manual habilitada.")}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            <span>+ Registrar Justificación Manual</span>
                        </button>
                    </div>
                </div>

                {/* TARJETAS DE MÉTRICAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Docentes Conectados</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800 dark:text-white">28 / 30 activos</span>
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">93.3% puntualidad general</span>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tardanzas Registradas</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800 dark:text-white">{incidents.filter(i => i.tipo.includes("Tardanza")).length} incidencias</span>
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Promedio retraso: 12.5 min</span>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Aulas en Funcionamiento</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-slate-800 dark:text-white">12 / 12 salas</span>
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Zoom & Meet sincronizados</span>
                    </div>

                    <div className="bg-amber-50/70 dark:bg-amber-900/20 backdrop-blur-2xl p-4 rounded-xl border border-amber-200 dark:border-amber-500/30">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider block">Casos por Validar</span>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xl font-extrabold text-amber-900 dark:text-amber-400">{pendingCount} pendientes</span>
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                        </div>
                        <span className="text-xs text-amber-700 dark:text-amber-500 mt-1 block">Requiere revisión administrativa</span>
                    </div>
                </div>
            </div>

            {/* BANDEJA DE GESTIÓN */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bandeja de Gestión de Incidencias Docentes</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                {pendingCount} Pendientes
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Revisión de sustentos médicos, fallas de conectividad y solicitudes de dispensa del personal docente.</p>
                    </div>

                    <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-xs">
                        <button
                            onClick={() => setFilterType("TODOS")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "TODOS" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                            Todos ({incidents.length})
                        </button>
                        <button
                            onClick={() => setFilterType("Tardanza")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "Tardanza" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                        >
                            Tardanzas
                        </button>
                        <button
                            onClick={() => setFilterType("Inasistencia")}
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${filterType === "Inasistencia" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
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
                                        ? "bg-emerald-50/40 dark:bg-emerald-900/20 backdrop-blur-2xl border-emerald-200 dark:border-emerald-500/30"
                                        : inc.estado === "Rechazado"
                                            ? "bg-rose-50/40 dark:bg-rose-900/20 backdrop-blur-2xl border-rose-200 dark:border-rose-500/30"
                                            : "bg-white/60 dark:bg-white/5 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50"
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${inc.tipo.includes("Tardanza")
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                                                    : "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                                                }`}>
                                                {inc.tipo}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                                                Docente Titular
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{inc.docente}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                            <span>DNI: {inc.dni}</span>
                                            <span>•</span>
                                            <span>Presentado: {inc.fechaPresentacion}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                                            <div className="p-3 bg-slate-50 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-white/10">
                                                <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 block mb-0.5">Materia y horario asignado:</span>
                                                <strong className="text-slate-800 dark:text-white block">{inc.materia}</strong>
                                                <span className="text-slate-600 dark:text-slate-400">{inc.horario}</span>
                                            </div>

                                            <div className="p-3 bg-blue-50/40 dark:bg-blue-900/20 backdrop-blur-2xl rounded-xl border border-blue-100 dark:border-blue-500/30">
                                                <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Motivo del Docente:</span>
                                                <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">"{inc.motivo}"</p>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedFile(inc)}
                                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100/60 dark:bg-white/5 backdrop-blur-2xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                                <span>{inc.archivoNombre}</span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold ml-1">(Ver Documento)</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-white/10">
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
                                                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/50 font-bold rounded-xl text-xs transition-all cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Rechazar</span>
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 ${inc.estado === "Aprobado"
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                                    : "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                                                }`}>
                                                {inc.estado === "Aprobado" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                                <span>Caso {inc.estado}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 dark:text-emerald-600" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No hay incidencias pendientes en esta categoría.</p>
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