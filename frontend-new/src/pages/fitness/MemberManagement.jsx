import React, { useState, useEffect } from 'react';
import { fitnessService } from '@/services/fitness.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

const MemberManagement = () => {
    const { hasRole, hasAnyRole } = useAuth();
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddRow, setShowAddRow] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });
    const [formData, setFormData] = useState({
        name: '',
        id_number: '',
        phone_number: '',
        company: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await fitnessService.getAllMembers();
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            if (editingMember) {
                await fitnessService.updateMember(editingMember.id, formData);
                showToast('Member updated successfully!', 'success');
            } else {
                await fitnessService.createMember(formData);
                showToast('Member added successfully!', 'success');
            }
            setShowAddRow(false);
            setEditingMember(null);
            setFormData({ name: '', id_number: '', phone_number: '', company: '' });
            fetchMembers();
        } catch (error) {
            setErrorModal({ open: true, message: error.response?.data?.error || 'Failed to save member' });
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            id_number: member.id_number,
            phone_number: member.phone_number,
            company: member.company
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await fitnessService.deleteMember(deleteModal.id);
            showToast('Member deleted successfully!', 'success');
            setDeleteModal({ open: false, id: null });
            fetchMembers();
        } catch (error) {
            setErrorModal({ open: true, message: error.response?.data?.error || 'Failed to delete member' });
            setDeleteModal({ open: false, id: null });
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id_number.includes(search) ||
        m.company.toLowerCase().includes(search.toLowerCase())
    );

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
                    <h1 className="page-title">Gym Members</h1>
                    <p className="page-subtitle">Manage registered gym members</p>
                </div>
                {hasAnyRole(['data_entry', 'admin']) && (
                    <button className="cta-button" onClick={() => { setEditingMember(null); setFormData({ name: '', id_number: '', phone_number: '', company: '' }); setShowAddRow(true); }}>
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </button>
                )}
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name, ID, or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input-wide"
                />
            </div>

            <div className="member-list-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table-header">Name</th>
                            <th className="table-header">ID Number</th>
                            <th className="table-header">Phone Number</th>
                            <th className="table-header">Company</th>
                            {hasAnyRole(['data_entry', 'admin']) && <th className="table-header">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {showAddRow && (
                            <tr className="table-row" style={{ backgroundColor: '#f9fafb' }}>
                                <td className="table-cell">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                    />
                                </td>
                                <td className="table-cell">
                                    <input
                                        type="text"
                                        placeholder="ID Number"
                                        className="form-input"
                                        value={formData.id_number}
                                        onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                    />
                                </td>
                                <td className="table-cell">
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        className="form-input"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                    />
                                </td>
                                <td className="table-cell">
                                    <input
                                        type="text"
                                        placeholder="Company"
                                        className="form-input"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                    />
                                </td>
                                <td className="table-cell">
                                    <div className="actions-group">
                                        <button
                                            className="action-btn"
                                            onClick={handleSubmit}
                                            style={{ color: '#22c55e' }}
                                            title="Save"
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="action-btn"
                                            onClick={() => { setShowAddRow(false); setFormData({ name: '', id_number: '', phone_number: '', company: '' }); }}
                                            style={{ color: '#ef4444' }}
                                            title="Cancel"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filteredMembers.length === 0 && !showAddRow ? (
                            <tr>
                                <td colSpan={5} className="table-cell text-center py-8" style={{ color: '#6b7280' }}>
                                    No members found
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id} className="table-row" style={editingMember?.id === member.id ? { backgroundColor: '#f9fafb' } : {}}>
                                    {editingMember?.id === member.id ? (
                                        <>
                                            <td className="table-cell">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                                />
                                            </td>
                                            <td className="table-cell">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.id_number}
                                                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                                />
                                            </td>
                                            <td className="table-cell">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.phone_number}
                                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                                />
                                            </td>
                                            <td className="table-cell">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%' }}
                                                />
                                            </td>
                                            <td className="table-cell">
                                                <div className="actions-group">
                                                    <button
                                                        className="action-btn"
                                                        onClick={handleSubmit}
                                                        style={{ color: '#22c55e' }}
                                                        title="Save"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => { setEditingMember(null); setFormData({ name: '', id_number: '', phone_number: '', company: '' }); }}
                                                        style={{ color: '#ef4444' }}
                                                        title="Cancel"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="table-cell font-medium">{member.name}</td>
                                            <td className="table-cell">{member.id_number}</td>
                                            <td className="table-cell">{member.phone_number}</td>
                                            <td className="table-cell">{member.company}</td>
                                            {hasAnyRole(['data_entry', 'admin']) && (
                                                <td className="table-cell">
                                                    <div className="actions-group">
                                                        <button className="action-btn" onClick={() => handleEdit(member)}>
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        {hasRole('admin') && (
                                                            <button className="action-btn delete" onClick={() => setDeleteModal({ open: true, id: member.id })}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </>
                                    )}
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
                title="Delete Member"
                message="Are you sure you want to delete this member? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />

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

export default MemberManagement;
