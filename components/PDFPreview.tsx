import React from 'react';
import { Transaction, Contact, Role } from '../types';
import { ROLE_DETAILS } from '../constants';

interface PDFPreviewProps {
    transactions: Transaction[];
    contacts: Contact[];
    userRole: Role | null;
    signature: string | null;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ transactions, contacts, userRole, signature }) => {
    const userDetails = userRole ? ROLE_DETAILS[userRole] : ROLE_DETAILS['viewer'];
    const now = new Date();
    
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalCost = transactions.filter(t => t.type === 'cost').reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = totalIncome - totalCost;
    
    const receivables = contacts.filter(c => c.type === 'receivable').reduce((acc, c) => acc + c.amount, 0);
    const payables = contacts.filter(c => c.type === 'payable').reduce((acc, c) => acc + c.amount, 0);

    const formatCurrency = (num: number) => `৳ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const SummaryItem: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor = '#000' }) => (
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{label}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '22px', color: valueColor, fontWeight: 'bold' }}>{value}</p>
        </div>
    );

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>
            <div id="pdf-report" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', backgroundColor: 'white', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', margin: 0, color: '#000', fontWeight: 'bold' }}>Financial Report</h1>
                        <p style={{ fontSize: '14px', color: '#555', margin: '5px 0 0 0' }}>Generated for: {userDetails.name}</p>
                        <p style={{ fontSize: '14px', color: '#555', margin: '5px 0 0 0' }}>Date: {now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <img src={userDetails.photo} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #eee' }} crossOrigin="anonymous" />
                </header>

                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#000' }}>Overall Summary</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <SummaryItem label="Total Income" value={formatCurrency(totalIncome)} valueColor="#28a745" />
                        <SummaryItem label="Total Cost" value={formatCurrency(totalCost)} valueColor="#dc3545" />
                        <SummaryItem label="Final Balance" value={formatCurrency(totalBalance)} />
                        <SummaryItem label="Receivables / Payables" value={`${formatCurrency(receivables)} / ${formatCurrency(payables)}`} />
                    </div>
                </section>
                
                <section style={{ flexGrow: 1 }}>
                    <h2 style={{ fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#000' }}>Transaction Details</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', fontSize: '11px' }}>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Details</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                             {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, index) => (
                                <tr key={tx.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9', color: tx.completed ? '#999' : 'inherit' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textDecoration: tx.completed ? 'line-through' : 'none' }}>{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textDecoration: tx.completed ? 'line-through' : 'none' }}>{tx.details}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textDecoration: tx.completed ? 'line-through' : 'none' }}>{tx.category}</td>
                                    <td style={{ 
                                        padding: '10px', 
                                        border: '1px solid #ddd', 
                                        textAlign: 'right', 
                                        fontWeight: 'bold', 
                                        color: tx.completed ? '#999' : (tx.type === 'income' ? '#28a745' : '#dc3545'),
                                        textDecoration: tx.completed ? 'line-through' : 'none' 
                                    }}>
                                        {tx.type === 'income' ? '+ ' : '- '}{formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {transactions.length === 0 && <p style={{textAlign: 'center', padding: '20px', color: '#777'}}>No transactions to display.</p>}
                </section>
                 
                <div style={{ paddingTop: '40px' }}>
                    <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <div style={{ textAlign: 'center' }}>
                            {signature ? (
                                <img src={signature} alt="Signature" style={{ maxHeight: '50px', maxWidth: '180px', marginBottom: '5px' }} crossOrigin="anonymous" />
                            ) : (
                                <div style={{height: '55px', width: '180px'}}></div>
                            )}
                            <p style={{ borderTop: '1px solid #333', paddingTop: '8px', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{userDetails.name}</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>Signature</p>
                        </div>
                    </div>
                </div>

                <footer style={{ textAlign: 'center', fontSize: '10px', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '20px' }}>
                    This is a computer-generated document.
                </footer>
            </div>
        </div>
    );
};

export default PDFPreview;