import React, { useState, useEffect } from 'react';
import { visitorService } from '@/services/visitor.service';
import { cargoService } from '@/services/cargo.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome, {user?.full_name}!</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Here's what's happening today</p>
            </div>

            {/* Stats Grid - responsive: 1 col on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {hasAnyRole(['dashboard_visitor', 'data_entry', 'admin']) && (
                    <>
                        <Card>
                            <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
                                    <Users className="h-5 w-5 md:h-6 md:w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold">{stats.activeVisitors}</p>
                                    <p className="text-xs md:text-sm text-black">Active Visitors</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 shrink-0">
                                    <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl font-bold">{stats.totalVisitorsToday}</p>
                                    <p className="text-xs md:text-sm text-black">Visitors Today</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {hasAnyRole(['dashboard_cargo', 'data_entry', 'admin']) && (
                    <Card>
                        <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shrink-0">
                                <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold">{stats.totalCargo}</p>
                                <p className="text-xs md:text-sm text-black">Total Cargo</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent Visitors Table - scrollable on mobile */}
            {hasAnyRole(['dashboard_visitor', 'data_entry', 'admin']) && stats.recentVisitors.length > 0 && (
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Visitors</h2>
                        <div className="overflow-x-auto -mx-4 md:mx-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Name</TableHead>
                                        <TableHead className="whitespace-nowrap hidden sm:table-cell">ID Number</TableHead>
                                        <TableHead className="whitespace-nowrap hidden md:table-cell">Purpose</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Sign In</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recentVisitors.map(visitor => (
                                        <TableRow key={visitor.id}>
                                            <TableCell className="font-medium">{visitor.name}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{visitor.id_number}</TableCell>
                                            <TableCell className="hidden md:table-cell">{visitor.purpose}</TableCell>
                                            <TableCell>
                                                <Badge variant={visitor.status === 'signed_in' ? 'success' : 'secondary'} className="text-xs">
                                                    {visitor.status?.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-xs">
                                                {new Date(visitor.sign_in_time).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Dashboard;
