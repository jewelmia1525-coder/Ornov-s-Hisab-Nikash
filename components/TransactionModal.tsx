import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';
import Modal from './Modal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id' | 'date' | 'completed'> & { id?: number }) => void;
    transaction: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
    const [type, setType] = useState<'income' | 'cost'>('income');
    const [amount, setAmount] = useState<string>('');
    const [details, setDetails] = useState('');
    const [category, setCategory] = useState<string>('Other');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setAmount(String(transaction.amount));
            setDetails(transaction.details);
            setCategory(transaction.category || 'Other');
            setDueDate(transaction.dueDate || '');
        } else {
            setType('income');
            setAmount('');
            setDetails('');
            setCategory('Other');
            setDueDate('');
        }
    }, [transaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !details) return;
        onSave({
            id: transaction?.id,
            type,
            amount: parseFloat(amount),
            details,
            category,
            ...(type === 'cost' && dueDate && { dueDate }),
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button type="button" onClick={() => setType('income')} className={`py-2 rounded-lg font-semibold border-2 transition-colors ${type === 'income' ? 'bg-success text-white border-success' : 'bg-base-300/50 border-transparent text-muted-content'}`}>আয় (Income)</button>
                    <button type="button" onClick={() => setType('cost')} className={`py-2 rounded-lg font-semibold border-2 transition-colors ${type === 'cost' ? 'bg-danger text-white border-danger' : 'bg-base-300/50 border-transparent text-muted-content'}`}>খরচ (Cost)</button>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="tx-amount">Amount</label>
                    <input id="tx-amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="tx-details">Details</label>
                    <input id="tx-details" type="text" value={details} onChange={e => setDetails(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="tx-category">Category</label>
                    <select
                        id="tx-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                    >
                        {TRANSACTION_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {type === 'cost' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="tx-due-date">Due Date (Optional)</label>
                        <input
                            id="tx-due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                )}
                <div className="mt-6">
                  <button type="submit" className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">{transaction ? 'Update' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;