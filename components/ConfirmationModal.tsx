
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);
    const [titleId] = useState(() => `confirm-modal-title-${Math.random().toString(36).substr(2, 9)}`);

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10015] p-4" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-base-200 border border-danger rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-[scale-in_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <h2 id={titleId} className="font-bangla text-xl font-bold text-danger mb-4">{title}</h2>
                <div className="text-base-content mb-6">
                    {children}
                </div>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose} 
                        className="w-full px-4 py-2 bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="w-full px-4 py-2 bg-danger text-white rounded-lg font-semibold hover:bg-danger/80 transition-colors"
                    >
                        Confirm Delete
                    </button>
                </div>
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

export default ConfirmationModal;
