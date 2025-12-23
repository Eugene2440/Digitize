import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '@/services/visitor.service';
import { locationService } from '@/services/location.service';
import { useAuth } from '@/contexts/AuthContext';
import { InputModal, ConfirmModal } from '@/components/ui/modal';
import { UserPlus, LogIn, LogOut, Trash2, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { formatTimestamp } from '@/utils/dateFormatter';

const VisitorList = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locations, setLocations] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
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
        location: true,
        area: true,
        purpose: true,
        badge: true,
        status: true,
        time_in: true,
        time_out: true
    });

    useEffect(() => {
        fetchVisitors();
        fetchLocations();
    }, [filter, locationFilter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showColumnMenu && !event.target.closest('.column-menu-container')) {
                setShowColumnMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnMenu]);

    const handleColumnMenuToggle = () => {
        setShowColumnMenu(!showColumnMenu);
    };

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            if (locationFilter) params.location_id = locationFilter;
            const data = await visitorService.getAll(params);
            setVisitors(data);
        } catch (error) {
            console.error('Error fetching visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(data);
        } catch (error) {
            console.error('Error fetching locations:', error);
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Visitor Management</h1>
                    <p className="page-subtitle">View and manage visitor entries</p>
                </div>
                <div className="flex gap-3">
                    {hasRole('admin') && (
                        <div className="column-menu-container">
                            <button className="btn-outline-shadow" onClick={handleColumnMenuToggle}>
                                <Settings className="h-4 w-4" />
                                Columns
                            </button>
                            {showColumnMenu && (
                                <div className="column-menu">
                                    {Object.keys(visibleColumns).map(col => (
                                        <label key={col} className="column-menu-item">
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[col]}
                                                onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                                            />
                                            <span className="capitalize">{col.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <button className="cta-button" onClick={() => navigate('/visitors/new')}>
                        <UserPlus className="h-4 w-4" />
                        New Visitor
                    </button>
                </div>
            </div>

            <div className="filters-container">
                <div className="filters-row" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'signed_in' ? 'active' : ''}`} onClick={() => setFilter('signed_in')}>Signed In</button>
                        <button className={`filter-btn ${filter === 'signed_out' ? 'active' : ''}`} onClick={() => setFilter('signed_out')}>Signed Out</button>
                    </div>
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

            <div className="visitor-list-table">
                <table className="table">
                    <thead>
                        <tr>
                            {hasRole('admin') && (
                                <th className="table-header" style={{ width: '48px' }}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredVisitors.length && filteredVisitors.length > 0} />
                                </th>
                            )}
                            {visibleColumns.name && (
                                <th className="table-header sortable" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">
                                        Name {sortField === 'name' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronDown className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.id_number && <th className="table-header">ID Number</th>}
                            {visibleColumns.location && <th className="table-header">Location</th>}
                            {visibleColumns.area && <th className="table-header">Area</th>}
                            {visibleColumns.purpose && <th className="table-header">Purpose</th>}
                            {visibleColumns.badge && <th className="table-header">Badge</th>}
                            {visibleColumns.status && (
                                <th className="table-header sortable" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">
                                        Status {sortField === 'status' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronDown className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.time_in && (
                                <th className="table-header sortable" onClick={() => handleSort('sign_in_time')}>
                                    <div className="flex items-center gap-1">
                                        Time In {sortField === 'sign_in_time' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronDown className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.time_out && (
                                <th className="table-header sortable" onClick={() => handleSort('sign_out_time')}>
                                    <div className="flex items-center gap-1">
                                        Time Out {sortField === 'sign_out_time' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronDown className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            <th className="table-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVisitors.length === 0 ? (
                            <tr>
                                <td colSpan={hasRole('admin') ? 10 : 9} className="table-cell text-center py-8" style={{ color: '#6b7280' }}>
                                    No visitors found
                                </td>
                            </tr>
                        ) : (
                            filteredVisitors.map((visitor, index) => (
                                <tr key={visitor.id} className="table-row">
                                    {hasRole('admin') && (
                                        <td className="table-cell">
                                            <input type="checkbox" checked={selectedIds.includes(visitor.id)} onChange={() => handleSelectOne(visitor.id)} />
                                        </td>
                                    )}
                                    {visibleColumns.name && <td className="table-cell font-medium">{visitor.name}</td>}
                                    {visibleColumns.id_number && <td className="table-cell">{visitor.id_number}</td>}
                                    {visibleColumns.location && (
                                        <td className="table-cell">
                                            {visitor.location ? (
                                                <span className="text-xs text-gray-500">{visitor.location.name}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.area && <td className="table-cell">{visitor.area_of_visit}</td>}
                                    {visibleColumns.purpose && <td className="table-cell">{visitor.purpose}</td>}
                                    {visibleColumns.badge && <td className="table-cell">{visitor.badge_number || '-'}</td>}
                                    {visibleColumns.status && (
                                        <td className="table-cell">
                                            <span className={visitor.status === 'signed_in' ? 'status-badge-signed-in' : 'status-badge-signed-out'}>
                                                {visitor.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.time_in && (
                                        <td className="table-cell text-xs">
                                            {visitor.sign_in_time ? formatTimestamp(visitor.sign_in_time) : '-'}
                                        </td>
                                    )}
                                    {visibleColumns.time_out && (
                                        <td className="table-cell text-xs">
                                            {visitor.sign_out_time ? formatTimestamp(visitor.sign_out_time) : '-'}
                                        </td>
                                    )}
                                    <td className="table-cell">
                                        <div className="actions-group">
                                            {visitor.status === 'pending' && (
                                                <button className="action-btn" onClick={() => setSignInModal({ open: true, id: visitor.id })}>
                                                    <LogIn className="h-4 w-4" />
                                                </button>
                                            )}
                                            {visitor.status === 'signed_in' && (
                                                <button className="action-btn" onClick={() => setSignOutModal({ open: true, id: visitor.id })}>
                                                    <LogOut className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasRole('admin') && (
                                                <button className="action-btn delete" onClick={() => setDeleteModal({ open: true, id: visitor.id })}>
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
