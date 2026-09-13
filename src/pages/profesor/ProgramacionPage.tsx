interface ScheduleSlot {
  time: string;
  days: {
    [key: string]: { course: string; code: string; room: string } | null;
  };
}

const scheduleData: ScheduleSlot[] = [
  {
    time: '08:00 - 10:00',
    days: {
      Lunes: { course: 'Introducción al Cálculo Avanzado', code: 'MAT-301', room: 'Aula 101' },
      Martes: null,
      Miércoles: { course: 'Introducción al Cálculo Avanzado', code: 'MAT-301', room: 'Aula 101' },
      Jueves: null,
      Viernes: null,
    },
  },
  {
    time: '10:00 - 12:00',
    days: {
      Lunes: null,
      Martes: { course: 'Desarrollo Web Full Stack', code: 'CS-405', room: 'Lab 3' },
      Miércoles: null,
      Jueves: { course: 'Desarrollo Web Full Stack', code: 'CS-405', room: 'Lab 3' },
      Viernes: null,
    },
  },
  {
    time: '14:00 - 16:00',
    days: {
      Lunes: null,
      Martes: null,
      Miércoles: { course: 'Historia Contemporánea', code: 'HUM-102', room: 'Aula 204' },
      Jueves: null,
      Viernes: { course: 'Historia Contemporánea', code: 'HUM-102', room: 'Aula 204' },
    },
  },
];

export default function ProgramacionView() {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-white">Programación Académica</h2>
        <p className="text-xs text-slate-400 mt-1">Distribución de horario semanal (4 horas semanales divididas en 2 bloques de 2 horas).</p>
      </div>

      {/* Tabla contenedora */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                <th className="p-4 border-r border-slate-800 w-[16%]">Horario</th>
                {days.map((day) => (
                  <th key={day} className="p-4 border-r border-slate-800 last:border-r-0 w-[16.8%]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {scheduleData.map((slot, index) => (
                <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold font-mono text-slate-300 bg-slate-950/20 border-r border-slate-800">
                    {slot.time}
                  </td>
                  {days.map((day) => {
                    const classItem = slot.days[day];
                    return (
                      <td key={day} className="p-3 border-r border-slate-800 last:border-r-0 align-middle">
                        {classItem ? (
                          <div className="bg-indigo-950/50 border-l-4 border-indigo-500 p-3 rounded-lg text-left shadow-sm border border-indigo-800/40 space-y-1">
                            <strong className="text-xs font-bold text-white block leading-snug">
                              {classItem.course}
                            </strong>
                            <small className="text-[11px] text-slate-400 block font-mono">
                              {classItem.code} — {classItem.room}
                            </small>
                            <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 mt-1">
                              Bloque 2 hrs
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-semibold">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}