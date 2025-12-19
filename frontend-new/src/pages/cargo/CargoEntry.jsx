import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cargoService } from '@/services/cargo.service';

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
        <div className="cargo-form-container">
            <h1 className="form-title">New Cargo Entry</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-heading">Cargo Identification</h3>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="known">Known</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="awb" className="form-label">AWB Number</label>
                            <input
                                id="awb"
                                type="text"
                                required
                                className="form-input"
                                value={formData.awb_number}
                                onChange={(e) => setFormData({ ...formData, awb_number: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label htmlFor="uld" className="form-label">ULD Numbers</label>
                            <input
                                id="uld"
                                type="text"
                                required
                                className="form-input"
                                value={formData.uld_numbers}
                                onChange={(e) => setFormData({ ...formData, uld_numbers: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <input
                                id="description"
                                type="text"
                                required
                                className="form-input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-heading">Shipper Information</h3>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label htmlFor="company" className="form-label">Company</label>
                            <input
                                id="company"
                                type="text"
                                className="form-input"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vehicle" className="form-label">Vehicle Registration</label>
                            <input
                                id="vehicle"
                                type="text"
                                required
                                className="form-input"
                                value={formData.vehicle_registration}
                                onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label htmlFor="driver_name" className="form-label">Driver Name</label>
                            <input
                                id="driver_name"
                                type="text"
                                required
                                className="form-input"
                                value={formData.driver_name}
                                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="driver_id" className="form-label">Driver ID</label>
                            <input
                                id="driver_id"
                                type="text"
                                required
                                className="form-input"
                                value={formData.driver_id}
                                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Entry'}
                    </button>
                    <button type="button" onClick={() => navigate('/cargo')} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CargoEntry;
