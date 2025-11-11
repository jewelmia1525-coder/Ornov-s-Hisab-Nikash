import React, { useState, useEffect, useRef } from 'react';
import { AdminUser } from '../types';

declare const emailjs: any;

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminUsers: AdminUser[];
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const LoadingIndicator: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('Verifying your details...');

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress > 33 && newProgress <= 66) setMessage('Contacting secure server...');
                if (newProgress > 66) setMessage('Finalizing request...');
                return newProgress;
            });
        }, 100); // 100ms * 100 steps = 10s

        return () => clearInterval(interval);
    }, []);

    const circumference = 2 * Math.PI * 54; // 2 * pi * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--color-primary) / 0.1)" strokeWidth="12" />
                    <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="hsl(var(--color-primary))"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        className="transition-all duration-100"
                    />
                </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <p className="font-semibold text-base-content mt-4 animate-pulse">{message}</p>
        </div>
    );
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, adminUsers, showToast }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<'form' | 'loading' | 'reveal' | 'error'>('form');
    const [revealedUser, setRevealedUser] = useState<AdminUser | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);
    const [titleId] = useState(() => `forgot-pw-title-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (isOpen) {
            triggerElementRef.current = document.activeElement as HTMLElement;
            
            const timer = setTimeout(() => {
                 const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                focusableElements?.[0]?.focus();
            }, 100);
            
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) { // Shift+Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('keydown', handleKeyDown);
                triggerElementRef.current?.focus();
            };

        }
    }, [isOpen, step]); // Re-run when step changes to find new focusable elements

    const sendRecoveryAttemptEmail = () => {
        const templateParams = {
            to_email: 'Eng.jewelmia@gmil.com',
            subject: 'Password Recovery Attempt',
            reply_to: email || 'not-provided@system.com',
            from_name: 'Finance Dashboard System',
            cv_text: `A user has attempted to recover their password.\n\nDetails provided:\n- Username: ${username}\n- Email: ${email}\n- Phone: ${phone}\n\nTimestamp: ${new Date().toString()}`
        };
        const SERVICE_ID = 'service_7bnmsc5';
        const TEMPLATE_ID = 'template_txw5kbb';
        const PUBLIC_KEY = 'xn72TxUTNzE92DKwt';
        
        emailjs.init({ publicKey: PUBLIC_KEY });
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
            .then(() => console.log("Recovery attempt email sent."))
            .catch((err: any) => console.error("Failed to send recovery email:", err));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');
        sendRecoveryAttemptEmail();

        setTimeout(() => {
            const foundUser = adminUsers.find(user => 
                (user.username && username && user.username.toLowerCase() === username.toLowerCase()) ||
                (user.email && email && user.email.toLowerCase() === email.toLowerCase()) ||
                (user.mobile && phone && user.mobile === phone)
            );

            if (foundUser) {
                setRevealedUser(foundUser);
                setStep('reveal');
            } else {
                setStep('error');
            }
        }, 10000);
    };
    
    const handleCopyPassword = () => {
        if (!revealedUser) return;
        const textToCopy = revealedUser.password;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Password copied to clipboard!', 'success');
            handleClose();
        });
    };

    const handleClose = () => {
        setUsername('');
        setEmail('');
        setPhone('');
        setRevealedUser(null);
        setStep('form');
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'loading':
                return <LoadingIndicator />;
            case 'reveal':
                return (
                    <div className="text-center animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 id={titleId} className="font-bangla text-xl font-bold text-primary mb-2">Password Recovered</h2>
                        <p className="text-sm text-base-content mb-4">Your password is shown below. Copy it and log in.</p>
                        <div className="flex items-center justify-between bg-base-100 p-3 rounded-lg border border-primary/20">
                            <span className="font-mono text-lg font-bold text-primary">{revealedUser?.password}</span>
                            <button onClick={handleCopyPassword} className="px-3 py-1.5 bg-primary text-primary-content font-semibold rounded-lg text-sm hover:bg-primary-focus transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copy
                            </button>
                        </div>
                    </div>
                );
             case 'error':
                return (
                    <div className="text-center animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-danger mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 id={titleId} className="font-bangla text-xl font-bold text-danger mb-2">Verification Failed</h2>
                        <p className="text-sm text-base-content mb-6">The information provided does not match our records. Please try again or contact support.</p>
                        <button onClick={() => setStep('form')} className="w-full py-3 bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors">Try Again</button>
                    </div>
                );
            case 'form':
            default:
                return (
                    <>
                        <h2 id={titleId} className="font-bangla text-xl font-bold text-primary text-center mb-2">Forgot Your Password?</h2>
                        <p className="text-center text-sm text-muted-content mb-6">Enter your details to recover your password. A notification will be sent to the system administrator.</p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-muted-content mb-1 text-left" htmlFor="reset-username">Username</label>
                                <input id="reset-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 bg-base-300/50 border border-primary/30 rounded-lg text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="Enter username" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-content mb-1 text-left" htmlFor="reset-email">Email</label>
                                <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-base-300/50 border border-primary/30 rounded-lg text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="Enter email address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-content mb-1 text-left" htmlFor="reset-phone">Phone Number</label>
                                <input id="reset-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-base-300/50 border border-primary/30 rounded-lg text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="Enter phone number" />
                            </div>
                            <button type="submit" className="w-full !mt-5 py-3 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all shadow-md disabled:bg-primary/70 disabled:cursor-not-allowed" disabled={!username && !email && !phone}>
                                Send Reset Link
                            </button>
                        </form>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" onClick={handleClose}>
            <div ref={modalRef} className="bg-base-200 border border-primary/30 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-[scale-in_0.3s_ease-out]" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-muted-content hover:text-primary text-2xl transition-transform hover:rotate-90 z-10">×</button>
                {renderContent()}
            </div>
            <style>{`
                @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default ForgotPasswordModal;