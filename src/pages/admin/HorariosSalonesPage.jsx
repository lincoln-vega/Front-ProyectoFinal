import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Layers, MapPin, Search } from "lucide-react";
import useCurse from "../../hooks/useCurse";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 64;
const DAY_ALIASES = {
    lunes: "Lunes", lun: "Lunes",
    martes: "Martes", mar: "Martes",
    miércoles: "Miércoles", miercoles: "Miércoles", mié: "Miércoles", mie: "Miércoles",
    jueves: "Jueves", jue: "Jueves",
    viernes: "Viernes", vie: "Viernes",
    sábado: "Sábado", sabado: "Sábado", sáb: "Sábado", sab: "Sábado"
};

function parseTime(value, period = "") {
    if (!value) return 0;
    const [hours, minutes] = value.split(":").map(Number);
    let hour = hours || 0;
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour + (minutes || 0) / 60;
}

function expandCourseSchedule(course) {
    if (Array.isArray(course.dias) && course.dias.length > 0 && course.horaInicio && course.horaFin) {
        const start = parseTime(course.horaInicio);
        const end = parseTime(course.horaFin);
        const validDays = course.dias
            .map((day) => DAY_ALIASES[String(day).trim().toLowerCase()] || day)
            .filter((d) => DAYS.includes(d));
        return validDays.map((day) => ({
            ...course,
            horario: course.horario || `${course.horaInicio} - ${course.horaFin}`,
            day,
            start,
            end
        }));
    }

    const match = (course.horario || "").match(/^(.*?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})(?:\s*(AM|PM))?(?:\s*hrs?\.?)?$/i);
    if (!match) return [];
    const [, dayText, startValue, endValue, period] = match;
    const start = parseTime(startValue, period);
    const end = parseTime(endValue, period);
    const days = dayText.split(/\s+y\s+|,\s*|\s*\/\s*/i).map((day) => DAY_ALIASES[day.trim().toLowerCase()]).filter((d) => DAYS.includes(d));
    return days.map((day) => ({ ...course, day, start, end }));
}

export default function HorariosSalonesPage() {
    const { courses: initialCourses, loading, error } = useCurse();
    const [coursesList, setCoursesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => setCoursesList(initialCourses || []), [initialCourses]);

    const scheduleItems = useMemo(() => coursesList
        .filter((course) => course.estado !== "Inactivo")
        .filter((course) => {
            const term = searchTerm.toLowerCase();
            return !term || `${course.asignatura || ""} ${course.docente || ""} ${course.codigo || ""} ${course.aula || ""}`.toLowerCase().includes(term);
        })
        .flatMap(expandCourseSchedule), [coursesList, searchTerm]);

    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
    const formatHour = (hour) => `${String(hour % 12 || 12).padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`;

    return (
        <div className="space-y-6">
            {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {loading && <p className="text-sm text-slate-500">Consultando calendario académico en InsForge...</p>}

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl shadow-2xs border border-slate-200 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-[#1E3A8A] dark:text-blue-400" />
                        Calendario Académico y Salones
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Programación semanal consolidada de asignaturas, horarios de inicio/fin y aulas asignadas.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar materia, docente o aula..."
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 px-3.5 py-2 rounded-lg text-xs font-semibold">
                        <Layers className="w-4 h-4" />
                        <span>{scheduleItems.length} bloques programados</span>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-x-auto">
                <div className="min-w-[1000px]">
                    <div className="grid grid-cols-[88px_repeat(6,minmax(140px,1fr))] border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
                        <div className="p-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hora</div>
                        {DAYS.map((day) => (
                            <div key={day} className="p-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 border-l border-slate-200 dark:border-white/10">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-[88px_repeat(6,minmax(140px,1fr))]">
                        <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                            {hours.map((hour) => (
                                <div key={hour} className="h-16 border-b border-slate-100 dark:border-white/5 px-3 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {formatHour(hour)}
                                </div>
                            ))}
                        </div>

                        {DAYS.map((day) => {
                            const dayItems = scheduleItems.filter((item) => item.day === day);
                            return (
                                <div key={day} className="relative border-l border-slate-200 dark:border-white/10" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                                    {hours.map((hour) => (
                                        <div key={hour} className="h-16 border-b border-slate-100 dark:border-white/5" />
                                    ))}
                                    {dayItems.map((item, index) => {
                                        const top = (item.start - START_HOUR) * HOUR_HEIGHT;
                                        const height = Math.max((item.end - item.start) * HOUR_HEIGHT - 6, 44);
                                        const cleanHorario = item.horario ? item.horario.replace(/^.*?\s(?=\d)/, "") : `${item.horaInicio || ""} - ${item.horaFin || ""}`;
                                        return (
                                            <div
                                                key={`${item.id}-${day}-${index}`}
                                                className="absolute left-1.5 right-1.5 rounded-lg border-l-4 border-blue-600 dark:border-blue-400 bg-blue-50/90 dark:bg-blue-950/70 p-2 shadow-xs border border-blue-100 dark:border-blue-900/50 overflow-hidden group hover:shadow-md transition-all z-10"
                                                style={{ top: `${top + 3}px`, height: `${height}px` }}
                                            >
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="truncate text-xs font-bold text-blue-950 dark:text-blue-100">
                                                        {item.asignatura}
                                                    </p>
                                                    {item.aula && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-[#1E3A8A] dark:text-blue-300 shrink-0">
                                                            {item.aula}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="truncate text-[11px] font-semibold text-blue-800 dark:text-blue-300 mt-0.5">
                                                    {item.docente}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    {cleanHorario}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {!scheduleItems.length && (
                <div className="p-10 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No hay clases que coincidan con la búsqueda.
                </div>
            )}
        </div>
    );
}
