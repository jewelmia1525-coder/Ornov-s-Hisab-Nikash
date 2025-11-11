

import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface SummaryCardsProps {
    transactions: Transaction[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
    const { totalBalance, monthlyIncome, monthlyCost } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let totalIncome = 0;
        let totalCost = 0;
        let monthlyIncome = 0;
        let monthlyCost = 0;

        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (tx.type === 'income') {
                totalIncome += tx.amount;
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    monthlyIncome += tx.amount;
                }
            } else {
                totalCost += tx.amount;
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    monthlyCost += tx.amount;
                }
            }
        });
        const totalBalance = totalIncome - totalCost;
        return { totalBalance, monthlyIncome, monthlyCost };
    }, [transactions]);
    
    const formatCurrency = (num: number) => `৳${num.toLocaleString('bn-BD')}`;

    return (
        <>
            <div className="bg-base-200 border border-primary/20 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col justify-end text-center min-h-[150px]">
                <div className="pb-2">
                    <h2 className="font-bangla text-lg font-semibold text-muted-content">মোট ব্যালেন্স</h2>
                    <p className={`font-bangla text-4xl sm:text-5xl font-bold my-2 drop-shadow-[0_2px_5px_hsl(var(--color-primary)/0.5)] transition-colors ${totalBalance < 0 ? 'text-danger' : 'text-primary'}`}>
                        {formatCurrency(totalBalance)}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-base-200 border border-primary/20 rounded-2xl p-5 shadow-lg border-l-4 border-l-success">
                    <h3 className="font-bangla text-lg text-muted-content">মাসিক আয়</h3>
                    <p className="font-bangla text-3xl font-bold text-success mt-1">{formatCurrency(monthlyIncome)}</p>
                </div>
                 <div className="bg-base-200 border border-primary/20 rounded-2xl p-5 shadow-lg border-l-4 border-l-danger">
                    <h3 className="font-bangla text-lg text-muted-content">মাসিক খরচ</h3>
                    <p className="font-bangla text-3xl font-bold text-danger mt-1">{formatCurrency(monthlyCost)}</p>
                </div>
            </div>
        </>
    );
};

export default SummaryCards;