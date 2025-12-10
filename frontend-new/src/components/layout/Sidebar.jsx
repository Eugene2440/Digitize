import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, UserPlus, Package, ClipboardList, Truck, Users, FileText, Dumbbell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Sidebar = ({ isOpen, onClose }) => {
    const { hasRole, hasAnyRole } = useAuth();

    const navLinkClass = ({ isActive }) =>
        cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        );

    const handleLinkClick = () => {
        // Close sidebar on mobile after clicking a link
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
            <aside className={cn(
                "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border p-4 transition-transform duration-300",
                "md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile close button */}
                <div className="flex justify-end md:hidden mb-4">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="space-y-1">
                    <NavLink to="/" className={navLinkClass} end onClick={handleLinkClick}>
                        <Home className="h-5 w-5" />
                        Dashboard
                    </NavLink>

                    {hasAnyRole(['data_entry', 'admin']) && (
                        <>
                            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Entry
                            </div>
                            <NavLink to="/visitors/new" className={navLinkClass} onClick={handleLinkClick}>
                                <UserPlus className="h-5 w-5" />
                                New Visitor
                            </NavLink>
                            <NavLink to="/cargo/new" className={navLinkClass} onClick={handleLinkClick}>
                                <Package className="h-5 w-5" />
                                New Cargo
                            </NavLink>
                        </>
                    )}

                    {hasAnyRole(['dashboard_visitor', 'admin']) && (
                        <>
                            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Visitors
                            </div>
                            <NavLink to="/visitors" className={navLinkClass} onClick={handleLinkClick}>
                                <ClipboardList className="h-5 w-5" />
                                Visitor List
                            </NavLink>
                        </>
                    )}

                    {hasAnyRole(['dashboard_cargo', 'admin']) && (
                        <>
                            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Cargo
                            </div>
                            <NavLink to="/cargo" className={navLinkClass} onClick={handleLinkClick}>
                                <Truck className="h-5 w-5" />
                                Cargo List
                            </NavLink>
                        </>
                    )}

                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Fitness
                    </div>
                    <NavLink to="/fitness/members" className={navLinkClass} onClick={handleLinkClick}>
                        <Users className="h-5 w-5" />
                        Gym Members
                    </NavLink>
                    <NavLink to="/fitness" className={navLinkClass} onClick={handleLinkClick}>
                        <Dumbbell className="h-5 w-5" />
                        Attendance
                    </NavLink>

                    <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Reports
                    </div>
                    <NavLink to="/reports" className={navLinkClass} onClick={handleLinkClick}>
                        <FileText className="h-5 w-5" />
                        Analytics
                    </NavLink>

                    {hasRole('admin') && (
                        <>
                            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin
                            </div>
                            <NavLink to="/users" className={navLinkClass} onClick={handleLinkClick}>
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
