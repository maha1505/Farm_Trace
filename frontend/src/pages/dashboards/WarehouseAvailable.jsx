import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const WarehouseAvailable = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [transporters, setTransporters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [assignedTransporter, setAssignedTransporter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchRes, userRes] = await Promise.all([
                axios.get('http://localhost:5000/api/batches'),
                axios.get('http://localhost:5000/api/auth/users?role=Transporter')
            ]);

            // Only show products ready at the Farm
            const readyBatches = batchRes.data.data.filter(b => b.status === 'Ready for Supply Chain');
            const sorted = readyBatches.sort((a, b) => a.remainingShelfLife - b.remainingShelfLife);

            setBatches(sorted);
            setTransporters(userRes.data.data);
        } catch (err) {
            console.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTransporter = async () => {
        if (!assignedTransporter) {
            alert('Please select a Transporter.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/batches/${selectedBatch._id}/status`, {
                status: 'Assigned (Farm to Warehouse)',
                location: 'System',
                note: 'Warehouse scheduled pickup from Farm',
                transporterId: assignedTransporter,
                warehouseManagerId: user._id,
            });
            setSelectedBatch(null);
            setAssignedTransporter('');
            fetchData();
        } catch (err) {
            alert('Assignment failed');
        }
    };

    return (
        <>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Available Farm Products</h1>
                    <p style={{ color: '#5f6368' }}>Browse products ready for pickup and schedule transporters to pull them to your warehouse</p>
                </div>

                <div className="glass-card" style={{ background: 'white', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                                <th style={{ padding: '1rem' }}>Batch ID</th>
                                <th style={{ padding: '1rem' }}>Product & Farm</th>
                                <th style={{ padding: '1rem' }}>Harvested</th>
                                <th style={{ padding: '1rem' }}>Remaining Shelf Life</th>
                                <th style={{ padding: '1rem' }}>Priority</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((batch) => (
                                <tr key={batch._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{batch.batchId}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{batch.productName} ({batch.quantity} units)</div>
                                        <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>Farm: {batch.farmer?.name || 'Unknown'}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(batch.harvestTimestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} color="#5f6368" />
                                            <span>{Math.round(batch.remainingShelfLife)} Hours</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ width: '100%', maxWidth: '100px' }}>
                                            <div style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }} className={`priority-${batch.priority.toLowerCase()}`}>
                                                {batch.priority} Risk
                                            </div>
                                            <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(100, (batch.remainingShelfLife / batch.shelfLife) * 100)}%`,
                                                    background: batch.priority === 'High' ? '#d32f2f' : batch.priority === 'Medium' ? '#ffa000' : '#388e3c'
                                                }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedBatch(batch)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        >
                                            Schedule Pickup
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {batches.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
                                        <Package size={32} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.5 }} />
                                        No products are currently available from farmers.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBatch && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card"
                        style={{ background: 'white', padding: '2rem', width: '90%', maxWidth: '400px', borderRadius: '16px' }}
                    >
                        <h3>Schedule Pickup: #{selectedBatch.batchId}</h3>
                        <p style={{ margin: '1rem 0', color: '#5f6368' }}>Assign a transporter to pull this product from the farm to your warehouse.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                                <Truck size={18} /> Select Transporter
                            </label>
                            <select
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                value={assignedTransporter}
                                onChange={(e) => setAssignedTransporter(e.target.value)}
                            >
                                <option value="">Select a registered Transporter</option>
                                {transporters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => {
                                setSelectedBatch(null);
                                setAssignedTransporter('');
                            }} className="btn" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                            <button onClick={handleAssignTransporter} className="btn btn-primary" style={{ flex: 1 }}>Confirm Scheduling</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default WarehouseAvailable;
