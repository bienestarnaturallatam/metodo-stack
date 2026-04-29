-- ============================================================
-- MIGRATION: Control de Sesiones y Auditoría
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Añadir columnas de auditoría a la tabla profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_sign_in_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_agent        TEXT,
  ADD COLUMN IF NOT EXISTS is_flagged        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS session_count     INT     DEFAULT 0;

-- 2. Tabla de sesiones activas (para control de 3 dispositivos)
CREATE TABLE IF NOT EXISTS user_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT       NOT NULL,
  user_agent   TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para consultas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
  ON user_sessions(user_id);

-- 3. Row Level Security: solo el admin puede leer todas las sesiones
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
  ON user_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Función para limpiar sesiones expiradas (más de 7 días sin actividad)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE last_seen_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
