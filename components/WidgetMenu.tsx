import React from 'react';
import { Widget, Role } from '../types';

interface WidgetMenuProps {
    onSelect: (widget: Widget) => void;
    role: Role | null;
}

const WIDGETS: { id: Widget; icon: string; name: string; roles: Role[] }[] = [
    { id: 'adminOverview', icon: '📊', name: 'Admin Overview', roles: ['super-admin'] },
    { id: 'password', icon: '🔧', name: 'Assign Password', roles: ['super-admin'] },
    { id: 'importPasswords', icon: '📥', name: 'Import Passwords', roles: ['super-admin'] },
    { id: 'data', icon: '💾', name: 'Data Management', roles: ['super-admin'] },
    { id: 'adminManagement', icon: '👥', name: 'Admin Management', roles: ['super-admin'] },
    { id: 'broadcast', icon: '📢', name: 'Broadcast', roles: ['super-admin']},
    { id: 'profileSettings', icon: '👤', name: 'Profile Settings', roles: ['admin'] },
    { id: 'calculator', icon: '🧮', name: 'Calculator', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'email', icon: '✉️', name: 'Email CV', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'theme', icon: '🎨', name: 'Theme Manager', roles: ['super-admin', 'admin', 'viewer'] },
    { id: 'about', icon: '👤', name: 'About Me', roles: ['super-admin', 'admin', 'viewer'] },
];

const WidgetMenu: React.FC<WidgetMenuProps> = ({ onSelect, role }) => {
    return (
        <div className="absolute top-12 right-0 w-48 bg-base-200 border border-primary/20 rounded-xl shadow-lg p-2 origin-top-right animate-[slide-down_0.2s_ease-out]">
            <ul className="space-y-1">
                {WIDGETS.map(widget => (
                    (role && widget.roles.includes(role)) && (
                        <li key={widget.id}>
                            <button
                                onClick={() => onSelect(widget.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-muted-content hover:bg-base-300 hover:text-base-content rounded-md transition-colors"
                            >
                                <span className="text-lg">{widget.icon}</span>
                                <span>{widget.name}</span>
                            </button>
                        </li>
                    )
                ))}
            </ul>
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default WidgetMenu;