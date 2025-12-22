import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick, sidebarOpen }) => {
    const { user, logout } = useAuth();

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    return (
        <nav className="header">
            {/* Sidebar toggle button */}
            <button className="sidebar-toggle-btn" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </button>

            <div className="user-info">
                <div className="text-right hidden sm:block">
                    <p className="text-xs uppercase tracking-wide mb-0.5 opacity-70">
                        {user?.role?.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-semibold">{user?.full_name}</p>
                </div>

                <div className="user-avatar">
                    {getInitials(user?.full_name)}
                </div>

                <button className="logout-btn" onClick={logout}>
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
