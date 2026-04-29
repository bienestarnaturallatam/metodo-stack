export const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

/** Number of days in a month */
export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** ISO date string YYYY-MM-DD */
export function toISODate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/** Build a Set of completed dates from a completion array for fast lookup */
export function buildCompletionSet(completions: { date: string }[]): Set<string> {
  return new Set(completions.map(c => c.date));
}
