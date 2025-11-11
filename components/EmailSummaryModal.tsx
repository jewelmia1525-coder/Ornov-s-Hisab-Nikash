import React, { useState } from 'react';
import Modal from './Modal';
import { Transaction, Contact } from '../types';

declare const emailjs: any;

interface EmailSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    transactions: Transaction[];
    contacts: Contact[];
}

const EmailSummaryModal: React.FC<EmailSummaryModalProps> = ({ isOpen, onClose, showToast, transactions, contacts }) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('Your Financial Summary');
    const [isSending, setSending] = useState(false);
    
    const generateSummaryText = () => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalCost = transactions.filter(t => t.type === 'cost').reduce((acc, t) => acc + t.amount, 0);
        const totalBalance = totalIncome - totalCost;
        
        let summary = `FINANCIAL SUMMARY\n====================\n\n`;
        summary += `Total Income: ৳${totalIncome.toLocaleString()}\n`;
        summary += `Total Cost: ৳${totalCost.toLocaleString()}\n`;
        summary += `Final Balance: ৳${totalBalance.toLocaleString()}\n\n`;
        summary += `TRANSACTION DETAILS\n---------------------\n`;

        [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(tx => {
            const date = new Date(tx.date).toLocaleDateString('en-GB');
            const sign = tx.type === 'income' ? '+' : '-';
            summary += `${date} | ${tx.details} (${tx.category}) | ${sign}৳${tx.amount.toLocaleString()}\n`;
        });
        
        return summary;
    }


    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const templateParams = {
            to_email: to,
            subject: subject,
            reply_to: 'eng.jewelmia@gmail.com',
            from_name: 'Jewel Mia (Finance Panel)',
            cv_text: generateSummaryText() // Reusing the 'cv_text' parameter from the CV widget template
        };
        
        const SERVICE_ID = 'service_7bnmsc5';
        const TEMPLATE_ID = 'template_txw5kbb';
        const PUBLIC_KEY = 'xn72TxUTNzE92DKwt';
        
        emailjs.init({ publicKey: PUBLIC_KEY });

        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
            .then(() => {
                showToast('Summary sent successfully!', 'success');
                onClose();
            }, (error: any) => {
                console.error(error);
                showToast('Failed to send summary.', 'error');
            })
            .finally(() => {
                setSending(false);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Email Financial Summary">
            <form onSubmit={sendEmail} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="email-to">Recipient Email</label>
                    <input id="email-to" type="email" value={to} onChange={e => setTo(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-muted-content mb-1" htmlFor="email-subject">Subject</label>
                    <input id="email-subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                </div>
                <button type="submit" disabled={isSending} className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:bg-primary/50 disabled:cursor-not-allowed">
                    {isSending ? 'Sending...' : 'Send Email'}
                </button>
            </form>
        </Modal>
    );
};

export default EmailSummaryModal;
