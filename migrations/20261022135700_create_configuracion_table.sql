CREATE TABLE IF NOT EXISTS public.configuracion (
    id text PRIMARY KEY DEFAULT 'general',
    institucion_nombre text DEFAULT 'Academia Preuniversitaria S.A.C.',
    institucion_ruc text DEFAULT '20608912345',
    institucion_direccion text DEFAULT 'Av. Universitaria 1234, Lima, Perú',
    institucion_telefono text DEFAULT '+51 987 654 321',
    institucion_correo text DEFAULT 'contacto@academia.edu.pe',
    ciclo_vigente text DEFAULT 'Semestral 2026-I',
    ciclo_inicio text DEFAULT '2026-01-15',
    ciclo_fin text DEFAULT '2026-07-31',
    ciclo_estado text DEFAULT 'En Curso',
    tarifa_hora_docente numeric(10,2) DEFAULT 50.00,
    tolerancia_tardanza_min integer DEFAULT 15,
    horas_descuento_inasistencia numeric(5,2) DEFAULT 2.00,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracion_read_all" ON public.configuracion;
CREATE POLICY "configuracion_read_all" ON public.configuracion
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "configuracion_admin_all" ON public.configuracion;
CREATE POLICY "configuracion_admin_all" ON public.configuracion
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

INSERT INTO public.configuracion (
    id,
    institucion_nombre,
    institucion_ruc,
    institucion_direccion,
    institucion_telefono,
    institucion_correo,
    ciclo_vigente,
    ciclo_inicio,
    ciclo_fin,
    ciclo_estado,
    tarifa_hora_docente,
    tolerancia_tardanza_min,
    horas_descuento_inasistencia
) VALUES (
    'general',
    'Academia Preuniversitaria S.A.C.',
    '20608912345',
    'Av. Universitaria 1234, Lima, Perú',
    '+51 987 654 321',
    'contacto@academia.edu.pe',
    'Semestral 2026-I',
    '2026-01-15',
    '2026-07-31',
    'En Curso',
    50.00,
    15,
    2.00
) ON CONFLICT (id) DO NOTHING;
