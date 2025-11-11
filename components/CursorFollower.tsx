import React, { useState, useEffect } from 'react';

const CursorFollower: React.FC = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea, [role="button"]')) {
                setIsPointer(true);
            } else {
                setIsPointer(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const dotClasses = `cursor-dot ${isPointer ? 'pointer' : ''}`;
    const outlineClasses = `cursor-outline ${isPointer ? 'pointer' : ''}`;

    return (
        <>
            <div
                className={outlineClasses}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            />
            <div
                className={dotClasses}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            />
        </>
    );
};

export default CursorFollower;
