
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

interface MonthlyChartProps {
    transactions: Transaction[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions }) => {
    
    const chartData = React.useMemo(() => {
        const today = new Date();
        const labels: string[] = [];
        // Get last 12 months including current month
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            labels.push(d.toLocaleDateString('bn-BD', { month: 'short', year: '2-digit' }));
        }
        
        const incomeData = Array(12).fill(0);
        const costData = Array(12).fill(0);
        
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const monthDiff = (today.getFullYear() - txDate.getFullYear()) * 12 + (today.getMonth() - txDate.getMonth());
            
            if (monthDiff >= 0 && monthDiff < 12) {
                const index = 11 - monthDiff;
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
                text: 'মাসিক সারাংশ (গত ১২ মাস)',
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

export default MonthlyChart;
