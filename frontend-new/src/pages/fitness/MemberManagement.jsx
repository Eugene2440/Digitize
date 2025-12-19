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
    const [showModal, setShowModal] = useState(false);
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
        e.preventDefault();
        try {
            if (editingMember) {
                await fitnessService.updateMember(editingMember.id, formData);
                showToast('Member updated successfully!', 'success');
            } else {
                await fitnessService.createMember(formData);
                showToast('Member added successfully!', 'success');
            }
            setShowModal(false);
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
                    <button className="cta-button" onClick={() => { setEditingMember(null); setFormData({ name: '', id_number: '', phone_number: '', company: '' }); setShowModal(true); }}>
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
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="table-cell text-center py-8" style={{color: '#6b7280'}}>
                                    No members found
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member) => (
                                <tr key={member.id} className="table-row">
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
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingMember(null); }}
                title={editingMember ? 'Edit Member' : 'Add New Member'}
                footer={
                    <>
                        <button 
                            onClick={() => { setShowModal(false); setEditingMember(null); }}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: 'white',
                                color: '#576238',
                                border: '1px solid #576238',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(87, 98, 56, 0.05)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            style={{
                                padding: '0.625rem 1.5rem',
                                backgroundColor: '#FFD95D',
                                color: '#576238',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e6c54a'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#FFD95D'}
                        >
                            Save
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label htmlFor="name" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#576238',
                            marginBottom: '0.5rem'
                        }}>Name</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#576238';
                                e.target.style.boxShadow = '0 0 0 3px rgba(87, 98, 56, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="id_number" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#576238',
                            marginBottom: '0.5rem'
                        }}>ID Number</label>
                        <input
                            id="id_number"
                            type="text"
                            required
                            value={formData.id_number}
                            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#576238';
                                e.target.style.boxShadow = '0 0 0 3px rgba(87, 98, 56, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone_number" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#576238',
                            marginBottom: '0.5rem'
                        }}>Phone Number</label>
                        <input
                            id="phone_number"
                            type="text"
                            required
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#576238';
                                e.target.style.boxShadow = '0 0 0 3px rgba(87, 98, 56, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="company" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#576238',
                            marginBottom: '0.5rem'
                        }}>Company</label>
                        <input
                            id="company"
                            type="text"
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = 'none';
                                e.target.style.borderColor = '#576238';
                                e.target.style.boxShadow = '0 0 0 3px rgba(87, 98, 56, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </form>
            </Modal>

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
