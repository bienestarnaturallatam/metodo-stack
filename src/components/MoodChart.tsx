'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { daysInMonth, toISODate } from '@/lib/dateUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
  moodMap: Map<string, { mood: number | null; motivation: number | null }>;
  month: number;
  year: number;
}

export default function MoodChart({ moodMap, month, year }: Props) {
  const days   = daysInMonth(month, year);
  const labels = Array.from({ length: days }, (_, i) => i + 1);

  const moodData = labels.map(d => {
    const v = moodMap.get(toISODate(year, month, d))?.mood;
    return v ?? null;
  });
  const motData = labels.map(d => {
    const v = moodMap.get(toISODate(year, month, d))?.motivation;
    return v ?? null;
  });

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Ánimo',
            data: moodData,
            fill: true,
            backgroundColor: 'rgba(201,79,122,0.10)',
            borderColor: '#c94f7a',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#c94f7a',
            pointBorderWidth: 0,
            tension: 0.4,
            spanGaps: true,
            clip: false,
          },
          {
            label: 'Motivación',
            data: motData,
            fill: false,
            borderColor: '#3a7bc8',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#3a7bc8',
            pointBorderWidth: 0,
            tension: 0.4,
            spanGaps: true,
            clip: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 5, left: 10, right: 10 } },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 5.5,
            ticks: { font: { size: 9, family: 'DM Mono' }, color: '#9e9b90', stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          x: {
            ticks: { font: { size: 9, family: 'DM Mono' }, color: '#9e9b90', autoSkip: true, maxTicksLimit: 12 },
            grid: { display: false },
          },
        },
      }}
    />
  );
}
