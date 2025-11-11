
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);
    const [titleId] = useState(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);

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
                if (e.key !== 'Tab') return;
                if (!focusableElements || focusableElements.length === 0) return;

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
            
            const modalNode = modalRef.current;
            modalNode?.addEventListener('keydown', handleKeyDown);

            return () => {
                modalNode?.removeEventListener('keydown', handleKeyDown);
                triggerElementRef.current?.focus();
            };

        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-base-200 border border-primary/30 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-[scale-in_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <h2 id={titleId} className="font-bangla text-xl font-bold text-primary text-center mb-6">{title}</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-content hover:text-primary text-2xl transition-transform hover:rotate-90">×</button>
                {children}
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

export default Modal;
