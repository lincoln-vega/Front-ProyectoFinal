import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, Search, UserRound, BookOpen, Save, CheckCircle2 } from "lucide-react";
import useUsers from "../../hooks/useUsers";
import useCurse from "../../hooks/useCurse";
import { UNIVERSITY_CAREERS, UNIVERSITIES, getCareerName, getUniversityFromCareer } from "../../data/academicCatalog";

const ENROLLMENTS_KEY = "academia_enrollments";
const EMPTY_PAYMENT = { matricula: 0, curso: 0, pagado: 0, metodo: "Yape", estado: "Pendiente" };

const getEnrollments = () => {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "{}");
  } catch {
    return {};
  }
};

const getStudentName = (student) => `${student.nombres || ""} ${student.apellidos || ""}`.trim();

export default function MatriculasPagosPage() {
  const { users, saveUser } = useUsers();
  const { courses } = useCurse();
  const students = useMemo(() => users.filter((user) => String(user.rol).toLowerCase() === "estudiante"), [users]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [enrollmentStatus, setEnrollmentStatus] = useState("Pendiente");
  const [savedMessage, setSavedMessage] = useState("");

  const filteredStudents = useMemo(() => {
    const normalizedTerm = searchTerm.toLowerCase();
    return students.filter((student) => `${getStudentName(student)} ${student.dni}`.toLowerCase().includes(normalizedTerm));
  }, [searchTerm, students]);

  const activeCourses = useMemo(() => courses.filter((course) => course.estado !== "Inactivo"), [courses]);
  const total = Number(payment.matricula || 0) + (selectedCourseIds.length * Number(payment.curso || 0));
  const saldo = Math.max(total - Number(payment.pagado || 0), 0);

  useEffect(() => {
    if (!selectedStudentId && filteredStudents.length) setSelectedStudentId(filteredStudents[0].id);
  }, [filteredStudents, selectedStudentId]);

  useEffect(() => {
    const student = students.find((item) => item.id === selectedStudentId);
    if (!student) return;

    const savedEnrollment = getEnrollments()[student.id] || {};
    const savedStudentData = savedEnrollment.studentData || {};
    const legacyUniversity = getUniversityFromCareer(savedStudentData.carreraObjetivo || student.carreraObjetivo);
    setStudentData({ areaAcademica: "", universidad: legacyUniversity, ...student, ...savedStudentData, universidad: savedStudentData.universidad || legacyUniversity });
    setSelectedCourseIds(savedEnrollment.courseIds || []);
    setPayment({ ...EMPTY_PAYMENT, ...(savedEnrollment.payment || {}) });
    setEnrollmentStatus(savedEnrollment.status || "Pendiente");
    setSavedMessage("");
  }, [selectedStudentId, students]);

  const updateStudentField = (field, value) => {
    setStudentData((current) => field === "universidad"
      ? { ...current, universidad: value, carreraObjetivo: "" }
      : { ...current, [field]: value });
  };

  const toggleCourse = (courseId) => {
    setSelectedCourseIds((current) => current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId]);
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!studentData || !selectedStudentId) return;

    const enrollments = getEnrollments();
    enrollments[selectedStudentId] = {
      studentData,
      courseIds: selectedCourseIds,
      payment: { ...payment, total, saldo },
      status: enrollmentStatus,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    saveUser(studentData, selectedStudentId);
    setSavedMessage("Matrícula y pago guardados correctamente.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-[#1E3A8A]"><CreditCard className="w-5 h-5" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Matrículas y Pagos</h2>
            <p className="text-xs text-slate-500 mt-1">Selecciona un estudiante para asignar cursos y registrar su pago.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 items-start">
        <aside className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden lg:sticky lg:top-5">
          <div className="p-4 border-b border-slate-200">
            <label className="text-xs font-bold text-slate-700">Buscar alumno</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Nombre o DNI" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]" />
            </div>
          </div>
          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <button key={student.id} type="button" onClick={() => setSelectedStudentId(student.id)} className={`w-full text-left p-4 transition-colors ${selectedStudentId === student.id ? "bg-blue-50 border-l-4 border-[#1E3A8A]" : "hover:bg-slate-50 border-l-4 border-transparent"}`}>
                <p className="text-sm font-bold text-slate-800">{getStudentName(student)}</p>
                <p className="text-xs text-slate-500 mt-1">DNI: {student.dni}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{student.carreraObjetivo || "Carrera no registrada"}</p>
              </button>
            ))}
            {!filteredStudents.length && <p className="p-6 text-center text-xs text-slate-400">No se encontraron alumnos.</p>}
          </div>
        </aside>

        <form onSubmit={handleSave} className="space-y-5">
          {!studentData ? (
            <div className="p-10 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">Selecciona un alumno para comenzar.</div>
          ) : (
            <>
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4"><UserRound className="w-4 h-4 text-[#1E3A8A]" /><h3 className="text-sm font-bold text-slate-800">Información del estudiante</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[{ key: "nombres", label: "Nombres" }, { key: "apellidos", label: "Apellidos" }, { key: "dni", label: "DNI" }, { key: "correo", label: "Correo" }, { key: "celular", label: "Celular" }].map(({ key, label }) => (
                    <label key={key} className="text-xs font-semibold text-slate-600">{label}<input value={studentData[key] || ""} onChange={(event) => updateStudentField(key, event.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]" /></label>
                  ))}
                  <label className="text-xs font-semibold text-slate-600">Universidad<select value={studentData.universidad || ""} onChange={(event) => updateStudentField("universidad", event.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"><option value="">Seleccionar universidad</option>{UNIVERSITIES.map((university) => <option key={university} value={university}>{university}</option>)}</select></label>
                  <label className="text-xs font-semibold text-slate-600">Carrera objetivo<select value={getCareerName(studentData.carreraObjetivo)} onChange={(event) => updateStudentField("carreraObjetivo", event.target.value)} disabled={!studentData.universidad || !UNIVERSITY_CAREERS[studentData.universidad]?.length} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"><option value="">{studentData.universidad ? "Seleccionar carrera" : "Selecciona primero la universidad"}</option>{(UNIVERSITY_CAREERS[studentData.universidad] || []).map((career) => <option key={career} value={career}>{career}</option>)}</select></label>
                  {[{ key: "areaAcademica", label: "Área académica" }, { key: "cicloVirtual", label: "Ciclo / periodo" }].map(({ key, label }) => (
                    <label key={key} className="text-xs font-semibold text-slate-600">{label}<input value={studentData[key] || ""} onChange={(event) => updateStudentField(key, event.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]" /></label>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4"><BookOpen className="w-4 h-4 text-[#1E3A8A]" /><h3 className="text-sm font-bold text-slate-800">Cursos que llevará</h3><span className="ml-auto text-xs text-slate-500">{selectedCourseIds.length} seleccionados</span></div>
                <div className="space-y-2">
                  {activeCourses.map((course) => {
                    const selected = selectedCourseIds.includes(course.id);
                    return <label key={course.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selected ? "border-blue-200 bg-blue-50" : "border-slate-200"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleCourse(course.id)} className="accent-[#1E3A8A]" />
                      <span className="flex-1 min-w-0"><strong className="block text-xs text-slate-800 truncate">{course.asignatura}</strong><span className="block text-[11px] text-slate-500 truncate">{course.docente} · {course.horario} · {course.sala}</span></span>
                    </label>;
                  })}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4"><CreditCard className="w-4 h-4 text-[#1E3A8A]" /><h3 className="text-sm font-bold text-slate-800">Matrícula y pagos</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-600">Costo de matrícula<input type="number" min="0" value={payment.matricula} onChange={(event) => setPayment({ ...payment, matricula: event.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal" /></label>
                  <label className="text-xs font-semibold text-slate-600">Costo por curso<input type="number" min="0" value={payment.curso} onChange={(event) => setPayment({ ...payment, curso: event.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal" /></label>
                  <label className="text-xs font-semibold text-slate-600">Monto pagado<input type="number" min="0" value={payment.pagado} onChange={(event) => setPayment({ ...payment, pagado: event.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal" /></label>
                  <label className="text-xs font-semibold text-slate-600">Método de pago<select value={payment.metodo} onChange={(event) => setPayment({ ...payment, metodo: event.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal"><option>Yape</option><option>Plin</option><option>Transferencia</option><option>Efectivo</option></select></label>
                  <label className="text-xs font-semibold text-slate-600">Estado<select value={enrollmentStatus} onChange={(event) => setEnrollmentStatus(event.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-normal"><option>Pendiente</option><option>Matriculado</option><option>Retirado</option></select></label>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-center"><div><p className="text-[11px] text-slate-400">Total</p><p className="text-lg font-bold text-slate-800">S/ {total.toFixed(2)}</p></div><div><p className="text-[11px] text-slate-400">Pagado</p><p className="text-lg font-bold text-emerald-600">S/ {Number(payment.pagado || 0).toFixed(2)}</p></div><div><p className="text-[11px] text-slate-400">Saldo</p><p className="text-lg font-bold text-amber-600">S/ {saldo.toFixed(2)}</p></div></div>
              </section>

              <div className="flex items-center justify-end gap-3"><span className="text-xs text-emerald-600">{savedMessage && <><CheckCircle2 className="inline w-4 h-4 mr-1" />{savedMessage}</>}</span><button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-blue-800"><Save className="w-4 h-4" />Guardar matrícula</button></div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
