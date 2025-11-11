import React, { useState, useEffect, useRef } from 'react';
import WidgetContainer from './widgets/WidgetContainer';
import { PASSWORDS, FULL_CV_TEXT } from '../constants';
import { Transaction, Contact, AdminUser } from '../types';
import Modal from './Modal';
import SignatureModal from './SignatureModal';


// --- Password Generator ---
export const PasswordGeneratorWidget: React.FC<{
    onClose: () => void; 
    showToast: (message: string, type?: 'success' | 'error') => void;
    availablePasswords: string[];
    onAddAdminUser: (user: Omit<AdminUser, 'id'>) => void;
}> = ({ onClose, showToast, availablePasswords, onAddAdminUser }) => {
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState<string>('');
    const [showAvailable, setShowAvailable] = useState(false);

    const generate = () => {
        if (availablePasswords.length === 0) {
            showToast('No available passwords left!', 'error');
            return;
        }
        const randPass = availablePasswords[Math.floor(Math.random() * availablePasswords.length)];
        setGeneratedPassword(randPass);
    };

    const handleAssignAndCopy = () => {
        if (!username.trim()) {
            showToast('Please enter a name.', 'error');
            return;
        }
        if (!mobile.trim()) {
            showToast('Please enter a mobile number.', 'error');
            return;
        }
        if (!generatedPassword) {
            showToast('Please generate a password first.', 'error');
            return;
        }

        const formattedUsername = username.trim().charAt(0).toUpperCase() + username.trim().slice(1);

        const newUser: Omit<AdminUser, 'id'> = {
            username: formattedUsername,
            password: generatedPassword,
            email: '',
            mobile: mobile.trim()
        };
        
        onAddAdminUser(newUser);

        const textToCopy = `${formattedUsername}${generatedPassword}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Assigned and copied to clipboard!', 'success');
            setUsername('');
            setMobile('');
            setGeneratedPassword('');
        }, () => {
            showToast('Assigned, but failed to copy.', 'error');
        });
    };

    return (
        <WidgetContainer title="Password Assignment" onClose={onClose}>
            <div className="space-y-3">
                 <div className="p-2 bg-base-100 rounded-md text-center">
                    <p className="text-sm font-semibold text-muted-content">Available Passwords</p>
                    <p className="text-2xl font-bold text-primary">{availablePasswords.length}</p>
                 </div>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Name for new admin" className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter Mobile Number" className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                <div className="flex items-center gap-2">
                    <div className="flex-grow p-2 h-10 bg-base-100 rounded-md text-center font-mono text-primary font-bold border border-primary/20 flex items-center justify-center">
                        {generatedPassword || '...'}
                    </div>
                    <button onClick={generate} className="flex-shrink-0 px-4 py-2 bg-primary/80 text-primary-content font-bold rounded-lg hover:bg-primary transition-all text-sm">Generate</button>
                </div>
                <button onClick={handleAssignAndCopy} disabled={!username || !mobile || !generatedPassword} className="w-full py-2 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50">Assign & Copy</button>
                <div className="text-center">
                    <button onClick={() => setShowAvailable(!showAvailable)} className="text-xs text-muted-content hover:text-primary underline">
                        {showAvailable ? 'Hide' : 'View'} Available Passwords
                    </button>
                </div>
                {showAvailable && (
                    <div className="mt-2 p-2 bg-base-100 rounded-md max-h-32 overflow-y-auto">
                        <p className="text-xs font-mono text-muted-content grid grid-cols-3 gap-1 text-center">
                            {availablePasswords.map(p => <span key={p}>{p}</span>)}
                        </p>
                    </div>
                )}
            </div>
        </WidgetContainer>
    );
};

// --- Calculator ---
export const CalculatorWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [display, setDisplay] = useState('0');
    
    const handleInput = (value: string) => {
        if (value === 'C') return setDisplay('0');
        if (value === '=') {
            try {
                // eslint-disable--next-line no-eval
                const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
                setDisplay(String(result));
            } catch {
                setDisplay('Error');
            }
            return;
        }
        if (display === '0' || display === 'Error') {
            setDisplay(value);
        } else {
            setDisplay(display + value);
        }
    };
    
    const keys = ['C', '÷', '×', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0', '.'];

    return (
        <WidgetContainer title="Calculator" onClose={onClose}>
            <div className="space-y-2">
                <div className="bg-base-100 text-right p-4 rounded-lg text-2xl break-all">{display}</div>
                <div className="grid grid-cols-4 gap-2">
                    {keys.map(k => (
                        <button key={k} onClick={() => handleInput(k)} className={`py-3 rounded-lg text-center font-semibold ${['=','+','-','×','÷'].includes(k) ? 'bg-primary/80 text-primary-content' : 'bg-base-300'} ${k === '=' ? 'col-span-2' : ''} ${k === 'C' ? 'bg-danger/80 text-white' : ''}`}>
                            {k}
                        </button>
                    ))}
                </div>
            </div>
        </WidgetContainer>
    );
};

// --- Email CV ---
declare const emailjs: any;
export const EmailCvWidget: React.FC<{ onClose: () => void; showToast: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, showToast }) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [isSending, setSending] = useState(false);

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const templateParams = {
            to_email: to,
            subject: subject,
            reply_to: 'eng.jewelmia@gmail.com',
            from_name: 'Jewel Mia (Admin Panel)',
            cv_text: FULL_CV_TEXT
        };
        
        const SERVICE_ID = 'service_7bnmsc5';
        const TEMPLATE_ID = 'template_txw5kbb';
        const PUBLIC_KEY = 'xn72TxUTNzE92DKwt';
        
        emailjs.init({ publicKey: PUBLIC_KEY });

        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
            .then(() => {
                showToast('CV sent successfully!', 'success');
                onClose();
            }, (error: any) => {
                console.error(error);
                showToast('Failed to send CV.', 'error');
            })
            .finally(() => {
                setSending(false);
            });
    };

    return (
        <WidgetContainer title="Email CV" onClose={onClose}>
            <form onSubmit={sendEmail} className="space-y-3">
                <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="Recipient Email" className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" required />
                <button type="submit" disabled={isSending} className="w-full py-2 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:bg-primary/50 disabled:cursor-not-allowed">
                    {isSending ? 'Sending...' : 'Send Email'}
                </button>
            </form>
        </WidgetContainer>
    );
};

// --- Theme Manager ---
export const ThemeManagerWidget: React.FC<{
    onClose: () => void;
    currentTheme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    currentColorTheme: string;
    setColorTheme: (theme: string) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ onClose, currentTheme, setTheme, currentColorTheme, setColorTheme, showToast }) => {

    const colorThemes = [
        { id: 'theme-gold', color: '#ffd700' },
        { id: 'theme-blue', color: '#3b82f6' },
        { id: 'theme-green', color: '#22c55e' },
        { id: 'theme-purple', color: '#a855f7' },
        { id: 'theme-red', color: '#ef4444' },
        { id: 'theme-orange', color: '#f97316' },
        { id: 'theme-teal', color: '#14b8a6' },
        { id: 'theme-pink', color: '#ec4899' },
    ];
    
    const [customThemes, setCustomThemes] = useState<string[]>([]);
    const [pickerColor, setPickerColor] = useState('#6366f1');

    useEffect(() => {
        const savedCustom = localStorage.getItem('finance_custom_themes');
        if (savedCustom) {
            try {
                setCustomThemes(JSON.parse(savedCustom));
            } catch (e) {
                console.error("Failed to parse custom themes from localStorage", e);
            }
        }
    }, []);
    
    const handleAddCustomTheme = () => {
        if (!pickerColor || !/^#[0-9a-f]{6}$/i.test(pickerColor)) {
            showToast('Invalid hex color format.', 'error');
            return;
        }
        if (customThemes.includes(pickerColor)) {
            showToast('Color already saved.', 'error');
            return;
        }
        
        const newCustomThemes = [...customThemes, pickerColor];
        setCustomThemes(newCustomThemes);
        localStorage.setItem('finance_custom_themes', JSON.stringify(newCustomThemes));
        showToast('Custom color saved!', 'success');
    };

    const handleRemoveCustomTheme = (colorToRemove: string) => {
        const newCustomThemes = customThemes.filter(c => c !== colorToRemove);
        setCustomThemes(newCustomThemes);
        localStorage.setItem('finance_custom_themes', JSON.stringify(newCustomThemes));
        if (currentColorTheme === colorToRemove) {
            setColorTheme('theme-gold'); // fallback to default
        }
    };

    const handleThemeToggle = () => {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return (
        <WidgetContainer title="Theme Manager" onClose={onClose}>
            <div className="space-y-4">
                <div>
                     <label className="flex items-center justify-between">
                        <span className="font-semibold text-muted-content">Mode</span>
                        <button 
                            onClick={handleThemeToggle} 
                            className="w-14 h-8 px-1 flex items-center bg-base-300 rounded-full cursor-pointer relative transition-colors duration-300 border border-primary/20"
                            aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-primary shadow-md transform transition-transform duration-300 ${currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            <span className={`absolute left-1.5 text-sm transition-opacity duration-200 ${currentTheme === 'light' ? 'opacity-100' : 'opacity-0'}`}>☀️</span>
                            <span className={`absolute right-1.5 text-sm transition-opacity duration-200 ${currentTheme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
                        </button>
                    </label>
                </div>
                <div>
                    <h4 className="font-semibold text-muted-content mb-2">Accent Color</h4>
                    <div className="flex flex-wrap justify-start gap-3">
                        {colorThemes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setColorTheme(theme.id)}
                                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${currentColorTheme === theme.id ? 'ring-2 ring-offset-2 ring-offset-base-200 ring-primary' : ''}`}
                                style={{ backgroundColor: theme.color }}
                                title={theme.id.replace('theme-', '')}
                            />
                        ))}
                    </div>
                </div>

                <div className="pt-3 border-t border-primary/10">
                    <h4 className="font-semibold text-muted-content mb-2">Custom Colors</h4>
                     {customThemes.length > 0 && (
                        <div className="flex flex-wrap justify-start gap-3 mb-3">
                            {customThemes.map(color => (
                                <div key={color} className="relative group">
                                    <button
                                        onClick={() => setColorTheme(color)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${currentColorTheme === color ? 'ring-2 ring-offset-2 ring-offset-base-200 ring-primary' : ''}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                     <button 
                                        onClick={() => handleRemoveCustomTheme(color)}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove color"
                                     >×</button>
                                </div>
                            ))}
                        </div>
                     )}

                    <div className="flex items-center gap-2">
                         <label className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-base-300 cursor-pointer" style={{ backgroundColor: pickerColor }}>
                            <input
                                type="color"
                                value={pickerColor}
                                onChange={(e) => setPickerColor(e.target.value)}
                                className="opacity-0 w-full h-full cursor-pointer"
                                title="Select custom color"
                            />
                        </label>
                        <input 
                          type="text" 
                          value={pickerColor}
                          onChange={(e) => setPickerColor(e.target.value)}
                          className="flex-grow px-3 py-1.5 bg-base-300/50 border border-primary/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono"
                        />
                        <button onClick={handleAddCustomTheme} className="px-3 py-1.5 bg-primary/80 text-primary-content text-sm font-semibold rounded-lg hover:bg-primary transition-colors">Add</button>
                    </div>
                </div>
            </div>
        </WidgetContainer>
    );
};


// --- About Me ---
export const AboutMeWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <WidgetContainer title="About Me" onClose={onClose}>
            <div className="text-center space-y-3">
                 <img src="https://i.postimg.cc/brTGQ2wL/rsz-1unnamed.jpg" alt="Jewel Mia" className="w-20 h-20 rounded-full mx-auto border-4 border-primary/50" />
                 <div>
                    <h4 className="font-bold text-lg text-primary">Jewel Mia</h4>
                    <p className="text-sm text-muted-content">Electrical & Smart Systems Engineer</p>
                 </div>
                 <p className="text-xs text-base-content/80 px-2">
                    This is a personal finance dashboard built with React & TypeScript. For full access or queries, feel free to contact me.
                 </p>
                 <div className="flex justify-center gap-4 pt-2">
                    <a href="https://wa.me/8801402284322" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-2xl transition-colors">
                        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M20.52 3.48A11.87 11.87 0 0012 .6 11.4 11.4 0 00.6 12.08a11.27 11.27 0 001.58 5.83L.6 23.4l5.61-1.47a11.5 11.5 0 005.81 1.53A11.45 11.45 0 0023.4 12a11.87 11.87 0 00-2.88-8.52zM12 21.07a9.29 9.29 0 01-4.74-1.28l-.34-.2-3.33.87.9-3.25-.22-.33A9.22 9.22 0 012.72 12a9.28 9.28 0 1118.56 0A9.28 9.28 0 0112 21.07zm4.84-6.64c-.26-.13-1.54-.76-1.78-.85s-.42-.13-.6.13-.68.85-.83 1-.3.19-.56.06a7.65 7.65 0 01-2.25-1.39 8.43 8.43 0 01-1.56-1.94c-.16-.26 0-.4.12-.53.12-.12.26-.3.4-.45a1.79 1.79 0 00.27-.45.5.5 0 000-.47c-.07-.13-.6-1.44-.83-1.98s-.44-.46-.6-.47h-.51a1 1 0 00-.72.33A3 3 0 007 8.46a5.17 5.17 0 001.1 2.72A11.83 11.83 0 0012 14.68a5.44 5.44 0 001.38.18 3.28 3.28 0 002.13-1.36 2.69 2.69 0 00.33-1.39c0-.26-.02-.46-.06-.64a.47.47 0 00-.14-.22z"/></svg>
                    </a>
                    <a href="mailto:Eng.jewelmia@gmil.com" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-2xl transition-colors">
                       <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                    </a>
                 </div>
            </div>
        </WidgetContainer>
    );
};

// --- Data Management ---
export const DataManagementWidget: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    transactions: Transaction[];
    contacts: Contact[];
    onImport: (type: 'transactions' | 'contacts', data: any[]) => void;
    setConfirmModal: (config: any) => void;
}> = ({ onClose, showToast, transactions, contacts, onImport, setConfirmModal }) => {
    
    const [parsedTxs, setParsedTxs] = useState<Transaction[] | null>(null);
    const [parsedContacts, setParsedContacts] = useState<Contact[] | null>(null);

    const arrayToCsv = (data: any[], headers: string[]) => {
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] === null || row[header] === undefined ? '' : row[header];
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    const downloadCsv = (csvString: string, filename: string) => {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        let exported = false;
        if (transactions.length > 0) {
            const txHeaders = ['id', 'type', 'amount', 'details', 'date', 'category', 'dueDate', 'completed'];
            const txCsv = arrayToCsv(transactions, txHeaders);
            downloadCsv(txCsv, 'transactions.csv');
            exported = true;
        }
        if (contacts.length > 0) {
            const contactHeaders = ['id', 'type', 'name', 'amount', 'reason', 'photo', 'date'];
            const contactCsv = arrayToCsv(contacts, contactHeaders);
            downloadCsv(contactCsv, 'contacts.csv');
            exported = true;
        }
        
        if (exported) {
            showToast('Data exported successfully!', 'success');
        } else {
            showToast('No data to export.', 'error');
        }
    };

    const handleExportTransactions = () => {
        if (transactions.length > 0) {
            const txHeaders = ['id', 'type', 'amount', 'details', 'date', 'category', 'dueDate', 'completed'];
            const txCsv = arrayToCsv(transactions, txHeaders);
            downloadCsv(txCsv, 'transactions.csv');
            showToast('Transactions exported successfully!', 'success');
        } else {
            showToast('No transactions to export.', 'error');
        }
    };

    const csvToArray = (csvString: string) => {
        const rows = csvString.trim().split(/\r?\n/);
        if (rows.length < 2) return [];
        const headers = rows[0].split(',').map(h => h.replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            if (values.length === 0) continue;
            const obj = headers.reduce((acc, header, index) => {
                const value = values[index] ? values[index].replace(/"/g, '') : '';
                if (header === 'amount' || header === 'id') {
                    acc[header] = Number(value);
                } else {
                    acc[header] = value === 'undefined' ? undefined : value;
                }
                return acc;
            }, {} as any);
            data.push(obj);
        }
        return data;
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'transactions' | 'contacts') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const data = csvToArray(text);
                if (type === 'transactions') {
                    if (data.length > 0 && 'details' in data[0] && 'amount' in data[0]) {
                         setParsedTxs(data as Transaction[]);
                         showToast(`${data.length} transactions ready to import.`, 'success');
                    } else if (data.length === 0 && text.trim() !== '') {
                        throw new Error('Invalid transaction file format.');
                    } else if (text.trim() === '') {
                        showToast('CSV file is empty.', 'error');
                    }
                } else {
                    if (data.length > 0 && 'name' in data[0] && 'amount' in data[0]) {
                        setParsedContacts(data as Contact[]);
                        showToast(`${data.length} contacts ready to import.`, 'success');
                    } else if (data.length === 0 && text.trim() !== '') {
                        throw new Error('Invalid contact file format.');
                    } else if (text.trim() === '') {
                         showToast('CSV file is empty.', 'error');
                    }
                }
            } catch (err) {
                showToast(err instanceof Error ? err.message : 'Failed to parse file.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };
    
    const handleImport = (type: 'transactions' | 'contacts') => {
        const data = type === 'transactions' ? parsedTxs : parsedContacts;
        if (!data) return;
        
        setConfirmModal({
            isOpen: true,
            title: `Replace ${type}?`,
            message: `Are you sure? This will permanently delete all current ${type} and replace them with the imported data.`,
            onConfirm: () => {
                onImport(type, data);
                if (type === 'transactions') setParsedTxs(null);
                else setParsedContacts(null);
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    return (
        <WidgetContainer title="Data Management" onClose={onClose}>
            {/* Export Section */}
            <div className="space-y-3">
                <h4 className="font-semibold text-muted-content">Export Data</h4>
                <p className="text-xs text-muted-content">Download your data as CSV files for backup.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={handleExportTransactions} className="w-full py-2 bg-primary/80 text-primary-content font-bold rounded-lg hover:bg-primary transition-all text-sm">
                        Export Transactions (.csv)
                    </button>
                    <button onClick={handleExport} className="w-full py-2 bg-primary/80 text-primary-content font-bold rounded-lg hover:bg-primary transition-all text-sm">
                        Export All Data (.csv)
                    </button>
                </div>
            </div>
            
            <div className="my-4 border-t border-primary/20"></div>

            {/* Import Section */}
            <div className="space-y-3">
                <h4 className="font-semibold text-muted-content">Import Data</h4>
                <p className="text-xs text-muted-content">Import data from CSV files. <b className="text-danger">Warning: This will overwrite existing data.</b></p>
                
                {/* Transaction Import */}
                <div className="bg-base-100 p-2 rounded-md">
                    <label className="text-sm block mb-1">Transactions CSV</label>
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, 'transactions')}
                        className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    {parsedTxs && (
                        <button onClick={() => handleImport('transactions')} className="w-full mt-2 py-1.5 bg-danger text-white text-sm font-bold rounded-lg hover:bg-danger/80 transition-all">
                            Replace Transactions
                        </button>
                    )}
                </div>

                {/* Contacts Import */}
                <div className="bg-base-100 p-2 rounded-md">
                    <label className="text-sm block mb-1">Contacts CSV</label>
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, 'contacts')}
                        className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    {parsedContacts && (
                        <button onClick={() => handleImport('contacts')} className="w-full mt-2 py-1.5 bg-danger text-white text-sm font-bold rounded-lg hover:bg-danger/80 transition-all">
                            Replace Contacts
                        </button>
                    )}
                </div>
            </div>
        </WidgetContainer>
    );
};

// --- Admin User Management ---
export const AdminUserManagementWidget: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    adminUsers: AdminUser[];
    onUpdateUser: (user: AdminUser) => void;
    onSendMessageToUser: (username: string) => void;
}> = ({ onClose, showToast, adminUsers, onUpdateUser, onSendMessageToUser }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const handleOpenEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setEditModalOpen(true);
    };

    const handleSave = (updatedUser: AdminUser) => {
        onUpdateUser(updatedUser);
        setEditModalOpen(false);
    };

    return (
        <>
            <WidgetContainer title="Admin User Management" onClose={onClose}>
                <div className="space-y-2">
                    {adminUsers.length === 0 ? (
                        <p className="text-center text-sm text-muted-content py-8">No admin users have been created yet.</p>
                    ) : (
                        adminUsers.map(user => (
                            <div key={user.id} className="bg-base-100 p-3 rounded-lg border border-primary/20 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-base-content leading-tight">{user.username}</p>
                                    <p className="text-xs text-muted-content break-all">{user.email || 'No email'}</p>
                                    <p className="text-xs text-muted-content">{user.mobile || 'No mobile'}</p>
                                    <p className="text-xs font-mono bg-base-300/50 inline-block px-1.5 py-0.5 rounded mt-1 text-primary">
                                        Pass: <span className="font-semibold">{user.password}</span>
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => onSendMessageToUser(user.username)} className="p-2 rounded-full hover:bg-primary/20 text-muted-content hover:text-primary transition-colors text-sm" title="Send Message">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </button>
                                    <button onClick={() => handleOpenEditModal(user)} className="p-2 rounded-full hover:bg-primary/20 text-muted-content hover:text-primary transition-colors text-sm" title="Edit">✏️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </WidgetContainer>
            {isEditModalOpen && editingUser && (
                <EditUserModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    user={editingUser}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

// --- Edit User Modal (for AdminUserManagementWidget) ---
const EditUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: AdminUser;
    onSave: (user: AdminUser) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.username}`}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-muted-content" htmlFor="username">Username</label>
                    <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg" required />
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-content" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-muted-content" htmlFor="mobile">Mobile Number</label>
                    <input id="mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg" />
                </div>
                <div className="!mt-4 pt-2">
                     <p className="text-xs text-muted-content">Password is fixed upon creation and cannot be changed.</p>
                </div>
                <button type="submit" className="w-full !mt-4 py-2 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">Save Changes</button>
            </form>
        </Modal>
    );
};

