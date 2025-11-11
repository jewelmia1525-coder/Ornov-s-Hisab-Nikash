import React, { useMemo, useState, useEffect } from 'react';
import { Role, Page, Message, AdminUser } from '../types';
import { ROLE_DETAILS } from '../constants';
import ProfileCard from './ProfileCard';
import LiveClock from './LiveClock';

interface HeaderProps {
    role: Role | null;
    onLogout: () => void;
    activePage: Page;
    setActivePage: (page: Page) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onOpenCustomizeModal: () => void;
    messages: Message[];
    currentUserIdentifier: string;
    onOpenMessageCenter: () => void;
    loggedInAdminUser: AdminUser | null;
}

const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const BellIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ role, onLogout, activePage, setActivePage, theme, setTheme, onOpenCustomizeModal, messages, currentUserIdentifier, onOpenMessageCenter, loggedInAdminUser }) => {
    
    const roleDetails = role ? ROLE_DETAILS[role] : ROLE_DETAILS['viewer'];
    const [animateBell, setAnimateBell] = useState(false);

    const displayName = role === 'admin' && loggedInAdminUser ? loggedInAdminUser.username : roleDetails.name;
    const displayPhoto = (role === 'admin' && loggedInAdminUser?.photo) ? loggedInAdminUser.photo : roleDetails.photo;
    const displayBadge = role === 'admin' ? `${loggedInAdminUser?.username}'s Panel` : roleDetails.badge;


    const unreadCount = useMemo(() => {
        if (!currentUserIdentifier) return 0;
        return messages.filter(m => m.recipient === currentUserIdentifier && !m.isRead).length;
    }, [messages, currentUserIdentifier]);

    useEffect(() => {
        if (unreadCount > 0) {
            setAnimateBell(true);
            const timer = setTimeout(() => setAnimateBell(false), 1000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [unreadCount]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const showMessageCenter = role === 'admin' || role === 'super-admin';

    return (
        <header>
            <style>{`
                @keyframes bell-shake {
                    0%, 100% { transform: rotate(0); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
                    20%, 40%, 60%, 80% { transform: rotate(10deg); }
                }
                .animate-bell-shake {
                    animation: bell-shake 0.8s ease-in-out;
                }
            `}</style>
            <div className="fixed sm:static top-0 left-0 right-0 z-30 p-3 sm:p-4 bg-base-100 shadow-md sm:bg-base-100/80 sm:backdrop-blur-sm sm:border-b sm:border-primary/10">
                <div className="flex justify-between items-center">
                    {/* Left side: Profile info */}
                    <div className="flex items-center gap-3">
                        <img src={displayPhoto} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary object-cover" />
                        <div>
                            <h1 className="font-bold text-base-content leading-tight">{displayName}</h1>
                            <p className="text-xs font-semibold uppercase text-primary">{displayBadge}</p>
                        </div>
                    </div>
                    
                    {/* Right side: Controls */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2 sm:p-1 sm:bg-base-200/50 sm:border sm:border-primary/20 sm:rounded-lg">
                            <button 
                                onClick={() => setActivePage('dashboard')}
                                className={`p-2 sm:px-3 sm:py-1.5 text-sm rounded-md transition-colors flex items-center justify-center ${activePage === 'dashboard' ? 'bg-primary text-primary-content' : 'text-muted-content hover:bg-base-300/50'}`}>
                                <span>📊</span><span className="hidden sm:inline ml-2">Dashboard</span>
                            </button>
                            <button 
                                onClick={() => setActivePage('persons')}
                                className={`p-2 sm:px-3 sm:py-1.5 text-sm rounded-md transition-colors flex items-center justify-center ${activePage === 'persons' ? 'bg-primary text-primary-content' : 'text-muted-content hover:bg-base-300/50'}`}>
                                <span>👥</span><span className="hidden sm:inline ml-2">Persons</span>
                            </button>
                             <button 
                                onClick={() => setActivePage('tools')}
                                className={`p-2 sm:px-3 sm:py-1.5 text-sm rounded-md transition-colors flex items-center justify-center ${activePage === 'tools' ? 'bg-primary text-primary-content' : 'text-muted-content hover:bg-base-300/50'}`}>
                                <span>🛠️</span><span className="hidden sm:inline ml-2">Tools</span>
                            </button>
                        </nav>
                        <LiveClock />
                        <div className="flex items-center gap-2">
                            {showMessageCenter && (
                                <button onClick={onOpenMessageCenter} className="relative p-2 text-muted-content hover:text-primary transition-colors">
                                    <div className={animateBell ? 'animate-bell-shake' : ''}><BellIcon /></div>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-danger text-white text-xs flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            {activePage === 'dashboard' && (
                                <button 
                                    onClick={onOpenCustomizeModal} 
                                    className="p-2 text-sm rounded-md text-muted-content hover:bg-base-300/50 sm:bg-base-200/50 sm:border sm:border-primary/20 sm:px-3 sm:py-2 sm:rounded-lg"
                                    aria-label="Customize dashboard layout"
                                    title="Customize Layout"
                                >
                                    ⚙️
                                </button>
                            )}
                            <button 
                                onClick={handleThemeToggle} 
                                className="w-14 h-8 px-1 flex items-center bg-base-300/50 rounded-full cursor-pointer relative transition-colors duration-300 sm:border sm:border-primary/20"
                                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-primary shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                <span className={`absolute left-1.5 text-sm transition-opacity duration-200 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>☀️</span>
                                <span className={`absolute right-1.5 text-sm transition-opacity duration-200 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
                            </button>
                            <button onClick={onLogout} className="p-2 text-sm rounded-md text-danger hover:bg-danger/20 transition-colors sm:bg-base-200/50 sm:border sm:border-primary/20 sm:px-3 sm:py-2 sm:rounded-lg flex items-center gap-2">
                                <LogoutIcon />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;