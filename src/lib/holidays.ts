import Holidays from 'date-holidays';

// Inicializamos con el código de país 'PE' (Perú)
const hd = new Holidays('PE');

// Fallback manual para asegurar que los feriados de Perú 2026 se marquen siempre
const PERU_2026_HOLIDAYS: Record<string, string> = {
  '2026-0-1': 'Año Nuevo',
  '2026-3-2': 'Jueves Santo',
  '2026-3-3': 'Viernes Santo',
  '2026-4-1': 'Día del Trabajo',
  '2026-5-7': 'Día de la Bandera',
  '2026-5-29': 'San Pedro y San Pablo',
  '2026-6-23': 'Día de la Fuerza Aérea',
  '2026-6-28': 'Fiestas Patrias',
  '2026-6-29': 'Fiestas Patrias',
  '2026-7-6': 'Batalla de Junín',
  '2026-7-30': 'Santa Rosa de Lima',
  '2026-9-8': 'Combate de Angamos',
  '2026-10-1': 'Todos los Santos',
  '2026-11-8': 'Inmaculada Concepción',
  '2026-11-9': 'Batalla de Ayacucho',
  '2026-11-25': 'Navidad',
};

export const getHolidayName = (year: number, month: number, day: number) => {
    const key = `${year}-${month}-${day}`;
    if (PERU_2026_HOLIDAYS[key]) return PERU_2026_HOLIDAYS[key];

    // Intento con la librería como respaldo
    const date = new Date(year, month, day, 12, 0, 0);
    const holiday = hd.isHoliday(date);
    return holiday ? (Array.isArray(holiday) ? holiday[0].name : (holiday as any).name) : null;
};