// --- Broadcast Widget ---
export const BroadcastWidget: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onSetAdminBroadcast: (text: string) => void;
    onSetViewerBroadcast: (text: string) => void;
    currentAdminBroadcast: string;
    currentViewerBroadcast: string;
}> = ({ onClose, showToast, onSetAdminBroadcast, onSetViewerBroadcast, currentAdminBroadcast, currentViewerBroadcast }) => {
    const [adminText, setAdminText] = useState(currentAdminBroadcast);
    const [viewerText, setViewerText] = useState(currentViewerBroadcast);

    const handleSendAdmin = () => {
        onSetAdminBroadcast(adminText);
        showToast('Admin broadcast updated!', 'success');
    };

    const handleSendViewer = () => {
        onSetViewerBroadcast(viewerText);
        showToast('Viewer announcement updated!', 'success');
    };
    
    const handleClearViewer = () => {
        setViewerText('');
        onSetViewerBroadcast('');
        showToast('Viewer announcement cleared!', 'success');
    };

    return (
        <WidgetContainer title="Broadcast Controls" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-muted-content mb-1">📢 For Admins</h4>
                    <textarea value={adminText} onChange={e => setAdminText(e.target.value)} rows={3} placeholder="Scrolling text for all admins..." className="w-full text-sm p-2 bg-base-100 border border-primary/20 rounded-md" />
                    <button onClick={handleSendAdmin} className="w-full mt-1 py-1.5 bg-primary/80 text-primary-content text-sm font-semibold rounded-lg hover:bg-primary transition-colors">Send to Admins</button>
                </div>
                 <div className="border-t border-primary/20 my-2"></div>
                <div>
                    <h4 className="font-semibold text-muted-content mb-1">📢 For Viewers</h4>
                    <textarea value={viewerText} onChange={e => setViewerText(e.target.value)} rows={3} placeholder="Scrolling text for all viewers..." className="w-full text-sm p-2 bg-base-100 border border-primary/20 rounded-md" />
                    <div className="flex gap-2 mt-1">
                         <button onClick={handleSendViewer} className="w-full py-1.5 bg-primary/80 text-primary-content text-sm font-semibold rounded-lg hover:bg-primary transition-colors">Send to Viewers</button>
                         <button onClick={handleClearViewer} className="w-full py-1.5 bg-danger/80 text-white text-sm font-semibold rounded-lg hover:bg-danger transition-colors">Clear</button>
                    </div>
                </div>
            </div>
        </WidgetContainer>
    );
};

