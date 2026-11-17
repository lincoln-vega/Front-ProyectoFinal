-- Actualizar restricción chk_users_ciclo para permitir todos los ciclos académicos de la BD
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_ciclo;
ALTER TABLE users ADD CONSTRAINT chk_users_ciclo CHECK (ciclovirtual IS NULL OR length(trim(ciclovirtual)) >= 2);
