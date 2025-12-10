import React, { useState, useEffect } from 'react';
import { fitnessService } from '@/services/fitness.service';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Gym Members</h1>
                    <p className="text-muted-foreground">Manage registered gym members</p>
                </div>
                {hasAnyRole(['data_entry', 'admin']) && (
                    <Button onClick={() => { setEditingMember(null); setFormData({ name: '', id_number: '', phone_number: '', company: '' }); setShowModal(true); }}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-4">
                    <Input
                        placeholder="Search by name, ID, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </CardContent>
            </Card>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>ID Number</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Company</TableHead>
                            {hasAnyRole(['data_entry', 'admin']) && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No members found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.id_number}</TableCell>
                                    <TableCell>{member.phone_number}</TableCell>
                                    <TableCell>{member.company}</TableCell>
                                    {hasAnyRole(['data_entry', 'admin']) && (
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {hasRole('admin') && (
                                                    <Button size="sm" variant="destructive" onClick={() => setDeleteModal({ open: true, id: member.id })}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingMember(null); }}
                title={editingMember ? 'Edit Member' : 'Add New Member'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => { setShowModal(false); setEditingMember(null); }}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="id_number">ID Number</Label>
                        <Input
                            id="id_number"
                            required
                            value={formData.id_number}
                            onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                            id="phone_number"
                            required
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
