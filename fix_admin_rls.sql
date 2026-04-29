-- ============================================================
-- REPARACIÓN DE PERMISOS (RLS) PARA ADMIN
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Habilitar RLS en profiles (si no lo está)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas restrictivas previas (opcional, cuidado si tienes otras)
-- DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 3. Política para que el Admin vea TODO
-- Reemplaza 'ojhv2015@gmail.com' si el admin cambia en el futuro
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'ojhv2015@gmail.com'
  );

-- 4. Política para que el Admin pueda ACTUALIZAR (activar planes/suspender)
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'ojhv2015@gmail.com'
  );

-- 5. Asegurar que los usuarios normales sigan viendo su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
