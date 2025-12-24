import React, { useState, useEffect } from 'react';
import { visitorService } from '@/services/visitor.service';
import { cargoService } from '@/services/cargo.service';
import { locationService } from '@/services/location.service';
import { useAuth } from '@/contexts/AuthContext';
import { FileDown, Calendar } from 'lucide-react';

const Reports = () => {
    const { hasRole } = useAuth();
    const [period, setPeriod] = useState('daily');
    const [locations, setLocations] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
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
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchData();
    }, [period, locationFilter]);

    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

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

            const params = locationFilter ? { location_id: locationFilter } : {};
            const allVisitors = await visitorService.getAll(params);
            const allCargo = await cargoService.getAll(params);

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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Generate and export logbook reports</p>
                </div>
                <button className="cta-button" onClick={exportToCSV}>
                    <FileDown className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            <div className="time-filter-buttons">
                <button 
                    className={`time-filter-btn ${period === 'daily' ? 'active' : ''}`}
                    onClick={() => setPeriod('daily')}
                >
                    <Calendar className="h-4 w-4" />
                    Daily
                </button>
                <button 
                    className={`time-filter-btn ${period === 'weekly' ? 'active' : ''}`}
                    onClick={() => setPeriod('weekly')}
                >
                    <Calendar className="h-4 w-4" />
                    Weekly
                </button>
                <button 
                    className={`time-filter-btn ${period === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPeriod('monthly')}
                >
                    <Calendar className="h-4 w-4" />
                    Monthly
                </button>
                {hasRole('admin') && (
                    <select
                        className="form-select w-48"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="">All Locations</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="reports-grid">
                <div className="data-card">
                    <div className="data-card-title">Total Visitors</div>
                    <div className="data-card-number">{stats.totalVisitors}</div>
                    <div className="data-card-label">
                        {period === 'daily' ? 'Today' : period === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
                    </div>
                </div>

                <div className="data-card">
                    <div className="data-card-title">Active Visitors</div>
                    <div className="data-card-number highlight">{stats.activeVisitors}</div>
                    <div className="data-card-label">Currently signed in</div>
                </div>

                <div className="data-card">
                    <div className="data-card-title">Signed Out</div>
                    <div className="data-card-number">{stats.signedOutVisitors}</div>
                    <div className="data-card-label">Completed visits</div>
                </div>

                <div className="data-card">
                    <div className="data-card-title">Total Cargo</div>
                    <div className="data-card-number">{stats.totalCargo}</div>
                    <div className="data-card-label">
                        {period === 'daily' ? 'Today' : period === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
                    </div>
                </div>

                <div className="data-card">
                    <div className="data-card-title">Known Cargo</div>
                    <div className="data-card-number">{stats.knownCargo}</div>
                    <div className="data-card-label">Identified shipments</div>
                </div>

                <div className="data-card">
                    <div className="data-card-title">Unknown Cargo</div>
                    <div className="data-card-number">{stats.unknownCargo}</div>
                    <div className="data-card-label">Unidentified shipments</div>
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-title">Visitor Summary</div>
                    <div className="summary-list">
                        <div className="summary-item">
                            <span className="summary-item-label">Total Entries</span>
                            <span className="summary-item-value">{stats.totalVisitors}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Active</span>
                            <span className="summary-item-value highlight">{stats.activeVisitors}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Signed Out</span>
                            <span className="summary-item-value">{stats.signedOutVisitors}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Completion Rate</span>
                            <span className="summary-item-value">
                                {stats.totalVisitors > 0 
                                    ? Math.round((stats.signedOutVisitors / stats.totalVisitors) * 100) 
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-title">Cargo Summary</div>
                    <div className="summary-list">
                        <div className="summary-item">
                            <span className="summary-item-label">Total Entries</span>
                            <span className="summary-item-value">{stats.totalCargo}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Known</span>
                            <span className="summary-item-value">{stats.knownCargo}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Unknown</span>
                            <span className="summary-item-value">{stats.unknownCargo}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-item-label">Known Rate</span>
                            <span className="summary-item-value">
                                {stats.totalCargo > 0 
                                    ? Math.round((stats.knownCargo / stats.totalCargo) * 100) 
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
