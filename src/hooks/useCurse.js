import { useState, useEffect } from "react";
import { courseService } from "../services/api";

export const createInitialCourseForm = () => ({
  codigo: "",
  asignatura: "",
  area: "Ciencias Exactas",
  docente: "",
  horario: "",
  sala: "Meet Sala A",
  tipoSala: "meet",
  repositorio: "",
  estado: "Activo"
});

export default function useCurse() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(courseService.getCourses());
  }, []);

  const addCourse = (courseData) => {
    const newCourse = {
      id: `CRS-${String(courses.length + 1).padStart(3, "0")}`,
      ...courseData
    };

    setCourses((currentCourses) => {
      const updatedCourses = [newCourse, ...currentCourses];
      courseService.saveCourses(updatedCourses);
      return updatedCourses;
    });
    return newCourse;
  };

  const updateCourse = (updatedCourse) => {
    setCourses((currentCourses) => {
      const updatedCourses = currentCourses.map((course) => (
        course.id === updatedCourse.id ? updatedCourse : course
      ));
      courseService.saveCourses(updatedCourses);
      return updatedCourses;
    });
  };

  return { courses, addCourse, updateCourse };
}