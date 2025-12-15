import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fitnessService } from '@/services/fitness.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dumbbell, Trash2, ArrowUpDown, Settings, FileDown } from 'lucide-react';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Label } from '@/components/ui/label';

const FitnessList = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const { showToast } = useToast();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortField, setSortField] = useState('check_in');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        company: true,
        session: true,
        date: true,
        check_in: true
    });

    useEffect(() => {
        fetchAttendance();
    }, [filter]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { session: filter } : {};
            const data = await fitnessService.getAllAttendance(params);
            setAttendance(data || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredAttendance.map(a => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedIds.map(id => fitnessService.deleteAttendance(id)));
            showToast('Attendance records deleted successfully!', 'success');
            setBulkDeleteModal(false);
            setSelectedIds([]);
            fetchAttendance();
        } catch (error) {
            setErrorModal({ open: true, message: 'Failed to delete attendance records' });
            setBulkDeleteModal(false);
        }
    };

    const handleDelete = async () => {
        try {
            await fitnessService.deleteAttendance(deleteModal.id);
            showToast('Attendance deleted successfully!', 'success');
            setDeleteModal({ open: false, id: null });
            fetchAttendance();
        } catch (error) {
            setErrorModal({ open: true, message: 'Failed to delete attendance' });
            setDeleteModal({ open: false, id: null });
        }
    };

    const handleCheckOut = async (id) => {
        try {
            await fitnessService.checkOut({ attendance_id: id });
            showToast('Checked out successfully!', 'success');
            fetchAttendance();
        } catch (error) {
            setErrorModal({ open: true, message: error.response?.data?.error || 'Failed to check out' });
        }
    };

    const generateExcelReport = async () => {
        try {
            // Fetch all attendance for the selected month
            const allAttendance = await fitnessService.getAllAttendance();
            const allMembers = await fitnessService.getAllMembers();

            // Filter by selected month/year
            const monthAttendance = allAttendance.filter(a => {
                const date = new Date(a.date);
                return date.getMonth() + 1 === reportMonth && date.getFullYear() === reportYear;
            });

            // Get days in month
            const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();

            // Build attendance map: memberID -> session -> day -> 1/0
            const attendanceMap = {};
            monthAttendance.forEach(a => {
                const day = new Date(a.date).getDate();
                const key = `${a.member_id}_${a.session}`;
                if (!attendanceMap[key]) {
                    attendanceMap[key] = {
                        member: a.member,
                        session: a.session,
                        days: Array(daysInMonth).fill(0)
                    };
                }
                attendanceMap[key].days[day - 1] = 1;
            });

            // Build CSV content
            const monthName = new Date(reportYear, reportMonth - 1).toLocaleString('default', { month: 'long' });
            let csv = `GYM ATTENDANCE REPORT\n`;
            csv += `Month: ${monthName} ${reportYear}\n`;
            csv += `Generated: ${new Date().toLocaleString()}\n\n`;

            // Group by session
            const sessions = ['morning', 'afternoon', 'evening'];
            
            sessions.forEach(session => {
                csv += `\n${session.toUpperCase()} SESSION\n`;
                csv += 'Name,ID Number,Phone Number,Company,';
                for (let i = 1; i <= daysInMonth; i++) {
                    csv += `Day ${i},`;
                }
                csv += 'Total\n';

                Object.values(attendanceMap)
                    .filter(record => record.session === session)
                    .forEach(record => {
                        const member = record.member || {};
                        csv += `${member.name || 'N/A'},`;
                        csv += `${member.id_number || 'N/A'},`;
                        csv += `${member.phone_number || 'N/A'},`;
                        csv += `${member.company || 'N/A'},`;
                        
                        let total = 0;
                        record.days.forEach(day => {
                            csv += `${day},`;
                            total += day;
                        });
                        csv += `${total}\n`;
                    });

                allMembers.forEach(member => {
                    const key = `${member.id}_${session}`;
                    if (!attendanceMap[key]) {
                        csv += `${member.name},`;
                        csv += `${member.id_number},`;
                        csv += `${member.phone_number},`;
                        csv += `${member.company},`;
                        for (let i = 0; i < daysInMonth; i++) {
                            csv += '0,';
                        }
                        csv += '0\n';
                    }
                });
            });

            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Gym_Attendance_${monthName}_${reportYear}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('Report generated successfully!', 'success');
            setShowReportModal(false);
        } catch (error) {
            setErrorModal({ open: true, message: 'Failed to generate report' });
        }
    };

    const filteredAttendance = attendance
        .filter(a =>
            (a.member?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.member?.company || '').toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (sortField === 'check_in' || sortField === 'date') {
                aVal = new Date(aVal || 0);
                bVal = new Date(bVal || 0);
            }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fitness Attendance</h1>
                    <p className="page-subtitle">Track gym attendance</p>
                </div>
                <div className="flex gap-2">
                    <button className="secondary-btn" onClick={() => setShowReportModal(true)}>
                        <FileDown className="h-4 w-4" />
                        Generate Report
                    </button>
                    {hasRole('admin') && (
                        <div className="relative">
                            <button className="action-btn" onClick={() => setShowColumnMenu(!showColumnMenu)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Columns
                            </button>
                            {showColumnMenu && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50" style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="p-2 space-y-1">
                                        {Object.keys(visibleColumns).map(col => (
                                            <label key={col} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col]}
                                                    onChange={(e) => setVisibleColumns({...visibleColumns, [col]: e.target.checked})}
                                                />
                                                <span className="text-sm capitalize">{col.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button className="cta-button" onClick={() => navigate('/fitness/new')}>
                        <Dumbbell className="h-4 w-4" />
                        Check In
                    </button>
                </div>
            </div>

            <div className="filters-container">
                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search by name or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'morning' ? 'active' : ''}`} onClick={() => setFilter('morning')}>Morning</button>
                        <button className={`filter-btn ${filter === 'afternoon' ? 'active' : ''}`} onClick={() => setFilter('afternoon')}>Afternoon</button>
                        <button className={`filter-btn ${filter === 'evening' ? 'active' : ''}`} onClick={() => setFilter('evening')}>Evening</button>
                    </div>
                </div>
                {selectedIds.length > 0 && hasRole('admin') && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded mt-3">
                        <span className="text-sm">{selectedIds.length} selected</span>
                        <button className="action-btn delete" onClick={() => setBulkDeleteModal(true)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            <div className="attendance-list-table">
                <table className="table">
                    <thead>
                        <tr>
                            {hasRole('admin') && (
                                <th className="table-header" style={{width: '48px'}}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredAttendance.length && filteredAttendance.length > 0} />
                                </th>
                            )}
                            {visibleColumns.name && (
                                <th className="table-header sortable" onClick={() => handleSort('member.name')}>
                                    <div className="flex items-center gap-1">
                                        Name <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </th>
                            )}
                            {visibleColumns.company && <th className="table-header">Company</th>}
                            {visibleColumns.session && (
                                <th className="table-header sortable" onClick={() => handleSort('session')}>
                                    <div className="flex items-center gap-1">
                                        Session <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </th>
                            )}
                            {visibleColumns.date && <th className="table-header">Date</th>}
                            {visibleColumns.check_in && (
                                <th className="table-header sortable" onClick={() => handleSort('check_in')}>
                                    <div className="flex items-center gap-1">
                                        Check In <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </th>
                            )}
                            <th className="table-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAttendance.length === 0 ? (
                            <tr>
                                <td colSpan={hasRole('admin') ? 7 : 6} className="table-cell text-center py-8" style={{color: '#6b7280'}}>
                                    No attendance records found
                                </td>
                            </tr>
                        ) : (
                            filteredAttendance.map((record) => (
                                <tr key={record.id} className="table-row">
                                    {hasRole('admin') && (
                                        <td className="table-cell">
                                            <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => handleSelectOne(record.id)} />
                                        </td>
                                    )}
                                    {visibleColumns.name && <td className="table-cell font-medium">{record.member?.name || 'N/A'}</td>}
                                    {visibleColumns.company && <td className="table-cell">{record.member?.company || 'N/A'}</td>}
                                    {visibleColumns.session && (
                                        <td className="table-cell">
                                            <span className={`session-badge-${record.session}`}>
                                                {record.session}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.date && <td className="table-cell">{new Date(record.date).toLocaleDateString()}</td>}
                                    {visibleColumns.check_in && <td className="table-cell text-xs">{new Date(record.check_in).toLocaleString()}</td>}
                                    <td className="table-cell">
                                        <div className="actions-group">
                                            {!record.check_out && (
                                                <button className="action-btn" onClick={() => handleCheckOut(record.id)}>
                                                    Check Out
                                                </button>
                                            )}
                                            {record.check_out && (
                                                <span className="text-xs" style={{color: '#6b7280'}}>{new Date(record.check_out).toLocaleString()}</span>
                                            )}
                                            {hasRole('admin') && (
                                                <button className="action-btn delete" onClick={() => setDeleteModal({ open: true, id: record.id })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Attendance"
                message="Are you sure you want to delete this attendance record? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />

            <ConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Records"
                message={`Are you sure you want to delete ${selectedIds.length} attendance record(s)? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
            />

            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                title="Generate Attendance Report"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
                        <Button onClick={generateExcelReport}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Generate
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="month">Month</Label>
                        <select
                            id="month"
                            className="w-full border rounded-md p-2"
                            style={{
                                background: 'rgba(255, 255, 255, 0.10)',
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)'
                            }}
                            value={reportMonth}
                            onChange={(e) => setReportMonth(parseInt(e.target.value))}
                        >
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
                            type="number"
                            min="2020"
                            max="2100"
                            value={reportYear}
                            onChange={(e) => setReportYear(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Error"
                footer={
                    <Button onClick={() => setErrorModal({ open: false, message: '' })}>OK</Button>
                }
            >
                <p className="text-gray-600">{errorModal.message}</p>
            </Modal>
        </div>
    );
};

export default FitnessList;
