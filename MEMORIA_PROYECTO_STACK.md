# 🧠 Memoria Integral y Manual de Operaciones - Ecosistema MÉTODO STACK
**Última Actualización:** 27 de Abril, 2026
**Estado del Proyecto:** Operativo / Versión 2.0 (Planner & Finance Upgrade)

Este documento es la fuente de verdad técnica y funcional del SaaS MÉTODO STACK, detallando cada módulo, su lógica de negocio y la infraestructura que lo sostiene.

---

## 1. 🏗️ Arquitectura y Filosofía de Diseño
- **Tecnología Core:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend & Realtime:** Supabase (Auth, Postgres, RLS).
- **Estética "Brutalidad Clínica":** Un sistema de diseño premium que alterna entre un **Modo Oscuro Estratégico** (Administración) y un **Modo Claro "Planner"** (Usuario Final) con acentos en Verde Institucional (`#2d5a3d`).
- **I18n (Internacionalización):** Soporte completo para **Español, Inglés y Portugués** mediante un sistema de diccionarios JSON.

---

## 2. 📊 Módulo: Control de Hábitos (Habit Tracker)
El motor de disciplina del usuario.
- **Seguimiento Diario:** Check-ins interactivos de hábitos con cálculo de impacto en tiempo real.
- **Visualización de Progreso:** Gráficos de líneas y heatmaps de rachas (streaks) para mantener el impulso.
- **Categorización:** Separación de hábitos por pilares de vida.
- **Responsive:** Diseñado para uso móvil tipo PWA, facilitando el check-in rápido desde el smartphone.

---

## 3. 🗓️ Módulo: Enfoque Semanal (Weekly Planner)
El centro de organización táctica.
- **Planificación de 7 Días:** Vista de semana completa para distribución de carga de trabajo.
- **Gestión de Prioridades:** Clasificación de tareas en Críticas, Importantes y de Crecimiento.
- **Interfaz "Planner":** Estética limpia con tarjetas blancas y bordes redondeados (`32px`), diseñada para reducir la fatiga cognitiva.

---

## 4. 💰 Módulo: Finanzas Personales (Financial Planner)
Un sistema de gestión financiera de acceso libre con capacidad analítica avanzada.
- **Dashboard de Informe Anual:** 
    - Métricas clave: Ingresos Totales, Egresos, Saldo Anual y Promedio Mensual.
    - Gráfico comparativo de barras (Ingresos vs Egresos) mes a mes.
- **Gestión de Transacciones:**
    - Registro de Ingresos y Egresos con selección de fecha histórica.
    - **Categorización Inteligente:** Clasificación en gastos **Fijos** (Renta, Luz) y **Variables**.
    - **Semáforo de Presupuesto:** Comparativa visual entre Presupuesto Planeado vs Gasto Real (Verde: Cumple / Rojo: Excedido).
- **Ahorros y Deudas:**
    - **Metas de Ahorro:** Progress circles dinámicos para seguimiento de objetivos (ej. Fondo de Emergencia).
    - **Liquidación de Deudas:** Barras de progreso para el pago de deudas con indicadores de porcentaje pagado.
- **Inteligencia Financiera:** Widget de "Días de Supervivencia" que calcula el presupuesto diario seguro hasta fin de mes.

---

## 5. 👑 Módulo: Strategic Center (Admin Dashboard)
Consola de alto rendimiento para la administración del SaaS.
- **Gestión de Leads (Prospectos):** Sistema desacoplado de `auth.users` para captar interesados solo con WhatsApp/Email.
- **Control de Clientes:** Activación de licencias anuales con cálculo automático de expiración.
- **Business Intelligence de Ventas:**
    - Monitoreo en vivo de recaudación diaria en **Soles (S/)** y **Dólares ($)**.
    - Reportes históricos con selectores de mes/año (2024-2030).
- **WhatsApp Tactical:** Sistema de comunicación rápida con plantillas predefinidas para bienvenida, cobros y soporte.
- **Seguridad y Sesiones:** Monitoreo de dispositivos activos y límite de sesiones (0/3) para evitar el uso compartido de cuentas.

---

## 6. 🛠️ Infraestructura de Datos (Supabase)
Tablas clave y seguridad:
- `profiles`: Datos de usuario y planes.
- `habits`: Registro de hábitos y metas.
- `finances`: Lógica de ingresos, egresos, metas y deudas (con RLS por `user_id`).
- `admin_leads`: Registro de prospectos y ventas manuales.
- **RLS (Row Level Security):** Configurado para que ningún usuario pueda acceder a los datos financieros o de hábitos de otro.

---

## 7. 📥 Herramientas de Exportación
- **Motor de Excel (XLS):** Generación de reportes limpios con formato CSS embebido para respetar tipos de datos (teléfonos, fechas) sin alteraciones por parte de Microsoft Excel.

---
**Nota Final:** MÉTODO STACK no es solo un software, es un sistema operativo para la superación personal y la gestión estratégica. Cada actualización está diseñada para reforzar la coherencia visual y la utilidad práctica del usuario.
