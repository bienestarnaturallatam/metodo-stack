'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface Props {
  data: number[];
  days: number;
}

export default function ProgressChart({ data, days }: Props) {
  const labels = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <Line
      data={{
        labels,
        datasets: [{
          data,
          fill: true,
          backgroundColor: 'rgba(45,158,107,0.12)',
          borderColor: '#2d9e6b',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}%` } } },
        scales: {
          y: {
            min: 0, 
            max: 100,
            ticks: { 
              stepSize: 25,
              font: { size: 9, family: 'DM Mono' }, 
              color: '#9e9b90', 
              callback: v => `${v}%` 
            },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
          x: {
            ticks: { 
              font: { size: 9, family: 'DM Mono' }, 
              color: '#9e9b90', 
              autoSkip: true, 
              maxTicksLimit: 31 
            },
            grid: { display: false },
          },
        },
      }}
    />
  );
}
