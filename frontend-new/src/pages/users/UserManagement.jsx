import React, { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { Users, Plus, Trash2, X } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'data_entry'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await userService.create(formData);
            setShowForm(false);
            setFormData({ username: '', password: '', full_name: '', role: 'data_entry' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await userService.delete(id);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
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
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        User Management
                    </h1>
                    <p className="page-subtitle">Manage system users</p>
                </div>
                <button className={showForm ? 'secondary-btn' : 'cta-button'} onClick={() => setShowForm(!showForm)}>
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {showForm && (
                <div className="user-form-container">
                    <h3 className="user-form-title">Create New User</h3>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="user-form-grid">
                            <div className="form-group">
                                <label htmlFor="full_name" className="form-label">Full Name</label>
                                <input
                                    id="full_name"
                                    type="text"
                                    className="form-input"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role" className="form-label">Role</label>
                                <select
                                    id="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="data_entry">Data Entry</option>
                                    <option value="dashboard_visitor">Dashboard - Visitor</option>
                                    <option value="dashboard_cargo">Dashboard - Cargo</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Create User</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="user-management-table">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table-header">Name</th>
                                <th className="table-header hidden sm:table-cell">Username</th>
                                <th className="table-header">Role</th>
                                <th className="table-header text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="table-cell text-center py-8" style={{color: '#6b7280'}}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="table-row">
                                        <td className="table-cell font-medium">{user.full_name}</td>
                                        <td className="table-cell hidden sm:table-cell">{user.username}</td>
                                        <td className="table-cell">
                                            <span className={user.role === 'admin' ? 'role-badge-admin' : 'role-badge-standard'}>
                                                {user.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <button className="action-btn delete" onClick={() => handleDelete(user.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
