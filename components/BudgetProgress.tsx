

import React, { useMemo } from 'react';
import { Transaction, Budget } from '../types';

interface BudgetProgressProps {
    transactions: Transaction[];
    budgets: Budget[];
    onOpenBudgetModal: () => void;
}

const BudgetProgressItem: React.FC<{ category: string; spent: number; budget: number }> = ({ category, spent, budget }) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    let progressBarColor = 'bg-success';
    if (percentage > 95) {
        progressBarColor = 'bg-danger';
    } else if (percentage > 75) {
        progressBarColor = 'bg-yellow-500';
    }

    const formatCurrency = (num: number) => `৳${num.toLocaleString('bn-BD')}`;

    return (
        <div className="bg-base-300/40 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-base-content">{category}</span>
                <span className="font-mono text-muted-content">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
            </div>
            <div className="w-full bg-base-100 rounded-full h-2.5">
                <div 
                    className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            {percentage > 100 && (
                <p className="text-xs text-danger text-right mt-1 font-semibold">
                    Overspent by {formatCurrency(spent - budget)}!
                </p>
            )}
        </div>
    );
};


const BudgetProgress: React.FC<BudgetProgressProps> = ({ transactions, budgets, onOpenBudgetModal }) => {
    
    const monthlySpending = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const spendingMap = new Map<string, number>();

        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (tx.type === 'cost' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                const currentAmount = spendingMap.get(tx.category) || 0;
                spendingMap.set(tx.category, currentAmount + tx.amount);
            }
        });
        return spendingMap;
    }, [transactions]);

    if (budgets.length === 0) {
      return (
        <section aria-labelledby="budget-title" className="bg-base-200 border border-dashed border-primary/20 rounded-2xl p-5 shadow-lg text-center flex flex-col items-center justify-center">
            <h2 id="budget-title" className="font-bangla text-xl font-bold text-base-content mb-2">Monthly Budgets</h2>
            <p className="text-muted-content text-sm">You haven't set any budgets yet.</p>
            <button 
                onClick={onOpenBudgetModal} 
                className="mt-4 px-5 py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all text-sm"
            >
                Set Your First Budget
            </button>
        </section>
      )
    }

    return (
        <section aria-labelledby="budget-title" className="bg-base-200 border border-primary/20 rounded-2xl p-5 shadow-lg">
            <h2 id="budget-title" className="font-bangla text-xl font-bold text-base-content mb-4">Monthly Budget Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map(budget => (
                    <BudgetProgressItem 
                        key={budget.category}
                        category={budget.category}
                        budget={budget.amount}
                        spent={monthlySpending.get(budget.category) || 0}
                    />
                ))}
            </div>
        </section>
    );
};

export default BudgetProgress;