-- MIGRACIÓN PARA GEOLOCALIZACIÓN Y TRADUCCIÓN
-- Ejecuta esto en el SQL Editor de Supabase

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'PE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS detected_lang TEXT DEFAULT 'es';

-- Comentario para el admin: Estas columnas permitirán saber desde dónde se registró el usuario
-- y qué idioma se le asignó automáticamente.
