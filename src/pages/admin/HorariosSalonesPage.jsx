import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Layers, MapPin, Search } from "lucide-react";
import useCurse from "../../hooks/useCurse";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 64;
const DAY_ALIASES = {
    lunes: "Lunes", lun: "Lunes",
    martes: "Martes", mar: "Martes",
    miércoles: "Miércoles", miercoles: "Miércoles", mié: "Miércoles", mie: "Miércoles",
    jueves: "Jueves", jue: "Jueves",
    viernes: "Viernes", vie: "Viernes"
};

function parseTime(value, period = "") {
    const [hours, minutes] = value.split(":").map(Number);
    let hour = hours;
    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour + minutes / 60;
}

function expandCourseSchedule(course) {
    const match = (course.horario || "").match(/^(.*?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})(?:\s*(AM|PM))?(?:\s*hrs?\.?)?$/i);
    if (!match) return [];
    const [, dayText, startValue, endValue, period] = match;
    const start = parseTime(startValue, period);
    const end = parseTime(endValue, period);
    const days = dayText.split(/\s+y\s+|,\s*|\s*\/\s*/i).map((day) => DAY_ALIASES[day.trim().toLowerCase()]).filter(Boolean);
    return days.map((day) => ({ ...course, day, start, end }));
}

export default function HorariosSalonesPage() {
    const { courses: initialCourses } = useCurse();
    const [coursesList, setCoursesList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => setCoursesList(initialCourses || []), [initialCourses]);

    const scheduleItems = useMemo(() => coursesList
        .filter((course) => course.estado !== "Inactivo")
        .filter((course) => {
            const term = searchTerm.toLowerCase();
            return !term || `${course.asignatura} ${course.docente}`.toLowerCase().includes(term);
        })
        .flatMap(expandCourseSchedule), [coursesList, searchTerm]);

    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
    const formatHour = (hour) => `${String(hour % 12 || 12).padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`;

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-6 h-6 text-[#1E3A8A]" />Calendario académico</h2>
                    <p className="text-xs text-slate-500 mt-1">Todas las clases organizadas por día, hora, docente.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar curso o docente..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]" />
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-[#1E3A8A] px-3.5 py-2 rounded-lg text-xs font-semibold"><Layers className="w-4 h-4" /><span>{scheduleItems.length} clases programadas</span></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <div className="min-w-[920px]">
                    <div className="grid grid-cols-[88px_repeat(5,minmax(150px,1fr))] border-b border-slate-200 bg-slate-50">
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Hora</div>
                        {DAYS.map((day) => <div key={day} className="p-3 text-center text-xs font-bold text-slate-700 border-l border-slate-200">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-[88px_repeat(5,minmax(150px,1fr))]">
                        <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>{hours.map((hour) => <div key={hour} className="h-16 border-b border-slate-100 px-3 pt-2 text-[10px] font-medium text-slate-400">{formatHour(hour)}</div>)}</div>
                        {DAYS.map((day) => {
                            const dayItems = scheduleItems.filter((item) => item.day === day);
                            return <div key={day} className="relative border-l border-slate-200" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                                {hours.map((hour) => <div key={hour} className="h-16 border-b border-slate-100" />)}
                                {dayItems.map((item, index) => {
                                    const top = (item.start - START_HOUR) * HOUR_HEIGHT;
                                    const height = Math.max((item.end - item.start) * HOUR_HEIGHT - 8, 44);
                                    return <div key={`${item.id}-${day}-${index}`} className="absolute left-1.5 right-1.5 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-2 shadow-xs overflow-hidden" style={{ top: `${top + 4}px`, height: `${height}px` }}>
                                        <p className="truncate text-[14px] font-bold text-blue-950">{item.asignatura}</p>
                                        <p className="truncate text-[12px] text-blue-800">{item.docente}</p>
                                        <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-slate-500"><Clock className="h-3 w-3 shrink-0" />{item.horario.replace(/^.*?\s(?=\d)/, "")}</p>
                                    </div>;
                                })}
                            </div>;
                        })}
                    </div>
                </div>
            </div>
            {!scheduleItems.length && <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">No hay clases que coincidan con la búsqueda.</div>}
        </div>
    );
}