// --- Import Passwords Widget ---
export const ImportPasswordsWidget: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    onImport: (passwords: string[]) => void;
    existingPasswords: string[];
}> = ({ onClose, showToast, onImport, existingPasswords }) => {
    const [quantity, setQuantity] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAndImport = () => {
        setIsGenerating(true);
        // Use a Set for efficient checking of existing passwords
        const existingSet = new Set(existingPasswords);
        const newPasswords: string[] = [];

        // Set a limit to prevent infinite loops in case the pool is almost full
        const maxAttempts = quantity * 100; 
        let attempts = 0;

        while (newPasswords.length < quantity && attempts < maxAttempts) {
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            if (!existingSet.has(newCode)) {
                newPasswords.push(newCode);
                existingSet.add(newCode); // Add to set to prevent duplicates in the same batch
            }
            attempts++;
        }

        if (newPasswords.length < quantity) {
            showToast(`Could only generate ${newPasswords.length} unique passwords. The pool is getting full.`, 'error');
        }
        
        if (newPasswords.length > 0) {
            onImport(newPasswords);
        }

        setIsGenerating(false);
    };

    return (
        <WidgetContainer title="Import Passwords" onClose={onClose}>
            <div className="space-y-4 text-center">
                 <p className="text-sm text-muted-content">Generate new unique 6-digit passwords and add them to the available pool.</p>
                <div>
                    <label htmlFor="quantity" className="text-sm font-semibold text-muted-content block mb-1">Quantity to Generate</label>
                    <input 
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full px-3 py-2 bg-base-300/50 border border-primary/20 rounded-lg text-center"
                    />
                     <div className="flex gap-2 mt-2">
                        {[10, 20, 50, 100].map(num => (
                             <button key={num} onClick={() => setQuantity(num)} className="w-full text-xs py-1 bg-base-100 rounded-md hover:bg-primary/20">{num}</button>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handleGenerateAndImport}
                    disabled={isGenerating}
                    className="w-full py-2.5 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all disabled:opacity-50"
                >
                    {isGenerating ? 'Generating...' : 'Generate & Import'}
                </button>
            </div>
        </WidgetContainer>
    );
};

// --- Profile Settings Widget ---
export const ProfileSettingsWidget: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    currentUser: AdminUser;
    onUpdateProfile: (updatedData: Partial<Omit<AdminUser, 'id'>>) => void;
}> = ({ onClose, showToast, currentUser, onUpdateProfile }) => {
    const [name, setName] = useState(currentUser.username);
    const [photo, setPhoto] = useState(currentUser.photo || null);
    const [signature, setSignature] = useState(currentUser.signature || null);
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setPhoto(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };
    
    const handleSaveChanges = () => {
        const updatedData: Partial<Omit<AdminUser, 'id'>> = {};
        if (name !== currentUser.username) updatedData.username = name;
        if (photo !== currentUser.photo) updatedData.photo = photo || '';
        if (signature !== currentUser.signature) updatedData.signature = signature || '';

        if (Object.keys(updatedData).length > 0) {
            onUpdateProfile(updatedData);
        } else {
            showToast('No changes to save.', 'error');
        }
        onClose();
    };

    return (
        <>
            <WidgetContainer title="Profile Settings" onClose={onClose}>
                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <img src={photo || 'https://placehold.co/150x150/0f1a30/ffd700?text=A'} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-primary/50" />
                        <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={handlePhotoUpload} />
                        <button onClick={() => photoInputRef.current?.click()} className="text-sm font-semibold text-primary hover:underline">Change Photo</button>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-content" htmlFor="profileName">Display Name</label>
                        <input id="profileName" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-base-100 border border-primary/20 rounded-lg" required />
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-muted-content">Signature</label>
                        <div className="w-full h-24 mt-1 bg-base-100 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20 p-1">
                            {signature ? <img src={signature} alt="Signature Preview" className="max-h-full max-w-full object-contain" /> : <p className="text-muted-content text-xs">No signature set</p>}
                        </div>
                        <button onClick={() => setSignatureModalOpen(true)} className="w-full mt-1 py-1.5 bg-base-300 hover:bg-primary/20 text-sm font-semibold rounded-lg">Change Signature</button>
                    </div>
                    <button onClick={handleSaveChanges} className="w-full !mt-6 py-2 bg-success text-white font-bold rounded-lg hover:bg-green-600 transition-all">Save Changes</button>
                </div>
            </WidgetContainer>
            {isSignatureModalOpen && (
                <SignatureModal 
                    isOpen={isSignatureModalOpen}
                    onClose={() => setSignatureModalOpen(false)}
                    onSave={(newSig) => {
                        setSignature(newSig);
                        setSignatureModalOpen(false);
                    }}
                    currentSignature={signature}
                />
            )}
        </>
    );
};

// --- Admin Overview Widget ---
export const AdminOverviewWidget: React.FC<{
    onClose: () => void;
    adminUsers: AdminUser[];
}> = ({ onClose, adminUsers }) => {
    return (
         <WidgetContainer title="Admin Overview" onClose={onClose}>
            <div className="space-y-2">
                {adminUsers.length === 0 ? (
                    <p className="text-center text-sm text-muted-content py-8">No admin users found.</p>
                ) : (
                    adminUsers.map(user => (
                        <div key={user.id} className="bg-base-100 p-3 rounded-lg border border-primary/20 flex items-center gap-3">
                            <img src={user.photo || 'https://placehold.co/60x60/0f1a30/ffd700?text=A'} alt={user.username} className="w-10 h-10 rounded-full object-cover border-2 border-primary/30" />
                            <div>
                                <p className="font-bold text-base-content leading-tight">{user.username}</p>
                                <p className="text-xs text-muted-content">{user.mobile}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
};