import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '@/services/visitor.service';
import { useToast } from '@/components/ui/toast';

const VisitorSignIn = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [allVisitors, setAllVisitors] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredVisitors, setFilteredVisitors] = useState([]);
    const dropdownRef = useRef(null);
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        id_number: '',
        badge_number: '',
        area_of_visit: '',
        purpose: ''
    });

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const data = await visitorService.getAll();
                setAllVisitors(data);
            } catch (error) {
                console.error('Failed to fetch visitors');
            }
        };
        fetchVisitors();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIdChange = (value) => {
        setFormData({ ...formData, id_number: value });
        if (value.length > 0) {
            const matches = allVisitors.filter(v => v.id_number?.startsWith(value));
            setFilteredVisitors(matches);
            setShowDropdown(matches.length > 0);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectVisitor = (visitor) => {
        setFormData({
            first_name: visitor.name?.split(' ')[0] || '',
            middle_name: visitor.name?.split(' ')[1] || '',
            last_name: visitor.name?.split(' ').slice(2).join(' ') || '',
            id_number: visitor.id_number || '',
            badge_number: '',
            area_of_visit: visitor.area_of_visit || '',
            purpose: visitor.purpose || ''
        });
        setShowDropdown(false);
        showToast('Data loaded from previous visit', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const name = `${formData.first_name} ${formData.middle_name}${formData.last_name ? ' ' + formData.last_name : ''}`;
            await visitorService.create({ ...formData, name });
            navigate('/visitors');
        } catch (error) {
            alert('Failed to create visitor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="visitor-form-container">
            <h1 className="form-title">New Visitor</h1>
            <p className="form-subtitle">Register a new visitor entry</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group dropdown-container" ref={dropdownRef}>
                    <label htmlFor="id_number" className="form-label">ID Number</label>
                    <input
                        id="id_number"
                        type="text"
                        required
                        className="form-input"
                        placeholder="Enter ID number"
                        value={formData.id_number}
                        onChange={(e) => handleIdChange(e.target.value)}
                        autoComplete="off"
                    />
                    {showDropdown && (
                        <div className="dropdown-list">
                            {filteredVisitors.map((visitor) => (
                                <div
                                    key={visitor.id}
                                    onClick={() => handleSelectVisitor(visitor)}
                                    className="dropdown-item"
                                >
                                    {visitor.id_number} - {visitor.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-grid form-grid-3">
                    <div className="form-group">
                        <label htmlFor="first_name" className="form-label">First Name</label>
                        <input
                            id="first_name"
                            type="text"
                            required
                            className="form-input"
                            placeholder="Enter first name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="middle_name" className="form-label">Middle Name</label>
                        <input
                            id="middle_name"
                            type="text"
                            required
                            className="form-input"
                            placeholder="Enter middle name"
                            value={formData.middle_name}
                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name" className="form-label">Last Name</label>
                        <input
                            id="last_name"
                            type="text"
                            className="form-input"
                            placeholder="Optional"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-grid form-grid-2">
                    <div className="form-group">
                        <label htmlFor="area" className="form-label">Area of Visit</label>
                        <input
                            id="area"
                            type="text"
                            required
                            className="form-input"
                            placeholder="Enter area"
                            value={formData.area_of_visit}
                            onChange={(e) => setFormData({ ...formData, area_of_visit: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="purpose" className="form-label">Purpose</label>
                        <input
                            id="purpose"
                            type="text"
                            required
                            className="form-input"
                            placeholder="Enter purpose"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="badge_number" className="form-label">Badge Number</label>
                    <input
                        id="badge_number"
                        type="text"
                        required
                        maxLength={3}
                        className="form-input"
                        placeholder="3 digits"
                        value={formData.badge_number}
                        onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Register Visitor'}
                    </button>
                    <button type="button" onClick={() => navigate('/visitors')} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VisitorSignIn;
