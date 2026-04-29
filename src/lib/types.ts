export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  archived_at: string | null;
}

export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // ISO date YYYY-MM-DD
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  mood: number | null;
  motivation: number | null;
  updated_at: string;
}

export interface MonthStats {
  month: number;
  year: number;
  completed: number;
  total: number;
  pct: number;
}
