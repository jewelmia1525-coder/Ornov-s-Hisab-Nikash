import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DashboardModule } from '../types';

interface CustomizeDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    layout: DashboardModule[];
    setLayout: (layout: DashboardModule[]) => void;
}

const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ isOpen, onClose, layout, setLayout }) => {
    const [localLayout, setLocalLayout] = useState<DashboardModule[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLocalLayout([...layout]);
        }
    }, [isOpen, layout]);

    const handleToggleVisibility = (id: string) => {
        setLocalLayout(prevLayout =>
            prevLayout.map(module =>
                module.id === id ? { ...module, isVisible: !module.isVisible } : module
            )
        );
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...localLayout];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLayout.length) return;
        
        [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
        setLocalLayout(newLayout);
    };

    const handleSave = () => {
        setLayout(localLayout);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Customize Dashboard">
            <div className="space-y-3">
                <p className="text-sm text-muted-content text-center mb-4">Toggle visibility and reorder your dashboard modules.</p>
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {localLayout.map((module, index) => (
                        <li key={module.id} className="flex items-center justify-between p-3 bg-base-300/40 rounded-lg">
                            <span className="font-semibold text-base-content">{module.name}</span>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <button 
                                        onClick={() => handleMove(index, 'up')} 
                                        disabled={index === 0}
                                        className="text-lg leading-none disabled:opacity-30"
                                        aria-label={`Move ${module.name} up`}
                                    >▲</button>
                                    <button 
                                        onClick={() => handleMove(index, 'down')} 
                                        disabled={index === localLayout.length - 1}
                                        className="text-lg leading-none disabled:opacity-30"
                                        aria-label={`Move ${module.name} down`}
                                    >▼</button>
                                </div>
                                <button 
                                    onClick={() => handleToggleVisibility(module.id)}
                                    className={`w-12 h-6 rounded-full relative px-1 flex items-center transition-colors ${module.isVisible ? 'bg-success' : 'bg-base-100'}`}
                                    aria-pressed={module.isVisible}
                                    aria-label={`Toggle visibility of ${module.name}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${module.isVisible ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="pt-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-base-300 hover:bg-base-300/70 border border-primary/20 rounded-lg font-semibold text-base-content transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-primary-content font-bold rounded-lg hover:bg-primary-focus transition-all">
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CustomizeDashboardModal;
