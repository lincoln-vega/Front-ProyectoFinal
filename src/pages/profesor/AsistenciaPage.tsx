import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  code: string;
  attended: boolean;
}

interface Course {
  id: string;
  title: string;
  code: string;
  professor: string;
}

const initialCourses: Course[] = [
  { id: '1', title: 'Introducción al Cálculo Avanzado', code: 'MAT-301', professor: 'Dra. Elena Ramírez' },
  { id: '2', title: 'Desarrollo Web Full Stack', code: 'CS-405', professor: 'Ing. Carlos Mendoza' },
  { id: '3', title: 'Historia Contemporánea', code: 'HUM-102', professor: 'Lic. Sofía Bernal' },
];

const mockStudents: Student[] = [
  { id: 1, name: 'Juan Pérez', code: 'A202601', attended: false },
  { id: 2, name: 'María García', code: 'A202602', attended: false },
  { id: 3, name: 'Carlos López', code: 'A202603', attended: false },
  { id: 4, name: 'Ana Martínez', code: 'A202604', attended: false },
  { id: 5, name: 'Luis Rodríguez', code: 'A202605', attended: false },
  { id: 6, name: 'Laura Gómez', code: 'A202606', attended: false },
  { id: 7, name: 'Pedro Sánchez', code: 'A202607', attended: false },
  { id: 8, name: 'Sofia Torres', code: 'A202608', attended: false },
  { id: 9, name: 'Diego Flores', code: 'A202609', attended: false },
  { id: 10, name: 'Elena Morales', code: 'A202610', attended: false },
];

export default function AsistenciaView() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>(mockStudents);

  const toggleAttendance = (id: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, attended: !student.attended } : student
      )
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-white">Control de Asistencia</h2>
        <p className="text-xs text-slate-400 mt-1">Selecciona un curso para tomar lista de los estudiantes.</p>
      </div>

      {!selectedCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialCourses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
              onClick={() => setSelectedCourse(course)}
            >
              <div>
                <h3 className="font-bold text-white text-sm">{course.title}</h3>
                <p className="mt-1"><span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">{course.code}</span></p>
                <span className="block text-xs text-slate-400 mt-3">{course.professor}</span>
              </div>
              <button
                type="button"
                className="mt-5 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Tomar Asistencia
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedCourse.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                <span className="font-mono text-slate-300">{selectedCourse.code}</span> — {selectedCourse.professor}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 self-start sm:self-auto"
            >
              ← Volver a Cursos
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                  <th className="p-4 w-1/5">Código</th>
                  <th className="p-4 w-[35%]">Estudiante</th>
                  <th className="p-4 w-[25%] text-center">Asistencia</th>
                  <th className="p-4 w-1/5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">
                        {student.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <strong className="text-xs font-semibold text-white">{student.name}</strong>
                    </td>
                    
                    {/* Trigger / Switch Interactivo */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(student.id)}
                        className={`w-14 h-7 rounded-full border-none cursor-pointer relative transition-colors duration-200 p-0.5 inline-flex items-center shadow-inner ${
                          student.attended ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white transition-transform duration-200 shadow-md ${
                            student.attended ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Estado fijado para evitar saltos de layout */}
                    <td className="p-4 text-center">
                      <span 
                        className={`inline-block w-[90px] text-center px-2 py-1 rounded-md text-[11px] font-semibold border ${
                          student.attended 
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' 
                            : 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                        }`}
                      >
                        {student.attended ? 'Sí, asistió' : 'No asistió'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}