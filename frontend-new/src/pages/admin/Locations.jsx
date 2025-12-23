import React, { useState, useEffect } from 'react';
import { locationService } from '@/services/location.service';
import { useToast } from '@/components/ui/toast';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: ''
    });

    const fetchLocations = async () => {
        try {
            const data = await locationService.getAll();
            setLocations(data);
        } catch (error) {
            showToast('Failed to fetch locations', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await locationService.update(editingLocation.id, formData);
                showToast('Location updated successfully', 'success');
            } else {
                await locationService.create(formData);
                showToast('Location created successfully', 'success');
            }
            setIsModalOpen(false);
            setEditingLocation(null);
            setFormData({ name: '', code: '', address: '' });
            fetchLocations();
        } catch (error) {
            showToast('Failed to save location', 'error');
        }
    };

    const handleEdit = (location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            code: location.code,
            address: location.address
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            try {
                await locationService.delete(id);
                showToast('Location deleted successfully', 'success');
                fetchLocations();
            } catch (error) {
                showToast('Failed to delete location', 'error');
            }
        }
    };

    const handleOpenModal = () => {
        setEditingLocation(null);
        setFormData({ name: '', code: '', address: '' });
        setIsModalOpen(true);
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Location Management</h1>
                    <p className="page-subtitle">Manage system locations</p>
                </div>
                <button onClick={handleOpenModal} className="cta-button">
                    <Plus className="h-4 w-4" />
                    Add Location
                </button>
            </div>

            <div className="visitor-list-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table-header">Name</th>
                            <th className="table-header">Code</th>
                            <th className="table-header">Address</th>
                            <th className="table-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="table-cell text-center py-8" style={{ color: '#6b7280' }}>
                                    No locations found
                                </td>
                            </tr>
                        ) : (
                            locations.map((location) => (
                                <tr key={location.id} className="table-row">
                                    <td className="table-cell font-medium">{location.name}</td>
                                    <td className="table-cell">{location.code}</td>
                                    <td className="table-cell">{location.address}</td>
                                    <td className="table-cell">
                                        <div className="actions-group">
                                            <button onClick={() => handleEdit(location)} className="action-btn">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(location.id)} className="action-btn delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingLocation ? 'Edit Location' : 'Add New Location'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-input"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingLocation ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Locations;
