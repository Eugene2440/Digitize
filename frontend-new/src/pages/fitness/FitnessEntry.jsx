import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fitnessService } from '@/services/fitness.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';

const FitnessEntry = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [session, setSession] = useState('morning');
    const [errorModal, setErrorModal] = useState({ open: false, message: '' });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const data = await fitnessService.getAllMembers();
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedMember) {
            setErrorModal({ open: true, message: 'Please select a member' });
            return;
        }
        setLoading(true);
        try {
            await fitnessService.checkIn({
                member_id: selectedMember.id,
                session: session
            });
            showToast('Checked in successfully!', 'success');
            setSelectedMember(null);
            setSearch('');
        } catch (error) {
            setErrorModal({ open: true, message: error.response?.data?.error || 'Failed to check in' });
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id_number.includes(search)
    );

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Gym Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search">Search Member</Label>
                            <Input
                                id="search"
                                placeholder="Search by name or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {search && filteredMembers.length > 0 && (
                            <div className="border rounded-md max-h-48 overflow-y-auto">
                                {filteredMembers.map(member => (
                                    <div
                                        key={member.id}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                        onClick={() => { setSelectedMember(member); setSearch(''); }}
                                    >
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-gray-600">{member.id_number} - {member.company}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedMember && (
                            <Card>
                                <CardContent className="p-4">
                                    <div className="space-y-2">
                                        <div><strong>Name:</strong> {selectedMember.name}</div>
                                        <div><strong>ID:</strong> {selectedMember.id_number}</div>
                                        <div><strong>Phone:</strong> {selectedMember.phone_number}</div>
                                        <div><strong>Company:</strong> {selectedMember.company}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div>
                            <Label htmlFor="session">Session</Label>
                            <select
                                id="session"
                                className="w-full border rounded-md p-2"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.10)',
                                    backdropFilter: 'blur(5px)',
                                    WebkitBackdropFilter: 'blur(5px)'
                                }}
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleCheckIn} disabled={loading || !selectedMember}>
                                {loading ? 'Checking In...' : 'Check In'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/fitness')}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

export default FitnessEntry;
