
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Transaction } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeeklyChartProps {
    transactions: Transaction[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ transactions }) => {
    
    const chartData = React.useMemo(() => {
        const today = new Date();
        const labels: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('bn-BD', { weekday: 'short' }));
        }
        
        const incomeData = Array(7).fill(0);
        const costData = Array(7).fill(0);
        
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const diffTime = today.getTime() - txDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays < 7) {
                const index = 6 - diffDays;
                if (tx.type === 'income') {
                    incomeData[index] += tx.amount;
                } else {
                    costData[index] += tx.amount;
                }
            }
        });
        
        return {
            labels,
            datasets: [
                {
                    label: 'আয়',
                    data: incomeData,
                    backgroundColor: '#4ade80',
                    borderRadius: 4,
                },
                {
                    label: 'খরচ',
                    data: costData,
                    backgroundColor: '#f87171',
                    borderRadius: 4,
                },
            ],
        };
    }, [transactions]);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: 'hsl(var(--color-base-content))', font: { family: "'Hind Siliguri', sans-serif" } },
            },
            title: {
                display: true,
                text: 'সাপ্তাহিক সারাংশ',
                color: 'hsl(var(--color-base-content))',
                font: { size: 18, family: "'Hind Siliguri', sans-serif" },
            },
        },
        scales: {
            y: {
                grid: { color: 'hsl(var(--color-primary)/0.1)' },
                ticks: { 
                    color: 'hsl(var(--color-muted-content))',
                    callback: (value: string | number) => `৳${Number(value).toLocaleString('bn-BD')}`
                },
            },
            x: {
                grid: { display: false },
                ticks: { 
                    color: 'hsl(var(--color-muted-content))',
                    font: { family: "'Hind Siliguri', sans-serif" }
                },
            },
        },
    };

    return <Bar options={options} data={chartData} />;
};

export default WeeklyChart;
