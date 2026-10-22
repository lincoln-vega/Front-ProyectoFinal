import { useState, useEffect, useCallback } from "react";
import { courseService } from "../services/cursosServices";

export const createInitialCourseForm = () => ({
  codigo: "",
  asignatura: "",
  area: "Ciencias Exactas",
  carrera: "Ingeniería de Sistemas",
  docenteId: "",
  docente: "",
  dias: [],
  horaInicio: "08:00",
  horaFin: "10:00",
  meetUrl: "",
  repositorio: "",
  ciclovirtual: "Semestral",
  estado: "Activo"
});

export default function useCurse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await courseService.fetchCourses();
      setCourses(data || []);
      return data;
    } catch (err) {
      console.error("Error al cargar cursos en el hook:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const addCourse = async (courseData) => {
    const cleanId = (courseData.id && String(courseData.id).startsWith("CRS-"))
      ? courseData.id
      : `CRS-${String(courses.length + 1).padStart(3, "0")}`;

    const newCourse = {
      ciclovirtual: "Semestral",
      ...courseData,
      id: cleanId
    };

    const savedCourses = await courseService.saveCourses([newCourse]);
    setCourses((current) => [savedCourses[0] || newCourse, ...current]);
    return newCourse;
  };

  const updateCourse = async (updatedCourse) => {
    const savedCourses = await courseService.saveCourses([updatedCourse]);
    setCourses((current) => current.map((course) => (
      course.id === updatedCourse.id ? savedCourses[0] || updatedCourse : course
    )));
  };

  return { courses, loading, error, addCourse, updateCourse, refreshCourses };
}
