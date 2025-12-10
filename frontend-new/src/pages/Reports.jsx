import React, { useState, useEffect } from 'react';
import { visitorService } from '@/services/visitor.service';
import { cargoService } from '@/services/cargo.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Calendar } from 'lucide-react';

const Reports = () => {
    const [period, setPeriod] = useState('daily');
    const [visitors, setVisitors] = useState([]);
    const [cargo, setCargo] = useState([]);
    const [stats, setStats] = useState({
        totalVisitors: 0,
        activeVisitors: 0,
        signedOutVisitors: 0,
        totalCargo: 0,
        knownCargo: 0,
        unknownCargo: 0
    });

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            const now = new Date();
            let startDate;

            if (period === 'daily') {
                startDate = new Date(now.setHours(0, 0, 0, 0));
            } else if (period === 'weekly') {
                startDate = new Date(now.setDate(now.getDate() - 7));
            } else {
                startDate = new Date(now.setMonth(now.getMonth() - 1));
            }

            const allVisitors = await visitorService.getAll();
            const allCargo = await cargoService.getAll();

            const filteredVisitors = allVisitors.filter(v => 
                new Date(v.sign_in_time) >= startDate
            );
            const filteredCargo = allCargo.filter(c => 
                new Date(c.time_in || c.created_at) >= startDate
            );

            setVisitors(filteredVisitors);
            setCargo(filteredCargo);

            setStats({
                totalVisitors: filteredVisitors.length,
                activeVisitors: filteredVisitors.filter(v => v.status === 'signed_in').length,
                signedOutVisitors: filteredVisitors.filter(v => v.status === 'signed_out').length,
                totalCargo: filteredCargo.length,
                knownCargo: filteredCargo.filter(c => c.category === 'known').length,
                unknownCargo: filteredCargo.filter(c => c.category === 'unknown').length
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
    };

    const exportToCSV = () => {
        const visitorCSV = [
            ['VISITOR REPORT', '', '', '', '', ''],
            ['Period:', period.toUpperCase(), '', '', '', ''],
            ['Generated:', new Date().toLocaleString(), '', '', '', ''],
            ['', '', '', '', '', ''],
            ['Name', 'ID Number', 'Badge', 'Area', 'Purpose', 'Sign In Time', 'Sign Out Time', 'Status'],
            ...visitors.map(v => [
                v.name,
                v.id_number,
                v.badge_number || '-',
                v.area_of_visit,
                v.purpose,
                new Date(v.sign_in_time).toLocaleString(),
                v.sign_out_time ? new Date(v.sign_out_time).toLocaleString() : '-',
                v.status
            ]),
            ['', '', '', '', '', ''],
            ['CARGO REPORT', '', '', '', '', ''],
            ['Category', 'AWB Number', 'ULD Numbers', 'Description', 'Company', 'Driver', 'Vehicle', 'Time In'],
            ...cargo.map(c => [
                c.category,
                c.awb_number,
                c.uld_numbers,
                c.description,
                c.company,
                c.driver_name,
                c.vehicle_registration,
                new Date(c.time_in || c.created_at).toLocaleString()
            ])
        ];

        const csvContent = visitorCSV.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logbook_report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Generate and export logbook reports</p>
                </div>
                <Button onClick={exportToCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant={period === 'daily' ? 'default' : 'outline'} 
                            onClick={() => setPeriod('daily')}
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            Daily
                        </Button>
                        <Button 
                            size="sm" 
                            variant={period === 'weekly' ? 'default' : 'outline'} 
                            onClick={() => setPeriod('weekly')}
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            Weekly
                        </Button>
                        <Button 
                            size="sm" 
                            variant={period === 'monthly' ? 'default' : 'outline'} 
                            onClick={() => setPeriod('monthly')}
                        >
                            <Calendar className="h-4 w-4 mr-1" />
                            Monthly
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalVisitors}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {period === 'daily' ? 'Today' : period === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.activeVisitors}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently signed in</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Signed Out</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-600">{stats.signedOutVisitors}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed visits</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalCargo}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {period === 'daily' ? 'Today' : period === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Known Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{stats.knownCargo}</div>
                        <p className="text-xs text-muted-foreground mt-1">Identified shipments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Unknown Cargo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{stats.unknownCargo}</div>
                        <p className="text-xs text-muted-foreground mt-1">Unidentified shipments</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Visitor Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">Total Entries</span>
                                <span className="font-semibold">{stats.totalVisitors}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="text-sm">Active</span>
                                <span className="font-semibold text-green-600">{stats.activeVisitors}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">Signed Out</span>
                                <span className="font-semibold">{stats.signedOutVisitors}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm">Completion Rate</span>
                                <span className="font-semibold text-blue-600">
                                    {stats.totalVisitors > 0 
                                        ? Math.round((stats.signedOutVisitors / stats.totalVisitors) * 100) 
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cargo Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm">Total Entries</span>
                                <span className="font-semibold">{stats.totalCargo}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm">Known</span>
                                <span className="font-semibold text-blue-600">{stats.knownCargo}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                <span className="text-sm">Unknown</span>
                                <span className="font-semibold text-orange-600">{stats.unknownCargo}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="text-sm">Known Rate</span>
                                <span className="font-semibold text-green-600">
                                    {stats.totalCargo > 0 
                                        ? Math.round((stats.knownCargo / stats.totalCargo) * 100) 
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
