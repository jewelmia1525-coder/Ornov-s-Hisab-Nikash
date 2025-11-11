
import React, { useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper to generate colors
const generateColors = (numColors: number) => {
    const colors = [];
    const baseColors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', 
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];
    for (let i = 0; i < numColors; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
};

interface CategoryPieChartProps {
    transactions: Transaction[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
    const [chartType, setChartType] = useState<'cost' | 'income'>('cost');

    const chartData = useMemo(() => {
        const categoryMap = new Map<string, number>();

        transactions
            .filter(tx => tx.type === chartType)
            .forEach(tx => {
                const currentAmount = categoryMap.get(tx.category) || 0;
                categoryMap.set(tx.category, currentAmount + tx.amount);
            });

        const labels = Array.from(categoryMap.keys());
        const data = Array.from(categoryMap.values());
        const colors = generateColors(labels.length);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors.map(c => `${c}B3`), // 80% opacity
                    borderColor: colors,
                    borderWidth: 1,
                },
            ],
        };
    }, [transactions, chartType]);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'hsl(var(--color-muted-content))',
                    padding: 15,
                    font: {
                        family: "'Hind Siliguri', sans-serif",
                    }
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    const hasData = chartData.datasets[0].data.length > 0;

    return (
        <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 shadow-lg flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4 px-2">
                 <h3 className="font-bangla text-lg font-bold text-base-content">
                    Category Breakdown
                </h3>
                <div className="flex-shrink-0 grid grid-cols-2 gap-1 p-1 bg-base-300/50 rounded-lg">
                    <button
                        onClick={() => setChartType('cost')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'cost' ? 'bg-danger text-white' : 'text-muted-content hover:bg-base-300'}`}
                    >
                        Cost
                    </button>
                    <button
                        onClick={() => setChartType('income')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${chartType === 'income' ? 'bg-success text-white' : 'text-muted-content hover:bg-base-300'}`}
                    >
                        Income
                    </button>
                </div>
            </div>
            <div className="flex-grow relative h-80">
                {hasData ? (
                     <Doughnut data={chartData} options={options} />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-content">
                         <svg className="mx-auto h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-base font-semibold text-base-content font-bangla">
                            {`No ${chartType} data`}
                        </h3>
                        <p className="mt-1 text-xs font-bangla">There are no transactions for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPieChart;
