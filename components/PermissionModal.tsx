
import React, { useEffect, useRef, useState } from 'react';

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);
    const [titleId] = useState(() => `perm-modal-title-${Math.random().toString(36).substr(2, 9)}`);
    
    useEffect(() => {
        if (isOpen) {
            triggerElementRef.current = document.activeElement as HTMLElement;

            const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements?.[0];
            const lastElement = focusableElements && focusableElements[focusableElements.length - 1];

            setTimeout(() => firstElement?.focus(), 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key !== 'Tab' || !focusableElements || focusableElements.length === 0) return;

                if (e.shiftKey) { // Shift+Tab
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                triggerElementRef.current?.focus();
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10010] p-4" onClick={onClose}>
            <div 
                ref={modalRef}
                className="bg-base-200 border border-danger rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-[scale-in_0.3s_ease-out]"
                onClick={e => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby="perm-modal-desc"
            >
                <h2 id={titleId} className="font-bangla text-2xl font-bold text-danger mb-3">LOGIN TO ADMIN</h2>
                <p id="perm-modal-desc" className="font-bangla text-base-content mb-5">সম্পূর্ণ অ্যাক্সেসের জন্য অ্যাডমিন হিসাবে লগইন করুন। অনুগ্রহ করে নিচের WhatsApp নম্বরে যোগাযোগ করুন।</p>
                <div className="my-5">
                    <a href="https://wa.me/8801402284322" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors bg-base-300/50 px-4 py-2 rounded-lg">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.52 3.48A11.87 11.87 0 0012 .6 11.4 11.4 0 00.6 12.08a11.27 11.27 0 001.58 5.83L.6 23.4l5.61-1.47a11.5 11.5 0 005.81 1.53A11.45 11.45 0 0023.4 12a11.87 11.87 0 00-2.88-8.52zM12 21.07a9.29 9.29 0 01-4.74-1.28l-.34-.2-3.33.87.9-3.25-.22-.33A9.22 9.22 0 012.72 12a9.28 9.28 0 1118.56 0A9.28 9.28 0 0112 21.07zm4.84-6.64c-.26-.13-1.54-.76-1.78-.85s-.42-.13-.6.13-.68.85-.83 1-.3.19-.56.06a7.65 7.65 0 01-2.25-1.39 8.43 8.43 0 01-1.56-1.94c-.16-.26 0-.4.12-.53.12-.12.26-.3.4-.45a1.79 1.79 0 00.27-.45.5.5 0 000-.47c-.07-.13-.6-1.44-.83-1.98s-.44-.46-.6-.47h-.51a1 1 0 00-.72.33A3 3 0 007 8.46a5.17 5.17 0 001.1 2.72A11.83 11.83 0 0012 14.68a5.44 5.44 0 001.38.18 3.28 3.28 0 002.13-1.36 2.69 2.69 0 00.33-1.39c0-.26-.02-.46-.06-.64a.47.47 0 00-.14-.22z"/></svg>
                        +8801402284322
                    </a>
                </div>
                <button onClick={onClose} className="font-bangla px-6 py-2 bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors">বন্ধ করুন</button>
            </div>
             <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default PermissionModal;
