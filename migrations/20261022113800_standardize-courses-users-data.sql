-- 1. Actualizar códigos y datos incompletos en courses
UPDATE courses 
SET id = 'CRS-005', 
    asignatura = 'Matemática II', 
    area = 'Ciencias Exactas', 
    carrera = 'Ingeniería de Sistemas', 
    "docenteId" = 'USR-048778', 
    docente = 'Prof. Juan Gabriel Perez', 
    dias = '["Lunes", "Miércoles"]'::jsonb, 
    "horaInicio" = '10:00', 
    "horaFin" = '12:00', 
    "meetUrl" = 'https://meet.google.com/mat-dos-live', 
    repositorio = 'drive.google.com/mat201', 
    estado = 'Activo', 
    ciclovirtual = 'Semestral' 
WHERE id = '1792466499300';

UPDATE courses 
SET id = 'CRS-006', 
    asignatura = 'Aritmética', 
    area = 'Ciencias Exactas', 
    carrera = 'Ingeniería de Sistemas', 
    "docenteId" = 'USR-002', 
    docente = 'Prof. Carmen Rosa Herrera', 
    dias = '["Martes", "Jueves"]'::jsonb, 
    "horaInicio" = '10:00', 
    "horaFin" = '12:00', 
    "meetUrl" = 'https://meet.google.com/ari-met-live', 
    repositorio = 'drive.google.com/ari101', 
    estado = 'Activo', 
    ciclovirtual = 'Semestral' 
WHERE id = '1792472759422';

UPDATE courses 
SET id = 'CRS-007', 
    asignatura = 'Historia del Perú', 
    area = 'Humanidades y Letras', 
    carrera = 'Derecho', 
    "docenteId" = 'USR-004', 
    docente = 'Dra. Elena Sofía Torres', 
    dias = '["Viernes"]'::jsonb, 
    "horaInicio" = '08:00', 
    "horaFin" = '11:00', 
    "meetUrl" = 'https://meet.google.com/his-per-live', 
    repositorio = 'drive.google.com/his101', 
    estado = 'Activo', 
    ciclovirtual = 'Semestral' 
WHERE id = '1792505167850';

UPDATE courses 
SET id = 'CRS-008', 
    asignatura = 'Historia Mundial', 
    area = 'Humanidades y Letras', 
    carrera = 'Derecho', 
    "docenteId" = 'USR-003', 
    docente = 'Prof. Miguel Ángel Paredes', 
    dias = '["Sábado"]'::jsonb, 
    "horaInicio" = '09:00', 
    "horaFin" = '12:00', 
    "meetUrl" = 'https://meet.google.com/his-mun-live', 
    repositorio = 'drive.google.com/his102', 
    estado = 'Activo', 
    ciclovirtual = 'Semestral' 
WHERE id = '1792505364044';

-- Asegurar ciclo virtual en todos los cursos
UPDATE courses SET ciclovirtual = 'Semestral' WHERE ciclovirtual IS NULL OR ciclovirtual = '';

-- 2. Actualizar y completar users
UPDATE users 
SET "carreraObjetivo" = 'Cátedra de Matemáticas',
    "areaAcademica" = 'Ciencias Exactas',
    celular = '955443322',
    universidad = 'UNI',
    "cursosAsignados" = '[{"id": "CRS-005", "asignatura": "Matemática II"}]'::jsonb,
    ciclovirtual = 'Semestral'
WHERE id = 'USR-048778';

INSERT INTO users (id, apellidos, nombres, dni, "fechaNacimiento", correo, password, celular, universidad, "carreraObjetivo", "areaAcademica", rol, estado, "cursosAsignados", "cursosInscritos", ciclovirtual)
VALUES (
    'USR-008',
    'Torres Sanchez',
    'Jesus Hector',
    '47891234',
    '1987-04-18',
    'j.torres@academia.edu.pe',
    'docente123',
    '911223344',
    'UNI',
    'Cátedra de Programación',
    'Ciencias Exactas',
    'docente',
    'Activo',
    '[{"id": "CRS-004", "asignatura": "Python I"}]'::jsonb,
    '[]'::jsonb,
    'Semestral'
) ON CONFLICT (id) DO UPDATE 
SET "cursosAsignados" = '[{"id": "CRS-004", "asignatura": "Python I"}]'::jsonb,
    ciclovirtual = 'Semestral';

-- Asegurar ciclo virtual en todos los usuarios
UPDATE users SET ciclovirtual = 'Semestral' WHERE ciclovirtual IS NULL OR ciclovirtual = '';

-- 3. Actualizar incidencias
UPDATE incidents 
SET docenteid = 'USR-002', 
    cursoid = 'CRS-001', 
    "fechaPresentacion" = '2026-10-15 07:45 AM'
WHERE id = 'INC-D01';

-- 4. Actualizar asistencias inconsistentes
UPDATE attendance_sessions
SET "cursoId" = 'CRS-004',
    "docenteId" = 'USR-008',
    docente = 'Torres Sanchez Jesus Hector'
WHERE asignatura = 'Python I' AND "cursoId" = 'CRS-001';
