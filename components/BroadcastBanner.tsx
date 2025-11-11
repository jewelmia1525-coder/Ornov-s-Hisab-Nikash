import React from 'react';

interface BroadcastBannerProps {
    text: string;
}

const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ text }) => {
    // Duplicate text for seamless looping
    const longText = `... ${text} ... ... ${text} ... ... ${text} ...`;

    return (
        <div className="bg-primary/80 text-primary-content text-sm font-semibold overflow-hidden whitespace-nowrap py-2 shadow-lg rounded-md relative group">
            <div className="animate-marquee group-hover:pause-animation">{longText}</div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: inline-block;
                    animation: marquee 40s linear infinite;
                    will-change: transform;
                }
                .pause-animation {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default BroadcastBanner;
