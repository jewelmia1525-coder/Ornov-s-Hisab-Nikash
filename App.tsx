import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Contact, Role, Page, Widget, AdminUser, Budget, DashboardModule, Message } from './types';
import { PASSWORDS } from './constants';
import LoginComponent from './components/LoginComponent';
import SuccessPopup from './components/SuccessPopup';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PersonsPage from './components/PersonsPage';
import ToolsPage from './components/ToolsPage';
import FAB from './components/FAB';
import TransactionModal from './components/TransactionModal';
import ContactModal from './components/ContactModal';
import PermissionModal from './components/PermissionModal';
import Toast from './components/Toast';
import ConfirmationModal from './components/ConfirmationModal';
import SignatureModal from './components/SignatureModal';
import EmailSummaryModal from './components/EmailSummaryModal';
import PDFPreview from './components/PDFPreview';
import CursorFollower from './components/CursorFollower';
import BudgetModal from './components/BudgetModal';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';
import CvAtsPage from './components/CvAtsPage';
import ConvertPage from './components/ConvertPage';
import FinanceHelperPage from './components/FinanceHelperPage';
import CvMakerPage from './components/CvMakerPage';
import CvParserPage from './components/CvParserPage';
import ImageEditorPage from './components/ImageEditorPage';
import VideoAnalysisPage from './components/VideoAnalysisPage';
import TtsPage from './components/TtsPage';
import ImageAnalysisPage from './components/ImageAnalysisPage';
import TypingMasterPage from './components/TypingMasterPage';
import MessageCenterModal from './components/MessageCenterModal';
import { 
    PasswordGeneratorWidget, 
    CalculatorWidget, 
    EmailCvWidget, 
    ThemeManagerWidget, 
    AboutMeWidget,
    DataManagementWidget,
    AdminUserManagementWidget,
    BroadcastWidget,
    ImportPasswordsWidget,
    ProfileSettingsWidget,
    AdminOverviewWidget,
} from './components/Widgets';

declare const html2canvas: any;
declare const jspdf: any;

const imageUrlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const hexToHslString = (hex: string): { primary: string; focus: string } | null => {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;

    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return {
        primary: `${h} ${s}% ${l}%`,
        focus: `${h} ${s}% ${Math.max(0, l - 5)}%`,
    };
};

const initialLayout: DashboardModule[] = [
  { id: 'summary', name: 'Financial Summary', isVisible: true },
  { id: 'reports', name: 'Reports and Actions', isVisible: true },
  { id: 'ai_insights', name: 'AI Insights', isVisible: true },
  { id: 'budgets', name: 'Budget Progress', isVisible: true },
  { id: 'visualizations', name: 'Weekly & Category Charts', isVisible: true },
  { id: 'monthly_chart', name: 'Monthly Summary Chart', isVisible: true },
  { id: 'transactions', name: 'Transaction List', isVisible: true },
];

