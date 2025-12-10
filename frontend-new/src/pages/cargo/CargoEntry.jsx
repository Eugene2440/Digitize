import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cargoService } from '@/services/cargo.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CargoEntry = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'known',
        awb_number: '',
        uld_numbers: '',
        description: '',
        company: '',
        driver_name: '',
        driver_id: '',
        vehicle_registration: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await cargoService.create(formData);
            navigate('/cargo');
        } catch (error) {
            alert('Failed to create cargo entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Cargo Entry</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black border-b pb-2 text-center">Cargo Identification</h3>
                            <div>
                                <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                className="w-full border rounded-md p-2"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="known">Known</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="awb">AWB Number</Label>
                                <Input
                                    id="awb"
                                    required
                                    value={formData.awb_number}
                                    onChange={(e) => setFormData({ ...formData, awb_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="uld">ULD Numbers</Label>
                                <Input
                                    id="uld"
                                    required
                                    value={formData.uld_numbers}
                                    onChange={(e) => setFormData({ ...formData, uld_numbers: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-black border-b pb-2 text-center">Shipper Information</h3>
                            <div>
                                <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="driver_name">Driver Name</Label>
                            <Input
                                id="driver_name"
                                required
                                value={formData.driver_name}
                                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="driver_id">Driver ID</Label>
                                <Input
                                    id="driver_id"
                                    required
                                    value={formData.driver_id}
                                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="vehicle">Vehicle Registration</Label>
                                <Input
                                    id="vehicle"
                                    required
                                    value={formData.vehicle_registration}
                                    onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
                                />
                            </div>
                        </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Entry'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate('/cargo')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CargoEntry;
