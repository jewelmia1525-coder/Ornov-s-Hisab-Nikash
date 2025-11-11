
import React from 'react';

interface ProfileCardProps {
    name: string;
    badge: string;
    subtitle: string;
    photo: string;
}

const FeatureIcon: React.FC<{ icon: React.ReactElement; label: string }> = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="w-12 h-12 bg-base-100/50 rounded-full flex items-center justify-center border border-primary/20 text-primary">
            {icon}
        </div>
        <span className="text-xs font-semibold text-muted-content uppercase tracking-wider">{label}</span>
    </div>
);


const ProfileCard: React.FC<ProfileCardProps> = ({ name, badge, subtitle, photo }) => {
    const isSuperAdmin = badge.includes('SUPER');

    return (
        <div className="relative w-96 bg-base-200 border border-primary/20 rounded-2xl pt-20 pb-6 px-6 shadow-2xl shadow-primary/10 transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 flex flex-col items-center text-center">
            
            {/* Overlapping Photo */}
            <div className="absolute top-0 -translate-y-1/2">
                <div className="relative">
                    <img src={photo} alt={name} className="w-28 h-28 rounded-full object-cover border-4 border-base-200 shadow-lg" />
                    <div className="absolute -inset-1 rounded-full animate-theme-glow"></div>
                </div>
            </div>
            
            {/* Text Content */}
            <div className="w-full">
                {isSuperAdmin ? (
                     <p className="text-sm font-bold uppercase text-yellow-900 bg-gradient-to-br from-yellow-400 to-amber-500 px-4 py-1.5 rounded-full shadow-md border border-yellow-600/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] inline-block">
                        {badge}
                    </p>
                ) : (
                    <p className="text-sm font-bold uppercase text-primary/80 bg-base-300/50 inline-block px-4 py-1.5 rounded-full">{badge}</p>
                )}
                
                <h1 className="text-3xl font-bold text-primary drop-shadow-[0_1px_3px_hsl(var(--color-primary)/0.4)] mt-4">{name}</h1>
                <p className="text-sm text-muted-content mt-1">{subtitle}</p>
            </div>
            
            <div className="my-6 h-px w-full bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"></div>

            {/* Premium Features for Super Admin */}
            {isSuperAdmin && (
                <div className="w-full bg-gradient-to-b from-base-100/50 to-base-100/30 border border-primary/10 rounded-lg p-4">
                    <h3 className="text-center text-sm font-semibold text-primary mb-3">Premium Features</h3>
                    <div className="flex justify-around items-center">
                        <FeatureIcon 
                            label="Full Access" 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>} 
                        />
                         <FeatureIcon 
                            label="Sys Control" 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>}
                        />
                         <FeatureIcon 
                            label="Analytics" 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>}
                        />
                    </div>
                </div>
            )}
            <style>{`
                @keyframes theme-glow {
                    0%, 100% {
                        box-shadow: 0 0 15px -5px hsl(var(--color-primary) / 0.6);
                    }
                    50% {
                        box-shadow: 0 0 25px 0px hsl(var(--color-primary) / 0.8);
                    }
                }
                .animate-theme-glow {
                    animation: theme-glow 3s ease-in-out infinite;
                    pointer-events: none; /* Make sure it doesn't block interactions */
                }
            `}</style>
        </div>
    );
};

export default ProfileCard;
