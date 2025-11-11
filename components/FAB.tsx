
import React from 'react';

interface FABProps {
    onClick: () => void;
}

const FAB: React.FC<FABProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-full text-primary-content text-3xl flex items-center justify-center shadow-lg shadow-primary/40 hover:bg-primary-focus transition-all transform hover:scale-110 z-40"
            title="Add Transaction"
            aria-label="Add new transaction"
        >
            +
        </button>
    );
};

export default FAB;
