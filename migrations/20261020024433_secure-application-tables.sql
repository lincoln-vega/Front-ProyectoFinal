CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT u.id
  FROM public.users AS u
  WHERE lower(u.correo) = lower(auth.jwt() ->> 'email')
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT lower(u.rol)
  FROM public.users AS u
  WHERE lower(u.correo) = lower(auth.jwt() ->> 'email')
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_app_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT coalesce(public.current_app_role() IN ('admin', 'administrador'), false)
$$;

CREATE OR REPLACE FUNCTION public.get_teacher_student_count(course_ids text[])
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT count(DISTINCT student.id)::integer
  FROM public.users AS student
  WHERE lower(student.rol) = 'estudiante'
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(student."cursosInscritos") = 'array' THEN student."cursosInscritos"
          ELSE '[]'::jsonb
        END
      ) AS enrollment
      JOIN public.courses AS course ON course.id = enrollment.value ->> 'id'
      WHERE course.id = ANY(course_ids)
        AND course."docenteId" = public.current_app_user_id()
    )
    AND (
      public.current_app_is_admin()
      OR public.current_app_role() = 'docente'
    )
$$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_app_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_teacher_student_count(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_app_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_student_count(text[]) TO authenticated;

DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
DROP POLICY IF EXISTS "Allow all access to courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all access to incidents" ON public.incidents;
DROP POLICY IF EXISTS "Allow all access to attendance_sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "users_read_self_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_admin_insert" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_delete" ON public.users;
DROP POLICY IF EXISTS "courses_read_authenticated" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_update" ON public.courses;
DROP POLICY IF EXISTS "courses_admin_delete" ON public.courses;
DROP POLICY IF EXISTS "incidents_read_admin_or_owner" ON public.incidents;
DROP POLICY IF EXISTS "incidents_teacher_insert" ON public.incidents;
DROP POLICY IF EXISTS "incidents_admin_update" ON public.incidents;
DROP POLICY IF EXISTS "incidents_admin_delete" ON public.incidents;
DROP POLICY IF EXISTS "attendance_read_admin_or_teacher" ON public.attendance_sessions;
DROP POLICY IF EXISTS "attendance_teacher_insert" ON public.attendance_sessions;
DROP POLICY IF EXISTS "attendance_teacher_update" ON public.attendance_sessions;
DROP POLICY IF EXISTS "attendance_admin_delete" ON public.attendance_sessions;
DROP POLICY IF EXISTS "matriculas_admin_all" ON public.matriculas;
DROP POLICY IF EXISTS "pagos_admin_all" ON public.pagos;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.courses, public.incidents, public.attendance_sessions, public.matriculas, public.pagos FROM anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT (
  id, apellidos, nombres, dni, "fechaNacimiento", correo, celular,
  universidad, "carreraObjetivo", "areaAcademica", rol, estado,
  "cursosAsignados", "cursosInscritos", created_at
) ON public.users TO authenticated;
GRANT INSERT (
  id, apellidos, nombres, dni, "fechaNacimiento", correo, celular,
  universidad, "carreraObjetivo", "areaAcademica", rol, estado,
  "cursosAsignados", "cursosInscritos"
) ON public.users TO authenticated;
GRANT UPDATE (
  apellidos, nombres, dni, "fechaNacimiento", correo, celular,
  universidad, "carreraObjetivo", "areaAcademica", rol, estado,
  "cursosAsignados", "cursosInscritos"
) ON public.users TO authenticated;
GRANT DELETE ON public.users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.courses, public.incidents, public.attendance_sessions,
  public.matriculas, public.pagos TO authenticated;

CREATE POLICY users_read_self_or_admin ON public.users
  FOR SELECT TO authenticated
  USING (
    public.current_app_is_admin()
    OR lower(correo) = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY users_admin_insert ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY users_admin_update ON public.users
  FOR UPDATE TO authenticated
  USING (public.current_app_is_admin())
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY users_admin_delete ON public.users
  FOR DELETE TO authenticated
  USING (public.current_app_is_admin());

CREATE POLICY courses_read_authenticated ON public.courses
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY courses_admin_insert ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY courses_admin_update ON public.courses
  FOR UPDATE TO authenticated
  USING (public.current_app_is_admin())
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY courses_admin_delete ON public.courses
  FOR DELETE TO authenticated
  USING (public.current_app_is_admin());

CREATE POLICY incidents_read_admin_or_owner ON public.incidents
  FOR SELECT TO authenticated
  USING (
    public.current_app_is_admin()
    OR (
      public.current_app_role() = 'docente'
      AND lower(correo) = lower(auth.jwt() ->> 'email')
    )
  );
CREATE POLICY incidents_teacher_insert ON public.incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() = 'docente'
    AND lower(correo) = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY incidents_admin_update ON public.incidents
  FOR UPDATE TO authenticated
  USING (public.current_app_is_admin())
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY incidents_admin_delete ON public.incidents
  FOR DELETE TO authenticated
  USING (public.current_app_is_admin());

CREATE POLICY attendance_read_admin_or_teacher ON public.attendance_sessions
  FOR SELECT TO authenticated
  USING (
    public.current_app_is_admin()
    OR (
      public.current_app_role() = 'docente'
      AND "docenteId" = public.current_app_user_id()
    )
  );
CREATE POLICY attendance_teacher_insert ON public.attendance_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() = 'docente'
    AND "docenteId" = public.current_app_user_id()
  );
CREATE POLICY attendance_teacher_update ON public.attendance_sessions
  FOR UPDATE TO authenticated
  USING (
    public.current_app_role() = 'docente'
    AND "docenteId" = public.current_app_user_id()
  )
  WITH CHECK (
    public.current_app_role() = 'docente'
    AND "docenteId" = public.current_app_user_id()
  );
CREATE POLICY attendance_admin_delete ON public.attendance_sessions
  FOR DELETE TO authenticated
  USING (public.current_app_is_admin());

CREATE POLICY matriculas_admin_all ON public.matriculas
  FOR ALL TO authenticated
  USING (public.current_app_is_admin())
  WITH CHECK (public.current_app_is_admin());
CREATE POLICY pagos_admin_all ON public.pagos
  FOR ALL TO authenticated
  USING (public.current_app_is_admin())
  WITH CHECK (public.current_app_is_admin());
