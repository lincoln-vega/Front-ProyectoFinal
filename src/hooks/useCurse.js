import { useState, useEffect } from "react";
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
  estado: "Activo"
});

export default function useCurse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        // Usamos fetchCourses para traer la data actualizada del backend de FastAPI
        const data = await courseService.fetchCourses();
        setCourses(data || []);
      } catch (error) {
        console.error("Error al cargar cursos en el hook:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const addCourse = async (courseData) => {
    const newCourse = {
      id: `CRS-${String(courses.length + 1).padStart(3, "0")}`,
      ...courseData
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

  return { courses, loading, error, addCourse, updateCourse };
}