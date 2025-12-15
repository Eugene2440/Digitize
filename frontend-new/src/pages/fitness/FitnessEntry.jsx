import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fitnessService } from '@/services/fitness.service';
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
        <div className="fitness-form-container">
            <h1 className="fitness-form-title">Gym Attendance</h1>
            
            <div className="form-group">
                <label htmlFor="search" className="form-label">Search Member</label>
                <input
                    id="search"
                    type="text"
                    className="form-input"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {search && filteredMembers.length > 0 && (
                <div className="member-search-results">
                    {filteredMembers.map(member => (
                        <div
                            key={member.id}
                            className="member-search-item"
                            onClick={() => handleAddMember(member)}
                        >
                            <div className="member-search-name">{member.name}</div>
                            <div className="member-search-details">{member.id_number} - {member.company}</div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMembers.length > 0 && (
                <div className="form-group">
                    <span className="selected-members-label">Selected Members ({selectedMembers.length})</span>
                    <div className={`selected-members-grid ${selectedMembers.length > 3 ? 'compact' : 'expanded'}`}>
                        {selectedMembers.map(member => (
                            <div key={member.id} className={`selected-member-card ${selectedMembers.length > 3 ? 'compact' : ''}`}>
                                <div className="selected-member-info">
                                    <div className={`selected-member-name ${selectedMembers.length > 3 ? 'compact' : ''}`}>
                                        {member.name}
                                    </div>
                                    <div className={`selected-member-id ${selectedMembers.length > 3 ? 'compact' : ''}`}>
                                        {member.id_number}
                                    </div>
                                </div>
                                <button 
                                    className={`remove-member-btn ${selectedMembers.length > 3 ? 'compact' : ''}`}
                                    onClick={() => handleRemoveMember(member.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="session" className="form-label">Session</label>
                <select
                    id="session"
                    className="form-select"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                </select>
            </div>

            <div className="form-actions">
                <button 
                    className="btn-primary" 
                    onClick={handleCheckIn} 
                    disabled={loading || selectedMembers.length === 0}
                >
                    {loading ? 'Checking In...' : `Check In ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}`}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/fitness')}>
                    Cancel
                </button>
            </div>

            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Error"
                footer={
                    <button className="btn-primary" onClick={() => setErrorModal({ open: false, message: '' })}>OK</button>
                }
            >
                <p className="text-gray-600">{errorModal.message}</p>
            </Modal>
        </div>
    );
};

export default FitnessEntry;
