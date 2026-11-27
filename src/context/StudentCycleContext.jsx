import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { userService, matriculaService, academicosService, parseCourseList } from "../services/api";
import { courseService } from "../services/cursosServices";

const StudentCycleContext = createContext(null);

const CLOSED_STATES = new Set(["finalizado", "cerrado", "concluido", "inactivo"]);

export function StudentCycleProvider({ children }) {
  const [loadingCycle, setLoadingCycle] = useState(true);
  const [errorCycle, setErrorCycle] = useState("");
  const [studentProfile, setStudentProfile] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [allCycles, setAllCycles] = useState([]);
  const [studentMatriculas, setStudentMatriculas] = useState([]);
  const [selectedCycleId, setSelectedCycleIdState] = useState("");

  const userEmail =
    typeof window !== "undefined" ? (localStorage.getItem("userEmail") || "").trim().toLowerCase() : "";

  const storageKey = `student_selected_cycle_${userEmail || "anon"}`;

  useEffect(() => {
    let cancelled = false;

    async function loadCycleContext() {
      if (!userEmail) {
        setLoadingCycle(false);
        return;
      }

      try {
        setLoadingCycle(true);
        setErrorCycle("");

        const [perfil, cursos, matriculas, ciclos] = await Promise.all([
          userService.getUserByEmail(userEmail),
          courseService.getCourses().catch(() => []),
          matriculaService.getMatriculas().catch(() => []),
          academicosService.getCiclos().catch(() => [])
        ]);

        if (cancelled) return;

        if (!perfil) {
          throw new Error("No se encontró el perfil del estudiante en la plataforma.");
        }

        setStudentProfile(perfil);
        setAllCourses(Array.isArray(cursos) ? cursos : []);
        setAllCycles(Array.isArray(ciclos) ? ciclos : []);

        const studentFullName = `${perfil.nombres || ""} ${perfil.apellidos || ""}`.trim().toLowerCase();
        const myMats = (Array.isArray(matriculas) ? matriculas : []).filter((m) => {
          if (perfil.id && (m.estudianteId === perfil.id || m.estudiante_id === perfil.id)) return true;
          if (perfil.dni && m.dni && String(m.dni).trim() === String(perfil.dni).trim()) return true;
          if (m.correo && String(m.correo).trim().toLowerCase() === userEmail) return true;
          if (studentFullName && String(m.estudiante || "").toLowerCase().includes(studentFullName)) return true;
          return false;
        });

        setStudentMatriculas(myMats);
      } catch (err) {
        if (!cancelled) {
          console.error("[StudentCycleContext] Error cargando ciclos del estudiante:", err);
          setErrorCycle(err.message || "No se pudo cargar la información de tu ciclo académico.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCycle(false);
        }
      }
    }

    loadCycleContext();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  // Construir los ciclos en los que el alumno efectivamente estuvo o está matriculado
  const availableStudentCycles = useMemo(() => {
    const cyclesById = new Map((allCycles || []).map((c) => [String(c.id), c]));
    const cyclesByName = new Map(
      (allCycles || []).map((c) => [String(c.nombre || "").trim().toLowerCase(), c])
    );

    const profileEnrolledIds = new Set(
      parseCourseList(
        studentProfile?.cursosInscritos ||
          studentProfile?.cursos_inscritos ||
          studentProfile?.CursosInscritos
      )
    );

    if (studentMatriculas.length > 0) {
      const built = studentMatriculas.map((mat) => {
        const matchedCycle =
          (mat.cicloId && cyclesById.get(String(mat.cicloId))) ||
          cyclesByName.get(String(mat.ciclo || "").trim().toLowerCase()) ||
          null;

        const cid = matchedCycle?.id || mat.cicloId || `MAT-CIC-${mat.id}`;
        const cNombre = matchedCycle?.nombre || mat.ciclo || "Ciclo Académico";
        const cEstado = matchedCycle?.estado || mat.cicloEstado || "En Curso";
        const isClosed = CLOSED_STATES.has(String(cEstado).trim().toLowerCase());

        // Cursos específicos de esta matrícula; si la matrícula no tenía lista explícita, filtrar cursos del perfil que pertenezcan a este ciclo
        const matCourseIds = parseCourseList(mat.cursosInscritos);
        let effectiveCourseIds;
        if (matCourseIds.length > 0) {
          effectiveCourseIds = new Set(matCourseIds);
        } else {
          effectiveCourseIds = new Set(
            (allCourses || [])
              .filter((course) => {
                if (!profileEnrolledIds.has(String(course.id))) return false;
                if (course.cicloId && String(course.cicloId) === String(cid)) return true;
                const cVirt = String(course.cicloVirtual || course.ciclovirtual || "").toLowerCase();
                return cVirt && cNombre.toLowerCase().includes(cVirt);
              })
              .map((c) => String(c.id))
          );
        }

        const coursesForCycle = (allCourses || []).filter((course) => {
          if (!effectiveCourseIds.has(String(course.id))) return false;
          // En ciclos activos ocultamos cursos dados de baja ('Inactivo'); en ciclos finalizados mostramos sus cursos históricos ('Finalizado' / 'Activo')
          if (!isClosed) return String(course.estado || "Activo").toLowerCase() === "activo";
          return String(course.estado || "").toLowerCase() !== "inactivo";
        });

        return {
          id: String(cid),
          codigo: matchedCycle?.codigo || cid,
          nombre: cNombre,
          estado: cEstado,
          isReadOnly: isClosed,
          fechaInicio: matchedCycle?.fecha_inicio || mat.cicloFechaInicio || null,
          fechaFin: matchedCycle?.fecha_fin || mat.cicloFechaFin || null,
          turno: mat.turno || "Mañana",
          programa: mat.programa || studentProfile?.carreraObjetivo || "",
          matricula: mat,
          courses: coursesForCycle
        };
      });

      // Ordenar: primero ciclos activos ("En Curso"), después ciclos concluidos ("Finalizado")
      return built.sort((a, b) => Number(a.isReadOnly) - Number(b.isReadOnly));
    }

    // Respaldo para alumnos recién creados que aún tienen cursosInscritos en perfil sin fila en matriculas
    if (studentProfile) {
      const fallbackName = studentProfile.cicloVirtual || studentProfile.ciclovirtual || "Ciclo Vigente";
      const matched = cyclesByName.get(String(fallbackName).trim().toLowerCase());
      const cEstado = matched?.estado || "En Curso";
      const isClosed = CLOSED_STATES.has(String(cEstado).toLowerCase());
      const coursesForCycle = (allCourses || []).filter(
        (c) => profileEnrolledIds.has(String(c.id)) && String(c.estado || "").toLowerCase() !== "inactivo"
      );

      return [
        {
          id: String(matched?.id || "CIC-PERFIL"),
          codigo: matched?.codigo || "ACTUAL",
          nombre: matched?.nombre || fallbackName,
          estado: cEstado,
          isReadOnly: isClosed,
          fechaInicio: matched?.fecha_inicio || null,
          fechaFin: matched?.fecha_fin || null,
          turno: "Regular",
          programa: studentProfile.carreraObjetivo || "",
          matricula: null,
          courses: coursesForCycle
        }
      ];
    }

    return [];
  }, [allCycles, allCourses, studentMatriculas, studentProfile]);

  // Inicializar o validar el ciclo seleccionado
  useEffect(() => {
    if (availableStudentCycles.length === 0) return;

    const savedId = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;
    if (savedId && availableStudentCycles.some((c) => c.id === savedId)) {
      setSelectedCycleIdState(savedId);
      return;
    }

    const firstActive = availableStudentCycles.find((c) => !c.isReadOnly) || availableStudentCycles[0];
    if (firstActive) {
      setSelectedCycleIdState(firstActive.id);
    }
  }, [availableStudentCycles, storageKey]);

  const setSelectedCycleId = (newId) => {
    setSelectedCycleIdState(newId);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, newId);
    }
  };

  const selectedCycle = useMemo(() => {
    if (availableStudentCycles.length === 0) return null;
    return (
      availableStudentCycles.find((c) => c.id === selectedCycleId) ||
      availableStudentCycles[0]
    );
  }, [availableStudentCycles, selectedCycleId]);

  const selectActiveCycle = () => {
    const active = availableStudentCycles.find((c) => !c.isReadOnly);
    if (active) setSelectedCycleId(active.id);
  };

  const value = useMemo(
    () => ({
      loadingCycle,
      errorCycle,
      studentProfile,
      allCourses,
      availableStudentCycles,
      selectedCycle,
      selectedCycleId: selectedCycle?.id || "",
      setSelectedCycleId,
      selectActiveCycle,
      isReadOnlyHistory: Boolean(selectedCycle?.isReadOnly),
      cycleCourses: selectedCycle?.courses || [],
      activeMatricula: selectedCycle?.matricula || null
    }),
    [loadingCycle, errorCycle, studentProfile, allCourses, availableStudentCycles, selectedCycle]
  );

  return <StudentCycleContext.Provider value={value}>{children}</StudentCycleContext.Provider>;
}

export function useStudentCycle() {
  const ctx = useContext(StudentCycleContext);
  if (!ctx) {
    throw new Error("useStudentCycle debe usarse dentro de StudentCycleProvider.");
  }
  return ctx;
}
