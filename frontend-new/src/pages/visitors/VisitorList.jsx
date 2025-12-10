import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '@/services/visitor.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InputModal, ConfirmModal } from '@/components/ui/modal';
import { UserPlus, LogIn, LogOut, Trash2, ArrowUpDown, Settings } from 'lucide-react';

const VisitorList = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortField, setSortField] = useState('sign_in_time');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [signInModal, setSignInModal] = useState({ open: false, id: null });
    const [signOutModal, setSignOutModal] = useState({ open: false, id: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    const [badgeNumber, setBadgeNumber] = useState('');
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        id_number: true,
        area: true,
        purpose: true,
        badge: true,
        status: true,
        time_in: true,
        time_out: true
    });

    useEffect(() => {
        fetchVisitors();
    }, [filter]);

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const data = await visitorService.getAll(params);
            setVisitors(data);
        } catch (error) {
            console.error('Error fetching visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        if (!badgeNumber) return;
        try {
            await visitorService.signIn(signInModal.id, badgeNumber);
            setSignInModal({ open: false, id: null });
            setBadgeNumber('');
            fetchVisitors();
        } catch (error) {
            alert('Failed to sign in visitor');
        }
    };

    const handleSignOut = async () => {
        try {
            await visitorService.signOut(signOutModal.id);
            setSignOutModal({ open: false, id: null });
            fetchVisitors();
        } catch (error) {
            alert('Failed to sign out visitor');
        }
    };

    const handleDelete = async () => {
        try {
            await visitorService.delete(deleteModal.id);
            setDeleteModal({ open: false, id: null });
            fetchVisitors();
        } catch (error) {
            alert('Failed to delete visitor');
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
            setSelectedIds(filteredVisitors.map(v => v.id));
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
            await Promise.all(selectedIds.map(id => visitorService.delete(id)));
            setBulkDeleteModal(false);
            setSelectedIds([]);
            fetchVisitors();
        } catch (error) {
            alert('Failed to delete visitors');
        }
    };

    const filteredVisitors = visitors
        .filter(v =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.id_number.includes(search)
        )
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (sortField === 'sign_in_time' || sortField === 'sign_out_time') {
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
                    <h1 className="text-2xl font-bold">Visitor Management</h1>
                    <p className="text-muted-foreground">View and manage visitor entries</p>
                </div>
                <div className="flex gap-2">
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
                    <Button onClick={() => navigate('/visitors/new')}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Visitor
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="space-y-3">
                        <div className="flex gap-4 items-center">
                            <Input
                                placeholder="Search by name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                                <Button size="sm" variant={filter === 'signed_in' ? 'default' : 'outline'} onClick={() => setFilter('signed_in')}>Signed In</Button>
                                <Button size="sm" variant={filter === 'signed_out' ? 'default' : 'outline'} onClick={() => setFilter('signed_out')}>Signed Out</Button>
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
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredVisitors.length && filteredVisitors.length > 0} />
                                </TableHead>
                            )}
                            {visibleColumns.name && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">
                                        Name <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.id_number && <TableHead>ID Number</TableHead>}
                            {visibleColumns.area && <TableHead>Area</TableHead>}
                            {visibleColumns.purpose && <TableHead>Purpose</TableHead>}
                            {visibleColumns.badge && <TableHead>Badge</TableHead>}
                            {visibleColumns.status && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">
                                        Status <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.time_in && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('sign_in_time')}>
                                    <div className="flex items-center gap-1">
                                        Time In <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.time_out && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('sign_out_time')}>
                                    <div className="flex items-center gap-1">
                                        Time Out <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                            )}
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVisitors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={hasRole('admin') ? 10 : 9} className="text-center py-8 text-muted-foreground">
                                    No visitors found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVisitors.map((visitor) => (
                                <TableRow key={visitor.id}>
                                    {hasRole('admin') && (
                                        <TableCell>
                                            <input type="checkbox" checked={selectedIds.includes(visitor.id)} onChange={() => handleSelectOne(visitor.id)} />
                                        </TableCell>
                                    )}
                                    {visibleColumns.name && <TableCell className="font-medium">{visitor.name}</TableCell>}
                                    {visibleColumns.id_number && <TableCell>{visitor.id_number}</TableCell>}
                                    {visibleColumns.area && <TableCell>{visitor.area_of_visit}</TableCell>}
                                    {visibleColumns.purpose && <TableCell>{visitor.purpose}</TableCell>}
                                    {visibleColumns.badge && <TableCell>{visitor.badge_number || '-'}</TableCell>}
                                    {visibleColumns.status && (
                                        <TableCell>
                                            <Badge variant={visitor.status === 'signed_in' ? 'success' : 'secondary'}>
                                                {visitor.status?.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    )}
                                    {visibleColumns.time_in && (
                                        <TableCell className="text-xs">
                                            {visitor.sign_in_time ? new Date(visitor.sign_in_time).toLocaleString() : '-'}
                                        </TableCell>
                                    )}
                                    {visibleColumns.time_out && (
                                        <TableCell className="text-xs">
                                            {visitor.sign_out_time ? new Date(visitor.sign_out_time).toLocaleString() : '-'}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {visitor.status === 'pending' && (
                                                <Button size="sm" variant="outline" onClick={() => setSignInModal({ open: true, id: visitor.id })}>
                                                    <LogIn className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {visitor.status === 'signed_in' && (
                                                <Button size="sm" variant="outline" onClick={() => setSignOutModal({ open: true, id: visitor.id })}>
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {hasRole('admin') && (
                                                <Button size="sm" variant="destructive" onClick={() => setDeleteModal({ open: true, id: visitor.id })}>
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

            <InputModal
                isOpen={signInModal.open}
                onClose={() => { setSignInModal({ open: false, id: null }); setBadgeNumber(''); }}
                onSubmit={handleSignIn}
                title="Sign In Visitor"
                label="Badge Number"
                placeholder="Enter badge number"
                value={badgeNumber}
                onChange={setBadgeNumber}
                submitText="Sign In"
            />

            <ConfirmModal
                isOpen={signOutModal.open}
                onClose={() => setSignOutModal({ open: false, id: null })}
                onConfirm={handleSignOut}
                title="Sign Out Visitor"
                message="Are you sure you want to sign out this visitor?"
                confirmText="Sign Out"
            />

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Visitor"
                message="Are you sure you want to delete this visitor? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />

            <ConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Visitors"
                message={`Are you sure you want to delete ${selectedIds.length} visitor(s)? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
            />
        </div>
    );
};

export default VisitorList;
