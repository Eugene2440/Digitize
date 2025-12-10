import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fitnessService } from '@/services/fitness.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Fitness Attendance</h1>
                    <p className="text-muted-foreground">Track gym attendance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowReportModal(true)}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                    {hasRole('admin') && (
                        <div className="relative">
                            <Button variant="outline" onClick={() => setShowColumnMenu(!showColumnMenu)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Columns
                            </Button>
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
                    <Button onClick={() => navigate('/fitness/new')}>
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Check In
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="flex gap-4 items-center">
                            <Input
                                placeholder="Search by name or company..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                                <Button size="sm" variant={filter === 'morning' ? 'default' : 'outline'} onClick={() => setFilter('morning')}>Morning</Button>
                                <Button size="sm" variant={filter === 'afternoon' ? 'default' : 'outline'} onClick={() => setFilter('afternoon')}>Afternoon</Button>
                                <Button size="sm" variant={filter === 'evening' ? 'default' : 'outline'} onClick={() => setFilter('evening')}>Evening</Button>
                            </div>
                        </div>
                        {selectedIds.length > 0 && hasRole('admin') && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                <span className="text-sm">{selectedIds.length} selected</span>
                                <Button size="sm" variant="destructive" onClick={() => setBulkDeleteModal(true)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete Selected
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {hasRole('admin') && (
                                <TableHead className="w-12">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredAttendance.length && filteredAttendance.length > 0} />
                                </TableHead>
                            )}
                            {visibleColumns.name && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('member.name')}>
                                    <div className="flex items-center gap-1">
                                        Name <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.company && <TableHead>Company</TableHead>}
                            {visibleColumns.session && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('session')}>
                                    <div className="flex items-center gap-1">
                                        Session <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.date && <TableHead>Date</TableHead>}
                            {visibleColumns.check_in && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('check_in')}>
                                    <div className="flex items-center gap-1">
                                        Check In <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {hasRole('admin') && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAttendance.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={hasRole('admin') ? 7 : 6} className="text-center py-8 text-muted-foreground">
                                    No attendance records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAttendance.map((record) => (
                                <TableRow key={record.id}>
                                    {hasRole('admin') && (
                                        <TableCell>
                                            <input type="checkbox" checked={selectedIds.includes(record.id)} onChange={() => handleSelectOne(record.id)} />
                                        </TableCell>
                                    )}
                                    {visibleColumns.name && <TableCell className="font-medium">{record.member?.name || 'N/A'}</TableCell>}
                                    {visibleColumns.company && <TableCell>{record.member?.company || 'N/A'}</TableCell>}
                                    {visibleColumns.session && (
                                        <TableCell>
                                            <Badge variant={record.session === 'morning' ? 'default' : record.session === 'afternoon' ? 'secondary' : 'outline'}>
                                                {record.session}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {visibleColumns.date && <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>}
                                    {visibleColumns.check_in && <TableCell className="text-xs">{new Date(record.check_in).toLocaleString()}</TableCell>}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {!record.check_out && (
                                                <Button size="sm" variant="outline" onClick={() => handleCheckOut(record.id)}>
                                                    Check Out
                                                </Button>
                                            )}
                                            {record.check_out && (
                                                <span className="text-xs text-gray-600">{new Date(record.check_out).toLocaleString()}</span>
                                            )}
                                            {hasRole('admin') && (
                                                <Button size="sm" variant="destructive" onClick={() => setDeleteModal({ open: true, id: record.id })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

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
