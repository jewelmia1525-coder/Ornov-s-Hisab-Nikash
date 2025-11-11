import React, { ReactNode } from 'react';

interface WidgetContainerProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ title, onClose, children }) => {
    return (
        <div className="fixed top-16 right-4 w-80 bg-base-200 border border-primary/20 rounded-2xl shadow-2xl z-50 animate-[slide-in_0.3s_ease-out]">
            <div className="flex justify-between items-center p-3 border-b border-primary/20">
                <h3 className="font-semibold text-base-content">{title}</h3>
                <button onClick={onClose} className="text-muted-content hover:text-primary text-2xl transition-transform hover:rotate-90">×</button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
                {children}
            </div>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default WidgetContainer;
