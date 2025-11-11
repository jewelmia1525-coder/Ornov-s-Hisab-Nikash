import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (tx: Transaction) => void;
    onDelete: (id: number) => void;
    onAddTransaction: () => void;
    onToggleCompleted: (id: number) => void;
}

const TransactionItem: React.FC<{ tx: Transaction; onEdit: () => void; onDelete: () => void; onToggleCompleted: () => void; }> = ({ tx, onEdit, onDelete, onToggleCompleted }) => {
    const isIncome = tx.type === 'income';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = tx.dueDate && tx.type === 'cost' && new Date(tx.dueDate) < today && !tx.completed;

    return (
        <li className={`flex items-center gap-2 p-3 bg-base-300/40 rounded-lg hover:bg-base-300/70 transition-all duration-300 ${tx.completed ? 'opacity-50' : ''}`}>
             <button 
                onClick={onToggleCompleted} 
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${tx.completed ? 'bg-success border-success' : 'border-primary/30 hover:bg-primary/20'}`}
                aria-label={tx.completed ? 'Mark as not completed' : 'Mark as completed'}
            >
                <svg className={`w-5 h-5 text-white transition-transform duration-300 ${tx.completed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </button>
            <div className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center ${isIncome ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {isIncome ? '📈' : '📉'}
            </div>
            <div className="flex-grow">
                <p className={`font-semibold font-bangla text-base-content truncate transition-all ${tx.completed ? 'line-through' : ''}`}>{tx.details}</p>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-xs text-muted-content">{new Date(tx.date).toLocaleDateString('bn-BD')}</span>
                    {tx.dueDate && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOverdue ? 'bg-danger/20 text-danger' : 'bg-base-100 text-muted-content'}`}>
                            {isOverdue ? 'Overdue' : 'Due'}: {new Date(tx.dueDate).toLocaleDateString('bn-BD')}
                        </span>
                    )}
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tx.category || 'Other'}</span>
                </div>
            </div>
            <div className={`font-bold font-bangla text-base ${isIncome ? 'text-success' : 'text-danger'}`}>
                {isIncome ? '+' : '-'}৳{tx.amount.toLocaleString('bn-BD')}
            </div>
             <div className="flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 rounded-full hover:bg-primary/20 text-muted-content hover:text-primary transition-colors" title="Edit" aria-label="Edit transaction">✏️</button>
                <button onClick={onDelete} className="p-2 rounded-full hover:bg-danger/20 text-muted-content hover:text-danger transition-colors" title="Delete" aria-label="Delete transaction">🗑️</button>
            </div>
        </li>
    );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, onAddTransaction, onToggleCompleted }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'cost'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type' | 'dueDate'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    const sortedAndFilteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => {
                const typeMatch = filterType === 'all' || tx.type === filterType;
                const categoryMatch = filterCategory === 'all' || tx.category === filterCategory;
                const searchTermLower = searchTerm.toLowerCase();
                const searchMatch = tx.details.toLowerCase().includes(searchTermLower) || tx.category.toLowerCase().includes(searchTermLower);
                
                const txDate = new Date(tx.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start) start.setHours(0, 0, 0, 0);
                if (end) end.setHours(23, 59, 59, 999);

                const dateMatch = (!start || txDate >= start) && (!end || txDate <= end);

                return typeMatch && searchMatch && categoryMatch && dateMatch;
            })
            .sort((a, b) => {
                let comparison = 0;
                switch (sortBy) {
                    case 'date':
                        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                        break;
                    case 'amount':
                        comparison = a.amount - b.amount;
                        break;
                    case 'type':
                        comparison = a.type.localeCompare(b.type);
                        break;
                    case 'dueDate':
                        if (a.dueDate && b.dueDate) {
                            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        } else if (a.dueDate) {
                            comparison = -1;
                        } else if (b.dueDate) {
                            comparison = 1;
                        }
                        break;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [transactions, searchTerm, filterType, sortBy, sortOrder, filterCategory, startDate, endDate]);


    return (
        <section aria-labelledby="transaction-list-title" className="bg-base-200 border border-primary/20 rounded-2xl p-5 shadow-lg">
            <h2 id="transaction-list-title" className="font-bangla text-lg font-bold text-base-content mb-4">সকল লেনদেন</h2>
            
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search details or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:flex-grow px-3 py-1.5 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex-shrink-0 grid grid-cols-3 gap-1 p-1 bg-base-300/50 rounded-lg">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filterType === 'all' ? 'bg-primary text-primary-content' : 'text-muted-content hover:bg-base-300'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filterType === 'income' ? 'bg-success text-white' : 'text-muted-content hover:bg-base-300'}`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setFilterType('cost')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filterType === 'cost' ? 'bg-danger text-white' : 'text-muted-content hover:bg-base-300'}`}
                        >
                            Cost
                        </button>
                    </div>
                </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow flex items-center gap-2 bg-base-300/30 p-1.5 rounded-lg">
                        <label htmlFor="start-date" className="text-sm font-semibold text-muted-content flex-shrink-0 pl-2">From:</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2 py-2 bg-base-300/50 border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-grow flex items-center gap-2 bg-base-300/30 p-1.5 rounded-lg">
                        <label htmlFor="end-date" className="text-sm font-semibold text-muted-content flex-shrink-0 pl-2">To:</label>
                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2 py-2 bg-base-300/50 border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            min={startDate}
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-4 py-2 bg-base-300/50 border border-primary/20 rounded-lg text-sm text-muted-content hover:bg-base-300 transition-colors flex-shrink-0"
                        >
                            Clear Dates
                        </button>
                    )}
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-base-300/30 p-1.5 rounded-lg">
                        <label htmlFor="category-filter" className="text-sm font-semibold text-muted-content flex-shrink-0 pl-2">Category:</label>
                        <select
                            id="category-filter"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-2 py-2 bg-base-300/50 border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">All</option>
                            {TRANSACTION_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-base-300/30 p-1.5 rounded-lg">
                        <label htmlFor="sort-by" className="text-sm font-semibold text-muted-content flex-shrink-0 pl-2">Sort by:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type' | 'dueDate')}
                            className="w-full px-2 py-2 bg-base-300/50 border border-primary/20 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                            <option value="type">Type</option>
                            <option value="dueDate">Due Date</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-1 bg-base-300/50 border border-primary/20 rounded-md text-lg font-bold hover:bg-primary/20 transition-colors"
                            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {sortedAndFilteredTransactions.length > 0 ? (
                    <ul className="space-y-3">
                        {sortedAndFilteredTransactions.map(tx => (
                            <TransactionItem key={tx.id} tx={tx} onEdit={() => onEdit(tx)} onDelete={() => onDelete(tx.id)} onToggleCompleted={() => onToggleCompleted(tx.id)} />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12 text-muted-content">
                        <svg className="mx-auto h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="mt-4 text-base font-semibold text-base-content font-bangla">কোনো ফলাফল পাওয়া যায়নি</h3>
                        <p className="mt-1 text-xs font-bangla">আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে দেখুন।</p>
                        {transactions.length === 0 && (
                             <button
                                onClick={onAddTransaction}
                                className="mt-6 px-5 py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all text-sm animate-pulse"
                            >
                                Add Your First Transaction
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TransactionList;