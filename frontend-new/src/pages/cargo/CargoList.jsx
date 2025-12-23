import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cargoService } from '@/services/cargo.service';
import { locationService } from '@/services/location.service';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Trash2, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/modal';
import { formatTimestamp } from '@/utils/dateFormatter';

const CargoList = () => {
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const [cargo, setCargo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locations, setLocations] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortField, setSortField] = useState('time_in');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        category: true,
        location: true,
        awb: true,
        uld: true,
        description: true,
        company: true,
        driver: true,
        vehicle: true,
        time_in: true
    });

    useEffect(() => {
        fetchCargo();
        fetchLocations();
    }, [filter, locationFilter]);

    const fetchCargo = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { category: filter } : {};
            if (locationFilter) params.location_id = locationFilter;
            const data = await cargoService.getAll(params);
            setCargo(data);
        } catch (error) {
            console.error('Error fetching cargo:', error);
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

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this cargo entry?')) return;
        try {
            await cargoService.delete(id);
            fetchCargo();
        } catch (error) {
            alert('Failed to delete cargo');
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
            setSelectedIds(filteredCargo.map(c => c.id));
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
            await Promise.all(selectedIds.map(id => cargoService.delete(id)));
            setBulkDeleteModal(false);
            setSelectedIds([]);
            fetchCargo();
        } catch (error) {
            alert('Failed to delete cargo entries');
        }
    };

    const filteredCargo = cargo
        .filter(item =>
            item.description?.toLowerCase().includes(search.toLowerCase()) ||
            item.awb_number?.includes(search) ||
            item.company?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (sortField === 'time_in' || sortField === 'created_at') {
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
                    <h1 className="page-title">Cargo Management</h1>
                    <p className="page-subtitle">View and manage cargo entries</p>
                </div>
                <div className="flex gap-4">
                    {hasRole('admin') && (
                        <div className="column-menu-container">
                            <button className="btn-outline-shadow" onClick={() => setShowColumnMenu(!showColumnMenu)}>
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
                    <button className="cta-button" onClick={() => navigate('/cargo/new')}>
                        <Package className="h-4 w-4" />
                        New Cargo
                    </button>
                </div>
            </div>

            <div className="filters-container">
                <div className="filters-row" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search by AWB, description, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'known' ? 'active' : ''}`} onClick={() => setFilter('known')}>Known</button>
                        <button className={`filter-btn ${filter === 'unknown' ? 'active' : ''}`} onClick={() => setFilter('unknown')}>Unknown</button>
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

            <div className="cargo-list-table">
                <table className="table">
                    <thead>
                        <tr>
                            {hasRole('admin') && (
                                <th className="table-header" style={{ width: '48px' }}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredCargo.length && filteredCargo.length > 0} />
                                </th>
                            )}
                            {visibleColumns.category && (
                                <th className="table-header sortable" onClick={() => handleSort('category')}>
                                    <div className="flex items-center gap-1">
                                        Category {sortField === 'category' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronUp className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.location && <th className="table-header">Location</th>}
                            {visibleColumns.awb && (
                                <th className="table-header sortable" onClick={() => handleSort('awb_number')}>
                                    <div className="flex items-center gap-1">
                                        AWB No. {sortField === 'awb_number' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronUp className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.uld && <th className="table-header">ULD No.</th>}
                            {visibleColumns.description && <th className="table-header">Description</th>}
                            {visibleColumns.company && (
                                <th className="table-header sortable" onClick={() => handleSort('company')}>
                                    <div className="flex items-center gap-1">
                                        Company {sortField === 'company' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronUp className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.driver && <th className="table-header">Driver</th>}
                            {visibleColumns.vehicle && <th className="table-header">Vehicle</th>}
                            {visibleColumns.time_in && (
                                <th className="table-header sortable" onClick={() => handleSort('time_in')}>
                                    <div className="flex items-center gap-1">
                                        Time In {sortField === 'time_in' ? (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronUp className="h-4 w-4 opacity-30" />}
                                    </div>
                                </th>
                            )}
                            {hasRole('admin') && <th className="table-header">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCargo.length === 0 ? (
                            <tr>
                                <td colSpan={hasRole('admin') ? 10 : 9} className="table-cell text-center py-8" style={{ color: '#6b7280' }}>
                                    No cargo entries found
                                </td>
                            </tr>
                        ) : (
                            filteredCargo.map((item) => (
                                <tr key={item.id} className="table-row">
                                    {hasRole('admin') && (
                                        <td className="table-cell">
                                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                                        </td>
                                    )}
                                    {visibleColumns.category && (
                                        <td className="table-cell">
                                            <span className={item.category === 'known' ? 'category-badge-known' : 'category-badge-unknown'}>
                                                {item.category}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.location && (
                                        <td className="table-cell">
                                            {item.location ? (
                                                <span className="text-xs text-gray-500">{item.location.name}</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                    )}
                                    {visibleColumns.awb && <td className="table-cell font-medium">{item.awb_number}</td>}
                                    {visibleColumns.uld && <td className="table-cell">{item.uld_numbers}</td>}
                                    {visibleColumns.description && <td className="table-cell">{item.description}</td>}
                                    {visibleColumns.company && <td className="table-cell">{item.company}</td>}
                                    {visibleColumns.driver && <td className="table-cell">{item.driver_name}</td>}
                                    {visibleColumns.vehicle && <td className="table-cell">{item.vehicle_registration}</td>}
                                    {visibleColumns.time_in && (
                                        <td className="table-cell text-xs">
                                            {item.time_in ? formatTimestamp(item.time_in) : '-'}
                                        </td>
                                    )}
                                    {hasRole('admin') && (
                                        <td className="table-cell">
                                            <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={bulkDeleteModal}
                onClose={() => setBulkDeleteModal(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Cargo Entries"
                message={`Are you sure you want to delete ${selectedIds.length} cargo entr${selectedIds.length === 1 ? 'y' : 'ies'}? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
            />
        </div>
    );
};

export default CargoList;
