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
    const [selectedMembers, setSelectedMembers] = useState([]);
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

    const handleAddMember = (member) => {
        if (!selectedMembers.find(m => m.id === member.id)) {
            setSelectedMembers([...selectedMembers, member]);
        }
        setSearch('');
    };

    const handleRemoveMember = (memberId) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
    };

    const handleCheckIn = async () => {
        if (selectedMembers.length === 0) {
            setErrorModal({ open: true, message: 'Please select at least one member' });
            return;
        }
        setLoading(true);
        try {
            const results = await Promise.allSettled(
                selectedMembers.map(member =>
                    fitnessService.checkIn({
                        member_id: member.id,
                        session: session
                    })
                )
            );
            
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length === 0) {
                showToast(`${selectedMembers.length} member(s) checked in successfully!`, 'success');
                setSelectedMembers([]);
            } else {
                showToast(`${results.length - failed.length} checked in, ${failed.length} failed`, 'error');
            }
        } catch (error) {
            setErrorModal({ open: true, message: 'Failed to check in members' });
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
                                        onClick={() => handleAddMember(member)}
                                    >
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-gray-600">{member.id_number} - {member.company}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedMembers.length > 0 && (
                            <div>
                                <Label>Selected Members ({selectedMembers.length})</Label>
                                <div className={selectedMembers.length > 3 ? "grid grid-cols-2 md:grid-cols-3 gap-2 mt-2" : "space-y-2 mt-2"}>
                                    {selectedMembers.map(member => (
                                        <Card key={member.id}>
                                            <CardContent className={selectedMembers.length > 3 ? "p-2 flex items-center justify-between" : "p-3 flex items-center justify-between"}>
                                                <div className={selectedMembers.length > 3 ? "text-xs" : ""}>
                                                    <div className="font-medium truncate">{member.name}</div>
                                                    <div className={selectedMembers.length > 3 ? "text-xs text-gray-600 truncate" : "text-sm text-gray-600 truncate"}>{member.id_number}</div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member.id)} className={selectedMembers.length > 3 ? "h-6 w-6 p-0" : ""}>
                                                    ✕
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
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
                            <Button onClick={handleCheckIn} disabled={loading || selectedMembers.length === 0}>
                                {loading ? 'Checking In...' : `Check In ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}`}
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
