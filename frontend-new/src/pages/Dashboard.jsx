import React, { useState, useEffect } from 'react';
import { visitorService } from '@/services/visitor.service';
import { cargoService } from '@/services/cargo.service';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BarChart3, Package } from 'lucide-react';

const Dashboard = () => {
    const { user, hasAnyRole } = useAuth();
    const [stats, setStats] = useState({
        activeVisitors: 0,
        totalVisitorsToday: 0,
        totalCargo: 0,
        recentVisitors: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            if (hasAnyRole(['dashboard_visitor', 'data_entry', 'admin'])) {
                const visitors = await visitorService.getAll();
                const activeVisitors = visitors.filter(v => v.status === 'signed_in').length;
                const todayVisitors = visitors.filter(v =>
                    v.sign_in_time && v.sign_in_time.startsWith(today)
                );

                setStats(prev => ({
                    ...prev,
                    activeVisitors,
                    totalVisitorsToday: todayVisitors.length,
                    recentVisitors: visitors.slice(0, 5)
                }));
            }

            if (hasAnyRole(['dashboard_cargo', 'data_entry', 'admin'])) {
                const cargo = await cargoService.getAll();
                setStats(prev => ({
                    ...prev,
                    totalCargo: cargo.length
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="dashboard-welcome text-2xl md:text-3xl">Welcome, {user?.full_name}!</h1>
                <p className="dashboard-subtitle">Here's what's happening today</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {hasAnyRole(['dashboard_visitor', 'data_entry', 'admin']) && (
                    <>
                        <div className="metric-card">
                            <div className="metric-icon">
                                <Users />
                            </div>
                            <div>
                                <div className="metric-number">{stats.activeVisitors}</div>
                                <div className="metric-label">Active Visitors</div>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <BarChart3 />
                            </div>
                            <div>
                                <div className="metric-number">{stats.totalVisitorsToday}</div>
                                <div className="metric-label">Visitors Today</div>
                            </div>
                        </div>
                    </>
                )}

                {hasAnyRole(['dashboard_cargo', 'data_entry', 'admin']) && (
                    <div className="metric-card">
                        <div className="metric-icon">
                            <Package />
                        </div>
                        <div>
                            <div className="metric-number">{stats.totalCargo}</div>
                            <div className="metric-label">Total Cargo</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Visitors Table */}
            {hasAnyRole(['dashboard_visitor', 'data_entry', 'admin']) && stats.recentVisitors.length > 0 && (
                <div className="visitors-table">
                    <h2 className="dashboard-section-title text-lg md:text-xl">Recent Visitors</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header text-left">Name</th>
                                    <th className="table-header text-left hidden sm:table-cell">ID Number</th>
                                    <th className="table-header text-left hidden md:table-cell">Purpose</th>
                                    <th className="table-header text-left">Status</th>
                                    <th className="table-header text-left hidden lg:table-cell">Sign In</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentVisitors.map(visitor => (
                                    <tr key={visitor.id}>
                                        <td className="table-cell font-medium">{visitor.name}</td>
                                        <td className="table-cell hidden sm:table-cell">{visitor.id_number}</td>
                                        <td className="table-cell hidden md:table-cell">{visitor.purpose}</td>
                                        <td className="table-cell">
                                            <span className={`status-badge ${visitor.status !== 'signed_in' ? 'inactive' : ''}`}>
                                                {visitor.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="table-cell hidden lg:table-cell text-sm">
                                            {new Date(visitor.sign_in_time).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
