import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '@/services/visitor.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
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
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Visitor Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative" ref={dropdownRef}>
                            <Label htmlFor="id_number">ID Number</Label>
                            <Input
                                id="id_number"
                                required
                                value={formData.id_number}
                                onChange={(e) => handleIdChange(e.target.value)}
                                autoComplete="off"
                            />
                            {showDropdown && (
                                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md bg-white/50 backdrop-blur-md border border-gray-200 shadow-lg">
                                    {filteredVisitors.map((visitor) => (
                                        <div
                                            key={visitor.id}
                                            onClick={() => handleSelectVisitor(visitor)}
                                            className="px-4 py-2 cursor-pointer hover:bg-white/70 text-black text-sm border-b border-gray-100 last:border-b-0"
                                        >
                                            {visitor.id_number} - {visitor.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Tooltip content="Enter father's name as shown on ID">
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                </Tooltip>
                                <Input
                                    id="middle_name"
                                    required
                                    value={formData.middle_name}
                                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name">Last Name (Optional)</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="area">Area of Visit</Label>
                            <Input
                                id="area"
                                required
                                value={formData.area_of_visit}
                                onChange={(e) => setFormData({ ...formData, area_of_visit: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="purpose">Purpose</Label>
                            <Input
                                id="purpose"
                                required
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            />
                        </div>
                        <div className="max-w-[120px]">
                            <Label htmlFor="badge_number">Badge Number</Label>
                            <Input
                                id="badge_number"
                                required
                                maxLength={3}
                                value={formData.badge_number}
                                onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Register Visitor'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/visitors')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VisitorSignIn;