const App: React.FC = () => {
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [loggedInAdminUser, setLoggedInAdminUser] = useState<AdminUser | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [activePage, setActivePage] = useState<Page>('dashboard');
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successRole, setSuccessRole] = useState<Role | null>(null);
    
    const [isTxModalOpen, setTxModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [contactModalType, setContactModalType] = useState<'receivable' | 'payable'>('receivable');

    const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
    const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
    const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
    
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
    const [colorTheme, setColorTheme] = useState<string>('theme-gold');

    const [signature, setSignature] = useState<string | null>(null);
    const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [isGeneratingPdf, setGeneratingPdf] = useState(false);

    // New admin user management state
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [availablePasswords, setAvailablePasswords] = useState<string[]>([]);
    const [usedPasswords, setUsedPasswords] = useState<string[]>([]);
    const [fullPasswordPool, setFullPasswordPool] = useState<string[]>([...PASSWORDS]);
    
    const [isCvAtsOpen, setCvAtsOpen] = useState(false);
    const [isConvertPageOpen, setConvertPageOpen] = useState(false);
    const [isFinanceHelperOpen, setFinanceHelperOpen] = useState(false);
    const [isCvMakerOpen, setCvMakerOpen] = useState(false);
    const [isCvParserOpen, setCvParserOpen] = useState(false);
    const [isImageEditorOpen, setImageEditorOpen] = useState(false);
    const [isVideoAnalysisOpen, setVideoAnalysisOpen] = useState(false);
    const [isTtsOpen, setTtsOpen] = useState(false);
    const [isImageAnalysisOpen, setImageAnalysisOpen] = useState(false);
    const [isTypingMasterOpen, setTypingMasterOpen] = useState(false);

    // Communication system state
    const [messages, setMessages] = useState<Message[]>([]);
    const [adminBroadcast, setAdminBroadcast] = useState<string>('');
    const [viewerBroadcast, setViewerBroadcast] = useState<string>('');
    const [isMessageCenterOpen, setMessageCenterOpen] = useState(false);
    const [initialMessageRecipient, setInitialMessageRecipient] = useState<string | null>(null);
    
    const [dashboardLayout, setDashboardLayout] = useState<DashboardModule[]>(() => {
        try {
            const savedLayout = localStorage.getItem('finance_dashboard_layout');
            if (savedLayout) {
                const parsed = JSON.parse(savedLayout);
                if (Array.isArray(parsed) && parsed.every(p => 'id' in p && 'isVisible' in p && 'name' in p)) {
                    const existingIds = new Set(parsed.map((p: DashboardModule) => p.id));
                    const missingModules = initialLayout.filter(m => !existingIds.has(m.id));
                    return [...parsed, ...missingModules];
                }
            }
        } catch (e) {
            console.error("Failed to parse dashboard layout from localStorage", e);
        }
        return initialLayout;
    });

    useEffect(() => {
        // Standard data
        const savedTx = localStorage.getItem('finance_transactions');
        const savedContacts = localStorage.getItem('finance_contacts');
        const savedBudgets = localStorage.getItem('finance_budgets');
        if (savedTx) {
             const parsedTx = JSON.parse(savedTx).map((tx: any) => ({
                ...tx,
                category: tx.category || 'Other',
                completed: tx.completed || false,
            }));
            setTransactions(parsedTx);
        }
        if (savedContacts) setContacts(JSON.parse(savedContacts));
        if (savedBudgets) setBudgets(JSON.parse(savedBudgets));

        // Theme and signature
        const savedTheme = localStorage.getItem('finance_theme_mode') as 'light' | 'dark';
        if (savedTheme) setTheme(savedTheme);
        const savedColorTheme = localStorage.getItem('finance_color_theme');
        if (savedColorTheme) setColorTheme(savedColorTheme);
        const savedSignature = localStorage.getItem('finance_signature');
        if (savedSignature) {
            setSignature(savedSignature);
        } else {
            const defaultSignatureUrl = 'https://i.postimg.cc/Gp3kyfFG/rsz_assistant-a-background-white-mor-1.jpg';
             imageUrlToBase64(defaultSignatureUrl)
                .then(base64 => {
                    setSignature(base64);
                    localStorage.setItem('finance_signature', base64);
                })
                .catch(err => console.error("Failed to load default signature:", err));
        }

        // --- NEW User & Password Management ---
        const savedUsers = localStorage.getItem('finance_admin_users');
        const loadedUsers: AdminUser[] = savedUsers ? JSON.parse(savedUsers) : [];
        setAdminUsers(loadedUsers);

        const savedPool = localStorage.getItem('finance_password_pool');
        const loadedPool: string[] = savedPool ? JSON.parse(savedPool) : [...PASSWORDS];
        setFullPasswordPool(loadedPool);
        
        const used = new Set(loadedUsers.map(u => u.password));
        setUsedPasswords(Array.from(used));

        const available = loadedPool.filter(p => !used.has(p));
        setAvailablePasswords(available);

        // Communication data
        const savedMessages = localStorage.getItem('finance_messages');
        if (savedMessages) setMessages(JSON.parse(savedMessages));
        const savedAdminBroadcast = localStorage.getItem('finance_broadcast_admin');
        if (savedAdminBroadcast) setAdminBroadcast(savedAdminBroadcast);
        const savedViewerBroadcast = localStorage.getItem('finance_broadcast_viewer');
        if (savedViewerBroadcast) setViewerBroadcast(savedViewerBroadcast);

    }, []);

    useEffect(() => {
        document.body.classList.remove('light-theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }
        localStorage.setItem('finance_theme_mode', theme);
    }, [theme]);

    useEffect(() => {
        document.body.classList.remove('theme-gold', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange', 'theme-teal', 'theme-pink');
        document.body.style.removeProperty('--color-primary');
        document.body.style.removeProperty('--color-primary-focus');
    
        if (colorTheme && colorTheme.startsWith('#')) {
            const hsl = hexToHslString(colorTheme);
            if (hsl) {
                document.body.style.setProperty('--color-primary', hsl.primary);
                document.body.style.setProperty('--color-primary-focus', hsl.focus);
            }
        } else if (colorTheme) {
            document.body.classList.add(colorTheme);
        }
    
        if (colorTheme) {
            localStorage.setItem('finance_color_theme', colorTheme);
        }
    }, [colorTheme]);
    
    useEffect(() => {
        localStorage.setItem('finance_dashboard_layout', JSON.stringify(dashboardLayout));
    }, [dashboardLayout]);
    
    const currentUserIdentifier = currentUserRole === 'super-admin' ? 'super-admin' : loggedInAdminUser?.username;

    const handleLogin = (username: string, password: string): boolean => {
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        let role: Role | null = null;
        let adminUserToSet: AdminUser | null = null;
        
        if (trimmedUsername.toLowerCase() === 'jewel' && trimmedPassword === 'Jewel0099') {
            role = 'super-admin';
        } else if (trimmedPassword === '12345') {
            role = 'viewer';
        } else {
            // Admin checks
            let foundUser: AdminUser | undefined;
            
            // 1. Standard check
            foundUser = adminUsers.find(user => user.username === trimmedUsername && user.password === trimmedPassword);
            
            // 2. Combined check (UsernamePassword in username field)
            if (!foundUser) {
                foundUser = adminUsers.find(user => (user.username + user.password) === trimmedUsername);
            }

            // 3. Fallback check (any username + 6-digit password)
            if (!foundUser && trimmedPassword.length >= 6) {
                const sixDigitCode = trimmedPassword.slice(-6);
                if (/^\d{6}$/.test(sixDigitCode)) {
                    foundUser = adminUsers.find(user => user.password === sixDigitCode);
                }
            }

            if (foundUser) {
                role = 'admin';
                adminUserToSet = foundUser;
            }
        }

        if (role) {
            setCurrentUserRole(role);
            if (role === 'admin' && adminUserToSet) setLoggedInAdminUser(adminUserToSet);
            setSuccessRole(role);
            setIsLoggedIn(true);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentUserRole(null);
        setLoggedInAdminUser(null);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const checkPermission = useCallback(() => {
        if (currentUserRole === 'viewer') {
            setPermissionModalOpen(true);
            return false;
        }
        return true;
    }, [currentUserRole]);

    const saveMessages = (newMessages: Message[]) => {
        setMessages(newMessages);
        localStorage.setItem('finance_messages', JSON.stringify(newMessages));
    };
    
    const handleSendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
        const newMessage: Message = {
            ...message,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        saveMessages([...messages, newMessage]);
    };

    const handleMarkConversationAsRead = (participant: string) => {
        if (!currentUserIdentifier) return;
        const updatedMessages = messages.map(msg => {
            if (msg.recipient === currentUserIdentifier && msg.sender === participant && !msg.isRead) {
                return { ...msg, isRead: true };
            }
            return msg;
        });
        saveMessages(updatedMessages);
    };

    const handleOpenMessageCenterWithUser = (username: string) => {
        setInitialMessageRecipient(username);
        setMessageCenterOpen(true);
    };
    
    const handleSetAdminBroadcast = (text: string) => {
        setAdminBroadcast(text);
        localStorage.setItem('finance_broadcast_admin', text);
    };
    const handleSetViewerBroadcast = (text: string) => {
        setViewerBroadcast(text);
        localStorage.setItem('finance_broadcast_viewer', text);
    };

    const saveTransactions = (newTransactions: Transaction[]) => {
        setTransactions(newTransactions);
        localStorage.setItem('finance_transactions', JSON.stringify(newTransactions));
    };

    const saveContacts = (newContacts: Contact[]) => {
        setContacts(newContacts);
        localStorage.setItem('finance_contacts', JSON.stringify(newContacts));
    };

    const saveBudgets = (newBudgets: Budget[]) => {
        setBudgets(newBudgets);
        localStorage.setItem('finance_budgets', JSON.stringify(newBudgets));
    };
    
    const saveAdminUsersAndPasswords = (users: AdminUser[], pool: string[]) => {
        setAdminUsers(users);
        setFullPasswordPool(pool);
        const used = new Set(users.map(u => u.password));
        setUsedPasswords(Array.from(used));
        setAvailablePasswords(pool.filter(p => !used.has(p)));
        localStorage.setItem('finance_admin_users', JSON.stringify(users));
        localStorage.setItem('finance_password_pool', JSON.stringify(pool));
    };

    const handleAddAdminUser = (newUser: Omit<AdminUser, 'id'>) => {
        const newAdmin: AdminUser = { ...newUser, id: Date.now() };
        const updatedUsers = [...adminUsers, newAdmin];
        saveAdminUsersAndPasswords(updatedUsers, fullPasswordPool);
        showToast('New admin user assigned!', 'success');
    };

    const handleUpdateAdminUser = (updatedUser: AdminUser) => {
        const updatedUsers = adminUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
        saveAdminUsersAndPasswords(updatedUsers, fullPasswordPool);
        showToast('Admin user updated!', 'success');
    };
    
    const handleProfileUpdate = (updatedData: Partial<Omit<AdminUser, 'id'>>) => {
        if (!loggedInAdminUser) return;
        const updatedUser = { ...loggedInAdminUser, ...updatedData };
        setLoggedInAdminUser(updatedUser);
        const updatedUsers = adminUsers.map(user => 
            user.id === loggedInAdminUser.id ? updatedUser : user
        );
        saveAdminUsersAndPasswords(updatedUsers, fullPasswordPool);
        showToast('Profile updated successfully!', 'success');
    };

    const handleImportPasswords = (newPasswords: string[]) => {
        const updatedPool = [...new Set([...fullPasswordPool, ...newPasswords])];
        saveAdminUsersAndPasswords(adminUsers, updatedPool);
        showToast(`${newPasswords.length} new passwords imported!`, 'success');
    };


    const handleOpenTxModal = (tx: Transaction | null = null) => {
        if (!checkPermission()) return;
        setEditingTx(tx);
        setTxModalOpen(true);
    };

    const handleSaveTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'completed'> & { id?: number }) => {
        if (tx.id) {
            const updated = transactions.map(t => t.id === tx.id ? { ...t, ...tx, amount: Number(tx.amount) } : t);
            saveTransactions(updated as Transaction[]);
            showToast('Transaction updated');
        } else {
            const newTx: Transaction = {
                ...tx,
                id: Date.now(),
                date: new Date().toISOString(),
                amount: Number(tx.amount),
                category: tx.category || 'Other',
                completed: false,
            };
            saveTransactions([...transactions, newTx]);
            showToast('Transaction saved');
        }
        setTxModalOpen(false);
    };

    const handleDeleteTransaction = (id: number) => {
        if (!checkPermission()) return;
        setConfirmModal({
            isOpen: true,
            title: 'Delete Transaction',
            message: 'Are you sure you want to permanently delete this transaction?',
            onConfirm: () => {
                saveTransactions(transactions.filter(t => t.id !== id));
                showToast('Transaction deleted', 'error');
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };
    
    const handleToggleTransactionCompleted = (id: number) => {
        if (!checkPermission()) return;
        const updatedTransactions = transactions.map(tx =>
            tx.id === id ? { ...tx, completed: !tx.completed } : tx
        );
        saveTransactions(updatedTransactions);
        showToast(`Transaction status updated`, 'success');
    };

    const handleOpenContactModal = (type: 'receivable' | 'payable', contact: Contact | null = null) => {
        if (!checkPermission()) return;
        setContactModalType(type);
        setEditingContact(contact);
        setContactModalOpen(true);
    };

    const handleSaveContact = (contact: Omit<Contact, 'id' | 'date'> & { id?: number }) => {
        if (contact.id) {
            const updated = contacts.map(c => c.id === contact.id ? { ...c, ...contact, amount: Number(contact.amount) } : c);
            saveContacts(updated as Contact[]);
            showToast('Person updated');
        } else {
            const newContact: Contact = {
                ...contact,
                id: Date.now(),
                date: new Date().toISOString(),
                amount: Number(contact.amount),
            };
            saveContacts([...contacts, newContact]);
            showToast('Person saved');
        }
        setContactModalOpen(false);
    };

    const handleDeleteContact = (id: number) => {
        if (!checkPermission()) return;
        setConfirmModal({
            isOpen: true,
            title: 'Delete Person',
            message: 'Are you sure you want to permanently delete this person?',
            onConfirm: () => {
                saveContacts(contacts.filter(c => c.id !== id));
                showToast('Person deleted', 'error');
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            }
        });
    };

    const handleSaveBudgets = (updatedBudgets: Budget[]) => {
        saveBudgets(updatedBudgets);
        showToast('Budgets saved successfully!');
        setBudgetModalOpen(false);
    };

    const handleWidgetSelect = (widget: Widget) => {
        setActiveWidget(prev => prev === widget ? null : widget);
    };

    const handleSaveSignature = (imgBase64: string) => {
        if (currentUserRole === 'admin') {
            handleProfileUpdate({ signature: imgBase64 });
        } else {
            setSignature(imgBase64);
            localStorage.setItem('finance_signature', imgBase64);
        }
        setSignatureModalOpen(false);
        showToast('Signature saved!');
    };
    
    const handleImportData = (type: 'transactions' | 'contacts', data: any[]) => {
        if (type === 'transactions') {
            const validatedData = data.map(d => ({ ...d, amount: Number(d.amount) || 0, completed: d.completed === 'true' || d.completed === true || false }));
            saveTransactions(validatedData as Transaction[]);
        } else {
            const validatedData = data.map(d => ({ ...d, amount: Number(d.amount) || 0 }));
            saveContacts(validatedData as Contact[]);
        }
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully!`, 'success');
    };

    const handleGeneratePdf = () => {
        showToast('Generating PDF...', 'success');
        setGeneratingPdf(true);
    
        setTimeout(() => {
            const { jsPDF } = jspdf;
            const reportElement = document.getElementById('pdf-report');
            if (reportElement) {
                html2canvas(reportElement, { scale: 2, useCORS: true }).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/jpeg', 0.7);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const canvasAspectRatio = canvasWidth / canvasHeight;
                    const scaledHeight = pdfWidth / canvasAspectRatio;

                    let position = 0;
                    let heightLeft = scaledHeight;
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft > 0) {
                        position -= pageHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
                        heightLeft -= pageHeight;
                    }
    
                    pdf.save('finance-summary.pdf');
                    setGeneratingPdf(false);
                }).catch((err: any) => {
                    console.error("Error generating PDF", err);
                    showToast('Error generating PDF', 'error');
                    setGeneratingPdf(false);
                });
            } else {
                 showToast('Could not find report element', 'error');
                 setGeneratingPdf(false);
            }
        }, 500);
    };

    const renderWidget = () => {
        switch (activeWidget) {
            case 'password':
                return <PasswordGeneratorWidget
                            onClose={() => setActiveWidget(null)} 
                            showToast={showToast}
                            availablePasswords={availablePasswords}
                            onAddAdminUser={handleAddAdminUser}
                        />;
            case 'calculator':
                return <CalculatorWidget onClose={() => setActiveWidget(null)} />;
            case 'email':
                return <EmailCvWidget onClose={() => setActiveWidget(null)} showToast={showToast} />;
            case 'theme':
                return <ThemeManagerWidget 
                            onClose={() => setActiveWidget(null)} 
                            currentTheme={theme}
                            setTheme={setTheme}
                            currentColorTheme={colorTheme}
                            setColorTheme={setColorTheme}
                            showToast={showToast}
                        />;
            case 'about':
                return <AboutMeWidget onClose={() => setActiveWidget(null)} />;
            case 'data':
                return <DataManagementWidget 
                            onClose={() => setActiveWidget(null)} 
                            showToast={showToast}
                            transactions={transactions}
                            contacts={contacts}
                            onImport={handleImportData}
                            setConfirmModal={setConfirmModal}
                        />;
            case 'adminManagement':
                return <AdminUserManagementWidget
                            onClose={() => setActiveWidget(null)}
                            showToast={showToast}
                            adminUsers={adminUsers}
                            onUpdateUser={handleUpdateAdminUser}
                            onSendMessageToUser={handleOpenMessageCenterWithUser}
                        />;
            case 'broadcast':
                 return <BroadcastWidget
                            onClose={() => setActiveWidget(null)}
                            showToast={showToast}
                            onSetAdminBroadcast={handleSetAdminBroadcast}
                            onSetViewerBroadcast={handleSetViewerBroadcast}
                            currentAdminBroadcast={adminBroadcast}
                            currentViewerBroadcast={viewerBroadcast}
                        />;
            case 'importPasswords':
                 return <ImportPasswordsWidget
                            onClose={() => setActiveWidget(null)}
                            showToast={showToast}
                            onImport={handleImportPasswords}
                            existingPasswords={fullPasswordPool}
                        />;
            case 'profileSettings':
                return loggedInAdminUser && (
                    <ProfileSettingsWidget
                        onClose={() => setActiveWidget(null)}
                        showToast={showToast}
                        currentUser={loggedInAdminUser}
                        onUpdateProfile={handleProfileUpdate}
                    />
                );
            case 'adminOverview':
                return (
                    <AdminOverviewWidget
                        onClose={() => setActiveWidget(null)}
                        adminUsers={adminUsers}
                    />
                );
            default:
                return null;
        }
    };


    if (!isLoggedIn) {
        return (
            <>
                <LoginComponent onLogin={handleLogin} adminUsers={adminUsers} showToast={showToast} />
                <CursorFollower />
            </>
        );
    }

    return (
        <div className={`role-${currentUserRole} min-h-screen`}>
            <CursorFollower />
            {showSuccess && successRole && <SuccessPopup role={successRole} />}
            <Toast message={toast?.message} type={toast?.type} isVisible={!!toast} />
            <PermissionModal isOpen={isPermissionModalOpen} onClose={() => setPermissionModalOpen(false)} />
            
            <Header
                role={currentUserRole}
                onLogout={handleLogout}
                activePage={activePage}
                setActivePage={setActivePage}
                theme={theme}
                setTheme={setTheme}
                onOpenCustomizeModal={() => setCustomizeModalOpen(true)}
                messages={messages}
                currentUserIdentifier={currentUserIdentifier || ''}
                onOpenMessageCenter={() => setMessageCenterOpen(true)}
                loggedInAdminUser={loggedInAdminUser}
            />

            {renderWidget()}
            
            <CustomizeDashboardModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setCustomizeModalOpen(false)}
                layout={dashboardLayout}
                setLayout={setDashboardLayout}
            />
            
            {(currentUserRole === 'admin' || currentUserRole === 'super-admin') && (
                <MessageCenterModal
                    isOpen={isMessageCenterOpen}
                    onClose={() => {
                        setMessageCenterOpen(false);
                        setInitialMessageRecipient(null);
                    }}
                    messages={messages}
                    currentUserIdentifier={currentUserIdentifier!}
                    onSendMessage={handleSendMessage}
                    onMarkConversationAsRead={handleMarkConversationAsRead}
                    role={currentUserRole}
                    showToast={showToast}
                    initialSelectedUser={initialMessageRecipient}
                />
            )}

            <main className="relative z-0 pt-20 sm:pt-6 pb-24 px-4">
                {activePage === 'dashboard' ? (
                    <Dashboard 
                        transactions={transactions} 
                        contacts={contacts} 
                        budgets={budgets}
                        onEditTransaction={handleOpenTxModal}
                        onDeleteTransaction={handleDeleteTransaction}
                        onToggleCompleted={handleToggleTransactionCompleted}
                        onAddTransaction={() => handleOpenTxModal()}
                        onEditContact={handleOpenContactModal}
                        onDeleteContact={handleDeleteContact}
                        onAddReceivable={() => handleOpenContactModal('receivable')}
                        onAddPayable={() => handleOpenContactModal('payable')}
                        onGeneratePdf={handleGeneratePdf}
                        onOpenEmailModal={() => setEmailModalOpen(true)}
                        onOpenSignatureModal={() => setSignatureModalOpen(true)}
                        onOpenBudgetModal={() => setBudgetModalOpen(true)}
                        dashboardLayout={dashboardLayout}
                        currentUserRole={currentUserRole}
                        adminBroadcast={adminBroadcast}
                        viewerBroadcast={viewerBroadcast}
                    />
                ) : activePage === 'persons' ? (
                    <PersonsPage
                        contacts={contacts}
                        onEditContact={handleOpenContactModal}
                        onDeleteContact={handleDeleteContact}
                        onAddReceivable={() => handleOpenContactModal('receivable')}
                        onAddPayable={() => handleOpenContactModal('payable')}
                    />
                ) : (
                    <ToolsPage 
                        onOpenCvAts={() => setCvAtsOpen(true)}
                        onOpenConvertPage={() => setConvertPageOpen(true)}
                        onOpenFinanceHelper={() => setFinanceHelperOpen(true)}
                        onOpenCvMaker={() => setCvMakerOpen(true)}
                        onOpenCvParser={() => setCvParserOpen(true)}
                        onOpenImageEditor={() => setImageEditorOpen(true)}
                        onOpenVideoAnalysis={() => setVideoAnalysisOpen(true)}
                        onOpenTts={() => setTtsOpen(true)}
                        onOpenImageAnalysis={() => setImageAnalysisOpen(true)}
                        onOpenTypingMaster={() => setTypingMasterOpen(true)}
                        onWidgetSelect={handleWidgetSelect}
                        role={currentUserRole}
                    />
                )}
            </main>
            
            <CvAtsPage isOpen={isCvAtsOpen} onClose={() => setCvAtsOpen(false)} showToast={showToast} />
            <ConvertPage isOpen={isConvertPageOpen} onClose={() => setConvertPageOpen(false)} showToast={showToast} />
            <FinanceHelperPage isOpen={isFinanceHelperOpen} onClose={() => setFinanceHelperOpen(false)} showToast={showToast} />
            <CvMakerPage isOpen={isCvMakerOpen} onClose={() => setCvMakerOpen(false)} showToast={showToast} />
            <CvParserPage isOpen={isCvParserOpen} onClose={() => setCvParserOpen(false)} showToast={showToast} />
            <ImageEditorPage isOpen={isImageEditorOpen} onClose={() => setImageEditorOpen(false)} showToast={showToast} />
            <VideoAnalysisPage isOpen={isVideoAnalysisOpen} onClose={() => setVideoAnalysisOpen(false)} showToast={showToast} />
            <TtsPage isOpen={isTtsOpen} onClose={() => setTtsOpen(false)} showToast={showToast} />
            <ImageAnalysisPage isOpen={isImageAnalysisOpen} onClose={() => setImageAnalysisOpen(false)} showToast={showToast} />
            <TypingMasterPage isOpen={isTypingMasterOpen} onClose={() => setTypingMasterOpen(false)} showToast={showToast} role={currentUserRole} />


            {activePage === 'dashboard' && <FAB onClick={() => handleOpenTxModal()} />}

            {isTxModalOpen && (
                <TransactionModal
                    isOpen={isTxModalOpen}
                    onClose={() => setTxModalOpen(false)}
                    onSave={handleSaveTransaction}
                    transaction={editingTx}
                />
            )}
            
            {isContactModalOpen && (
                <ContactModal
                    isOpen={isContactModalOpen}
                    onClose={() => setContactModalOpen(false)}
                    onSave={handleSaveContact}
                    contact={editingContact}
                    type={contactModalType}
                />
            )}

            {isBudgetModalOpen && (
                <BudgetModal
                    isOpen={isBudgetModalOpen}
                    onClose={() => setBudgetModalOpen(false)}
                    onSave={handleSaveBudgets}
                    currentBudgets={budgets}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
            >
                <p className="font-bangla text-base-content">{confirmModal.message}</p>
            </ConfirmationModal>

            {isSignatureModalOpen && (
                <SignatureModal 
                    isOpen={isSignatureModalOpen}
                    onClose={() => setSignatureModalOpen(false)}
                    onSave={handleSaveSignature}
                    currentSignature={currentUserRole === 'admin' ? loggedInAdminUser?.signature : signature}
                />
            )}

            {isEmailModalOpen && (
                <EmailSummaryModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setEmailModalOpen(false)}
                    showToast={showToast}
                    transactions={transactions}
                    contacts={contacts}
                />
            )}
            
            {isGeneratingPdf && (
                <PDFPreview 
                    transactions={transactions} 
                    contacts={contacts} 
                    userRole={currentUserRole} 
                    signature={(currentUserRole === 'admin' ? loggedInAdminUser?.signature : signature) || signature} 
                />
            )}
        </div>
    );
};

export default App;