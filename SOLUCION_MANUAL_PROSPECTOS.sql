-- ============================================================
-- SOLUCION PARA ERROR DE GUARDADO DE PROSPECTOS MANUALES
-- ============================================================
-- El error "violates foreign key constraint profiles_id_fkey" 
-- ocurre porque la tabla 'profiles' intenta verificar que el 
-- usuario exista en la autenticación de Supabase.
--
-- Para permitir agregar prospectos que aún no se han registrado 
-- por su cuenta, ejecuta este comando en el SQL Editor de Supabase:

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Esto permitirá que la administración cree registros manuales
-- sin necesidad de que el usuario haya creado una cuenta primero.
