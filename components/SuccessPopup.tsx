
import React, { useEffect, useRef } from 'react';
import { Role } from '../types';

interface SuccessPopupProps {
    role: Role;
}

const Sparkle: React.FC = () => {
    const style: React.CSSProperties = {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        animationDelay: `${Math.random() * 1}s`,
    };
    return (
        <div 
            className="absolute bg-white rounded-full opacity-0 animate-[sparkle-anim_1s_ease-out_forwards] shadow-[0_0_5px_white,0_0_10px_white,0_0_15px_hsl(var(--color-primary))]"
            style={style}
        ></div>
    );
};

const SuccessPopup: React.FC<SuccessPopupProps> = ({ role }) => {
    const getMessage = () => {
        switch (role) {
            case 'super-admin':
                return { title: 'অভিনন্দন!', message: 'Super Admin Login Successful!' };
            case 'admin':
                return { title: 'Login Successfully', message: 'Welcome, Admin!' };
            case 'viewer':
                return { title: 'Login Success', message: 'Welcome, Viewer!' };
            default:
                return { title: 'Success', message: 'Welcome!' };
        }
    };

    const { title, message } = getMessage();

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10020] animate-[fade-in_0.3s_ease-out]">
            <div className="bg-base-200 border border-primary rounded-2xl shadow-2xl shadow-primary/30 w-11/12 max-w-sm p-8 text-center relative overflow-hidden animate-[scale-in_0.3s_ease-out]">
                {role === 'super-admin' && Array.from({ length: 30 }).map((_, i) => <Sparkle key={i} />)}
                <h2 className="font-bangla text-3xl font-bold text-primary mb-2 drop-shadow-[0_0_10px_hsl(var(--color-primary))]">{title}</h2>
                <p className="font-bangla text-lg text-base-content">{message}</p>
            </div>
            <style>{`
                @keyframes sparkle-anim {
                    0% { transform: scale(0); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(0); opacity: 0; }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                 @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SuccessPopup;
