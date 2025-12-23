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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Location Management</h1>
                    <p className="text-gray-500">Manage system locations</p>
                </div>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4" />
                    Add Location
                </button>
            </div>

            <div className="bg-white rounded-lg shadowoverflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {locations.map((location) => (
                            <tr key={location.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                                            <MapPin className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{location.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(location)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingLocation ? 'Edit Location' : 'Add New Location'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded-md"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                                >
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
