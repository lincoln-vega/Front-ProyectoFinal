import { useCallback, useEffect, useState } from "react";
import { courseService } from "../services/api";

export default function useCurse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCourses(await courseService.getCourses());
    } catch (requestError) {
      setError(requestError.message || "No se pudieron cargar los cursos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const saveCourse = async (courseData, editingCourse) => {
    setError("");
    if (editingCourse) {
      await courseService.updateCourse(editingCourse.id, courseData);
    } else {
      await courseService.createCourse(courseData);
    }
    await loadCourses();
  };

  const deactivateCourse = async (courseId) => {
    setError("");
    await courseService.deleteCourse(courseId);
    await loadCourses();
  };

  return {
    courses,
    loading,
    error,
    saveCourse,
    deactivateCourse,
    reloadCourses: loadCourses
  };
}
