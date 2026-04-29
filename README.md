# STACK — Habit Tracker SaaS

Habit tracker minimalista construido con **Next.js 15**, **Tailwind CSS** y **Supabase**.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS (tokens STACK) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email + password) |
| Charts | Chart.js + react-chartjs-2 |
| Fuentes | DM Sans + DM Mono |

---

## Inicio rápido

### 1. Clonar y instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Copia `.env.example` → `.env.local` y llena tus credenciales:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Configurar Auth en Supabase

En el Dashboard de Supabase → **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          # Root layout con fuentes
│   ├── page.tsx            # Redirect según auth
│   ├── globals.css         # Tailwind + estilos base
│   ├── login/page.tsx      # Login / Registro
│   ├── tracker/
│   │   ├── layout.tsx      # Protección de ruta
│   │   └── page.tsx        # Página principal
│   └── auth/callback/      # Callback de email confirm
├── components/
│   ├── TrackerClient.tsx   # Orquestador de estado
│   ├── TopNav.tsx          # Barra de navegación
│   ├── MonthHeader.tsx     # Cabecera con stats del mes
│   ├── AddHabitRow.tsx     # Input para agregar hábitos
│   ├── TrackerTable.tsx    # Tabla principal con checkboxes
│   ├── AnalysisCard.tsx    # Panel de análisis lateral
│   ├── ProgressChart.tsx   # Gráfico de progreso diario
│   ├── MoodChart.tsx       # Gráfico de ánimo/motivación
│   └── DashboardPage.tsx   # Dashboard anual
├── hooks/
│   └── useTracker.ts       # Hooks CRUD de Supabase
└── lib/
    ├── supabase/
    │   ├── client.ts       # Cliente browser
    │   └── server.ts       # Cliente server (SSR)
    ├── types.ts            # Interfaces TypeScript
    └── dateUtils.ts        # Utilidades de fecha
```

---

## Schema de base de datos

```
habits        — id, user_id, name, color, position, archived_at
completions   — id, habit_id, user_id, date  (unique por habit+date)
mood_logs     — id, user_id, date, mood, motivation  (unique por user+date)
profiles      — id, display_name, avatar_url
```

Todas las tablas tienen **Row Level Security** habilitado: cada usuario solo puede ver y modificar sus propios datos.

---

## Deploy en Vercel

```bash
npx vercel --prod
```

Agrega las variables de entorno en el Dashboard de Vercel y actualiza las URLs de redirect en Supabase.
