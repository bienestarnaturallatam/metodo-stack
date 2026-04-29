-- ============================================================
-- OPTIMIZACIÓN DE BASE DE DATOS - MÉTODO STACK
-- Objetivo: Maximizar capacidad del Plan Gratuito (500MB)
-- ============================================================

-- 1. OPTIMIZACIÓN DE COMPLETIONS (HÁBITOS DIARIOS)
-- Actualmente usa un UUID para cada registro. Eliminarlo ahorra ~16 bytes por fila.
-- Usaremos la combinación (habit_id, date) como PK.

ALTER TABLE public.completions DROP CONSTRAINT IF EXISTS completions_pkey CASCADE;
ALTER TABLE public.completions DROP COLUMN IF EXISTS id;
ALTER TABLE public.completions ADD PRIMARY KEY (habit_id, date);

-- 2. OPTIMIZACIÓN DE TAREAS (WEEKLY_PLANNER_DATA)
-- Si la tabla usa JSONB, podemos optimizar el tamaño de las llaves.
-- Sugerencia: En el código, usar llaves cortas (t=text, d=done, p=priority).

-- Crear un ENUM para prioridades para evitar repetir strings largos en el futuro
-- (Si decides migrar de JSONB a una tabla de tareas normal, lo cual es más eficiente en espacio)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('c', 'i', 'g'); -- critical, important, growth
    END IF;
END$$;

-- 3. ÍNDICES ESENCIALES
-- Eliminar índices redundantes. Supabase crea índices automáticos para PKs.
-- Asegurar que solo existan los necesarios para el filtrado por usuario y fecha.

-- 4. ESTRATEGIA DE ARCHIVADO (MANTENIMIENTO)
-- Crear una tabla de histórico para datos de más de 6 meses.
-- Los datos históricos se pueden comprimir o resumir (ej: % de éxito mensual en lugar de cada día).

CREATE TABLE IF NOT EXISTS public.habit_history_summary (
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id    UUID REFERENCES public.habits(id) ON DELETE CASCADE,
    month       DATE, -- Primer día del mes
    success_rate SMALLINT, -- Porcentaje de cumplimiento
    PRIMARY KEY (habit_id, month)
);

-- Función para resumir y limpiar datos antiguos (Ejecutar mensualmente)
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
DECLARE
    cutoff_date DATE := CURRENT_DATE - INTERVAL '6 months';
BEGIN
    -- 1. Resumir completions en la tabla de historial con precisión
    -- Se calcula el % basado en los días reales de cada mes
    INSERT INTO public.habit_history_summary (user_id, habit_id, month, success_rate)
    SELECT 
        user_id, 
        habit_id, 
        date_trunc('month', date)::DATE as m,
        ROUND(
          COUNT(*) * 100.0 / 
          EXTRACT(DAY FROM (date_trunc('month', date) + interval '1 month - 1 day'))
        )::SMALLINT as success_rate
    FROM public.completions
    WHERE date < cutoff_date
    GROUP BY user_id, habit_id, m
    ON CONFLICT (habit_id, month) DO UPDATE 
    SET success_rate = EXCLUDED.success_rate;

    -- 2. Eliminar datos antiguos (LIBERA ESPACIO)
    DELETE FROM public.completions WHERE date < cutoff_date;
    DELETE FROM public.weekly_planner_data WHERE week_start_date < (cutoff_date - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- 5. PROGRAMACIÓN DE TAREA (CRON)
-- Requiere que la extensión pg_cron esté habilitada en Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Eliminar tarea si ya existe para evitar duplicados
SELECT cron.unschedule('archive-old-data-job') 
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'archive-old-data-job');

-- Programar ejecución: Día 1 de cada mes a las 03:00 AM
SELECT cron.schedule(
    'archive-old-data-job',
    '0 3 1 * *',
    'SELECT archive_old_data()'
);

-- 6. RECOMENDACIONES DE CÓDIGO (JavaScript/TypeScript)
/*
   - No guardar "created_at" dentro de cada tarea del JSONB si no es crítico.
   - Usar 0/1 en lugar de true/false si se guarda como número en JSON.
   - Limitar el largo del nombre del hábito (ya tiene check de 60, está bien).
   - Para gráficas históricas (+6 meses), consultar la tabla 'habit_history_summary'.
*/

