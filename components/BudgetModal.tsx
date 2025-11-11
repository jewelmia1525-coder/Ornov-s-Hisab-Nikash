import React, { useState, useEffect } from 'react';
import { Budget } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';
import Modal from './Modal';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budgets: Budget[]) => void;
    currentBudgets: Budget[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSave, currentBudgets }) => {
    const [localBudgets, setLocalBudgets] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            const budgetMap = currentBudgets.reduce((acc, budget) => {
                acc[budget.category] = String(budget.amount);
                return acc;
            }, {} as { [key: string]: string });
            setLocalBudgets(budgetMap);
        }
    }, [isOpen, currentBudgets]);

    const handleChange = (category: string, amount: string) => {
        setLocalBudgets(prev => ({ ...prev, [category]: amount }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newBudgets: Budget[] = Object.entries(localBudgets)
            .map(([category, amountStr]) => ({
                category,
                amount: parseFloat(amountStr) || 0,
            }))
            .filter(budget => budget.amount > 0);
        onSave(newBudgets);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Budgets">
            <form onSubmit={handleSubmit}>
                <p className="text-sm text-muted-content mb-4 text-center">Set a monthly spending limit for each category. Leave blank or 0 to not set a budget.</p>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {TRANSACTION_CATEGORIES.map(category => (
                        <div key={category} className="flex items-center justify-between gap-4">
                            <label htmlFor={`budget-${category}`} className="font-semibold text-base-content flex-shrink-0">{category}</label>
                            <div className="relative flex-grow">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-content">৳</span>
                                <input
                                    id={`budget-${category}`}
                                    type="number"
                                    value={localBudgets[category] || ''}
                                    onChange={e => handleChange(category, e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-7 pr-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                    min="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <button type="submit" className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">Save Budgets</button>
                </div>
            </form>
        </Modal>
    );
};

export default BudgetModal;
