import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MitchellCottsLogo from '@/components/MitchellCottsLogo';
import { LogOut, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-40 shadow-sm" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Link to="/" className="flex items-center gap-3">
                        <MitchellCottsLogo size={32} className="md:w-9 md:h-9" />
                        <span className="text-xl md:text-2xl font-bold text-black hidden sm:inline">Digital Logbook</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{user?.role?.replace('_', ' ')}</p>
                        <p className="text-sm font-semibold text-black">{user?.full_name}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                    <Button variant="ghost" size="sm" onClick={logout} className="gap-2 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline font-medium">Logout</span>
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
