import React from 'react';
import { CartoonCharacter, CartoonStyle } from '../types';

interface AnimatedCharacterProps {
    mood: 'happy' | 'sad';
    character: CartoonCharacter;
    style: CartoonStyle;
    dollState?: string;
    dollStyle?: React.CSSProperties;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ mood, character, style, dollState, dollStyle }) => {
    
    const characterSpecificProps = character === 'pixie' 
        ? { style: dollStyle, className: `character-container pixie-master ${dollState || ''}` } 
        : { className: "character-container" };

    return (
        <>
            <div {...characterSpecificProps}>
                <div className={`character-body ${character} ${mood}`}>
                    <div className="face">
                        <div className={`eyes ${mood}`}>
                            <div className="eye left"></div>
                            <div className="eye right"></div>
                        </div>
                        <div className={`mouth ${mood}`}></div>
                    </div>
                     {character === 'pixie' && (
                        <>
                            <div className="pixie-hair"></div>
                            <div className="pixie-wing left"></div>
                            <div className="pixie-wing right"></div>
                        </>
                    )}
                </div>
                 {style === 'hat' && <div className={`accessory hat ${character}`}></div>}
                {style === 'bowtie' && <div className={`accessory bowtie ${character}`}></div>}
                {dollState === 'SLEEPING' && <div className="sleep-emoji">Zzz</div>}
            </div>
            <style>{`
                /* General */
                .character-container {
                    width: 100px;
                    height: 100px;
                    position: relative;
                    transform: scale(0.9);
                }
                .character-body {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    position: relative;
                    animation: bob 3s ease-in-out infinite;
                    transition: background-color 0.5s ease, box-shadow 0.5s ease;
                }

                @keyframes bob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                /* --- Pixie Character --- */
                 .pixie-master {
                    position: absolute;
                    width: 50px;
                    height: 60px;
                    z-index: 10;
                    opacity: 0.9;
                }
                .character-body.pixie {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    left: 5px;
                    animation: none; /* Master container handles bobbing */
                    background: #fecdd3; /* pink-200 */
                    border: 2px solid #be123c; /* pink-700 */
                }
                .pixie.happy { background: #f9a8d4; }
                .pixie.sad { background: #e5e7eb; /* gray-200 */ }

                .pixie-hair {
                    width: 44px;
                    height: 25px;
                    background: hsl(var(--color-primary));
                    position: absolute;
                    top: -10px;
                    left: -2px;
                    border-radius: 50% 50% 0 0;
                }
                 .pixie-wing {
                    width: 25px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.7);
                    border: 2px solid #a78bfa; /* violet-400 */
                    border-radius: 50% 10px;
                    position: absolute;
                    top: 0;
                    transform-origin: bottom right;
                }
                .pixie-wing.left { left: -15px; transform: rotate(20deg); }
                .pixie-wing.right { right: -15px; transform: scaleX(-1) rotate(20deg); }
                
                .pixie-master.FLYING_TO_BALANCE .pixie-wing,
                .pixie-master.FLYING_TO_BED .pixie-wing,
                .pixie-master.WAKING_UP .pixie-wing {
                    animation: flap 0.3s ease-in-out infinite alternate;
                }
                @keyframes flap {
                    from { transform: rotate(20deg); }
                    to { transform: rotate(-20deg); }
                }
                .pixie-master.FLYING_TO_BALANCE .pixie-wing.right,
                .pixie-master.FLYING_TO_BED .pixie-wing.right,
                .pixie-master.WAKING_UP .pixie-wing.right {
                     animation: flap-right 0.3s ease-in-out infinite alternate;
                }
                 @keyframes flap-right {
                    from { transform: scaleX(-1) rotate(20deg); }
                    to { transform: scaleX(-1) rotate(-20deg); }
                }

                .sleep-emoji {
                    position: absolute;
                    top: -10px;
                    right: -5px;
                    font-size: 16px;
                    font-weight: bold;
                    color: hsl(var(--color-primary));
                    animation: sleep-bob 2s ease-in-out infinite;
                }
                 @keyframes sleep-bob {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
                    50% { transform: translateY(-10px) scale(1.1); opacity: 0.5; }
                }


                /* Blob Character */
                .character-body.blob.happy { background: hsl(var(--color-primary)); }
                .character-body.blob.sad { background: #818cf8; /* indigo-400 */ }
                .character-body.blob {
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                    animation: bob 3s ease-in-out infinite, blob-shape 8s ease-in-out infinite;
                }
                @keyframes blob-shape {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                }

                /* Bot Character */
                .character-body.bot {
                    width: 90px;
                    height: 90px;
                    border-radius: 15px;
                    background: #9ca3af; /* gray-400 */
                    margin: 5px;
                    border: 4px solid #4b5563; /* gray-700 */
                }
                .character-body.bot.happy { box-shadow: 0 0 15px hsl(var(--color-primary)); }
                .character-body.bot.sad { box-shadow: 0 0 15px #6b7280; /* gray-500 */ }

                /* Face elements */
                .face {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60%;
                    height: 50%;
                }
                .pixie .face { z-index: 2; }

                .eyes {
                    display: flex;
                    justify-content: space-between;
                    position: absolute;
                    top: 15%;
                    width: 100%;
                }
                .eye {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    border: 1.5px solid #1f2937;
                }
                .pixie .eye { width: 5px; height: 5px; }

                /* Happy Eyes */
                .eyes.happy .eye {
                    height: 10px;
                    border-radius: 50% 50% 30% 30%;
                    animation: happy-blink 4s infinite;
                }
                 .pixie .eyes.happy .eye { height: 6px; }

                @keyframes happy-blink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }

                /* Sad Eyes */
                .eyes.sad .eye {
                    height: 6px;
                    border-radius: 50% 50% 0 0;
                    background: transparent;
                    border-color: #1f2937;
                    border-bottom: none;
                    animation: sad-eyes 2s ease-in-out infinite alternate;
                }
                 .pixie .eyes.sad .eye { height: 4px; }

                @keyframes sad-eyes {
                    from { transform: translateY(-1px); }
                    to { transform: translateY(1px); }
                }

                /* Mouth */
                .mouth {
                    position: absolute;
                    bottom: 10%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 10px;
                    border: 2px solid #1f2937;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                    border-bottom-left-radius: 20px 15px;
                    border-bottom-right-radius: 20px 15px;
                    transition: all 0.3s ease;
                }
                 .pixie .mouth { width: 10px; height: 5px; border-width: 1.5px; }

                /* Happy Mouth */
                .mouth.happy {
                    border-color: transparent;
                    border-bottom-color: #1f2937;
                }
                
                /* Sad Mouth */
                .mouth.sad {
                    transform: translateX(-50%) rotate(180deg);
                    bottom: 25%;
                }

                /* Accessories */
                .accessory {
                    position: absolute;
                    z-index: 10;
                }

                .hat {
                    width: 60px;
                    height: 15px;
                    background: #111827; /* gray-900 */
                    border-radius: 6px 6px 0 0;
                    top: -5px;
                    left: 50%;
                    transform: translateX(-50%) rotate(-10deg);
                }
                .hat::before {
                    content: '';
                    position: absolute;
                    width: 80px;
                    height: 8px;
                    background: #111827;
                    border-radius: 4px;
                    bottom: 0;
                    left: -10px;
                }
                .hat.bot { top: -12px; }
                .hat.pixie {
                    top: -15px;
                    left: 25px;
                    transform: translateX(-50%) rotate(-15deg) scale(0.6);
                    z-index: 3;
                }

                .bowtie {
                    width: 25px;
                    height: 25px;
                    border: 4px solid #dc2626; /* red-600 */
                    border-radius: 12px 0;
                    transform: rotate(45deg);
                    bottom: -10px;
                    left: 50%;
                    margin-left: -12.5px;
                }
                .bowtie::before {
                    content: '';
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #dc2626;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .bowtie.pixie {
                    bottom: -2px;
                    left: 25px;
                    transform: rotate(45deg) scale(0.5);
                    z-index: 3;
                }
            `}</style>
        </>
    );
};

export default AnimatedCharacter;