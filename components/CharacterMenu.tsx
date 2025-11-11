import React, { useState, useRef, useEffect } from 'react';
import { CartoonCharacter, CartoonStyle } from '../types';

const CHARACTERS: { id: CartoonCharacter, name: string, icon: string }[] = [
    { id: 'blob', name: 'Blob', icon: '💧' },
    { id: 'bot', name: 'Bot', icon: '🤖' },
    { id: 'pixie', name: 'Pixie', icon: '🧚' },
];

const STYLES: { id: CartoonStyle, name: string, icon: string }[] = [
    { id: 'default', name: 'Default', icon: '👕' },
    { id: 'hat', name: 'Hat', icon: '🎩' },
    { id: 'bowtie', name: 'Bow Tie', icon: '🎀' },
];

interface CharacterMenuProps {
    selectedCharacter: CartoonCharacter;
    onCharacterChange: (c: CartoonCharacter) => void;
    selectedStyle: CartoonStyle;
    onStyleChange: (s: CartoonStyle) => void;
}

const CharacterMenu: React.FC<CharacterMenuProps> = ({ selectedCharacter, onCharacterChange, selectedStyle, onStyleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="absolute top-0 right-0 z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-base-300/50 hover:bg-base-300 flex items-center justify-center text-muted-content"
                title="Customize Character"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute top-10 right-0 w-56 bg-base-200 border border-primary/20 rounded-xl shadow-lg p-2 origin-top-right animate-[slide-down_0.2s_ease-out] z-10">
                    <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-muted-content uppercase">Change Character</p>
                    </div>
                    {CHARACTERS.map(char => (
                        <button
                            key={char.id}
                            onClick={() => { onCharacterChange(char.id); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${selectedCharacter === char.id ? 'bg-primary/20 text-primary' : 'text-muted-content hover:bg-base-300'}`}
                        >
                            <span className="text-lg">{char.icon}</span>
                            <span>{char.name}</span>
                        </button>
                    ))}
                    <div className="border-t border-primary/10 my-2"></div>
                    <div className="px-2 py-1">
                        <p className="text-xs font-semibold text-muted-content uppercase">Change Dress Style</p>
                    </div>
                    {STYLES.map(style => (
                        <button
                            key={style.id}
                            onClick={() => { onStyleChange(style.id); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${selectedStyle === style.id ? 'bg-primary/20 text-primary' : 'text-muted-content hover:bg-base-300'}`}
                        >
                            <span className="text-lg">{style.icon}</span>
                            <span>{style.name}</span>
                        </button>
                    ))}
                </div>
            )}
             <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CharacterMenu;