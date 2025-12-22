import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, UserPlus, Package, ClipboardList, Truck, Users, FileText, Dumbbell } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { hasRole, hasAnyRole } = useAuth();

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            onClose?.();
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-title">
                    <img src="/logo.png" alt="Logo" className="sidebar-logo" />
                    Digital Logbook
                </div>
                <nav>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={handleLinkClick}>
                        <Home className="h-5 w-5" />
                        Dashboard
                    </NavLink>

                    {hasAnyRole(['data_entry', 'admin']) && (
                        <>
                            <div className="nav-section">
                                Entry
                            </div>
                            <NavLink to="/visitors/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
                                <UserPlus className="h-5 w-5" />
                                New Visitor
                            </NavLink>
                            <NavLink to="/cargo/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
                                <Package className="h-5 w-5" />
                                New Cargo
                            </NavLink>
                        </>
                    )}

                    {hasAnyRole(['dashboard_visitor', 'admin']) && (
                        <>
                            <div className="nav-section">
                                Visitors
                            </div>
                            <NavLink to="/visitors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={handleLinkClick}>
                                <ClipboardList className="h-5 w-5" />
                                Visitor List
                            </NavLink>
                        </>
                    )}

                    {hasAnyRole(['dashboard_cargo', 'admin']) && (
                        <>
                            <div className="nav-section">
                                Cargo
                            </div>
                            <NavLink to="/cargo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={handleLinkClick}>
                                <Truck className="h-5 w-5" />
                                Cargo List
                            </NavLink>
                        </>
                    )}

                    <div className="nav-section">
                        Fitness
                    </div>
                    <NavLink to="/fitness/members" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
                        <Users className="h-5 w-5" />
                        Gym Members
                    </NavLink>
                    <NavLink to="/fitness" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={handleLinkClick}>
                        <Dumbbell className="h-5 w-5" />
                        Attendance
                    </NavLink>

                    <div className="nav-section">
                        Reports
                    </div>
                    <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
                        <FileText className="h-5 w-5" />
                        Analytics
                    </NavLink>

                    {hasRole('admin') && (
                        <>
                            <div className="nav-section">
                                Admin
                            </div>
                            <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleLinkClick}>
                                <Users className="h-5 w-5" />
                                User Management
                            </NavLink>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
