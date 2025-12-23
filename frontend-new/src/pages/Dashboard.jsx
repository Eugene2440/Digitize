import React, { useState, useEffect } from 'react';
import { visitorService } from '@/services/visitor.service';
import { formatTimestamp } from '@/utils/dateFormatter';
import { cargoService } from '@/services/cargo.service';
import { locationService } from '@/services/location.service';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BarChart3, Package } from 'lucide-react';

const Dashboard = () => {
    const { user, hasAnyRole } = useAuth();
    const [locationStats, setLocationStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const locations = await locationService.getAll();
            
            const statsPromises = locations.map(async (location) => {
                let activeVisitors = 0;
                let visitorsToday = 0;
                let totalCargo = 0;

                if (hasAnyRole(['dashboard_visitor', 'data_entry', 'admin'])) {
                    const visitors = await visitorService.getAll({ location_id: location.id });
                    activeVisitors = visitors.filter(v => v.status === 'signed_in').length;
                    visitorsToday = visitors.filter(v => 
                        v.sign_in_time && v.sign_in_time.startsWith(today)
                    ).length;
                }

                if (hasAnyRole(['dashboard_cargo', 'data_entry', 'admin'])) {
                    const cargo = await cargoService.getAll({ location_id: location.id });
                    totalCargo = cargo.length;
                }

                return {
                    location,
                    activeVisitors,
                    visitorsToday,
                    totalCargo
                };
            });

            const stats = await Promise.all(statsPromises);
            setLocationStats(stats);
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

            {/* Location Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {locationStats.map(({ location, activeVisitors, visitorsToday, totalCargo }) => (
                    <div key={location.id} className="metric-card">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                            <p className="text-sm text-gray-500">{location.code}</p>
                        </div>
                        
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            {hasAnyRole(['dashboard_visitor', 'data_entry', 'admin']) && (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active Visitors</span>
                                        <span className="text-lg font-semibold text-primary">{activeVisitors}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Visitors Today</span>
                                        <span className="text-lg font-semibold text-gray-900">{visitorsToday}</span>
                                    </div>
                                </>
                            )}
                            {hasAnyRole(['dashboard_cargo', 'data_entry', 'admin']) && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Cargo</span>
                                    <span className="text-lg font-semibold text-gray-900">{totalCargo}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
