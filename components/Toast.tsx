
import React from 'react';

// Icons
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface ToastProps {
    message?: string;
    type?: 'success' | 'error';
    isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible }) => {
    if (!isVisible || !message) {
        return null;
    }

    const typeClasses = type === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
        : 'bg-gradient-to-r from-red-500 to-rose-500';
        
    const Icon = type === 'success' ? <CheckCircleIcon /> : <XCircleIcon />;

    return (
        <>
            <div 
                className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white font-semibold shadow-2xl z-[10030] flex items-center gap-3 animate-toast-in-out ${typeClasses}`}
                role="alert"
                aria-live="assertive"
            >
                {Icon}
                <span>{message}</span>
            </div>
            <style>{`
                @keyframes toast-in-out {
                    0% {
                        transform: translateY(-150%) translateX(-50%);
                        opacity: 0;
                    }
                    10%, 90% {
                        transform: translateY(0) translateX(-50%);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-150%) translateX(-50%);
                        opacity: 0;
                    }
                }
                .animate-toast-in-out {
                    animation: toast-in-out 3s ease-in-out forwards;
                }
            `}</style>
        </>
    );
};

export default Toast;
