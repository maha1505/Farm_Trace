import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Warehouse, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const FarmerDispatch = () => {
    const [batches, setBatches] = useState([]);
    const [transporters, setTransporters] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [assignedTransporter, setAssignedTransporter] = useState('');
    const [assignedWarehouse, setAssignedWarehouse] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchRes, transporterRes, warehouseRes] = await Promise.all([
                axios.get('http://localhost:5000/api/batches'), // Assumes this fetches farmer's batches
                axios.get('http://localhost:5000/api/auth/users?role=Transporter'),
                axios.get('http://localhost:5000/api/auth/users?role=Warehouse Manager')
            ]);

            // Only show batches that are ready to be shipped
            const readyBatches = batchRes.data.data.filter(b => b.status === 'Ready for Supply Chain');
            const sorted = readyBatches.sort((a, b) => a.remainingShelfLife - b.remainingShelfLife);

            setBatches(sorted);
            setTransporters(transporterRes.data.data);
            setWarehouses(warehouseRes.data.data);
        } catch (err) {
            console.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async () => {
        if (!assignedTransporter || !assignedWarehouse) {
            alert('Please select both a Transporter and a Warehouse.');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/api/batches/${selectedBatch._id}/status`, {
                status: 'Picked Up',
                location: 'Farm Location',
                note: 'Dispatched to Transporter',
                transporterId: assignedTransporter,
                warehouseManagerId: assignedWarehouse
            });
            setSelectedBatch(null);
            setAssignedTransporter('');
            setAssignedWarehouse('');
            fetchData();
        } catch (err) {
            alert('Dispatch failed');
        }
    };

    return (
        <>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Dispatch Management</h1>
                    <p style={{ color: '#5f6368' }}>Assign transporters and warehouses to your products</p>
                </div>

                <div className="glass-card" style={{ background: 'white', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                                <th style={{ padding: '1rem' }}>Batch ID</th>
                                <th style={{ padding: '1rem' }}>Product</th>
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
                                        <div style={{ fontWeight: '500' }}>{batch.productName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>{batch.category} ({batch.quantity} units)</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(batch.harvestTimestamp).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} color="#5f6368" />
                                            <span>{Math.round(batch.remainingShelfLife)} Hours</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`priority-${batch.priority.toLowerCase()}`} style={{
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background: batch.priority === 'High' ? '#ffebee' : batch.priority === 'Medium' ? '#fff8e1' : '#e8f5e9'
                                        }}>
                                            {batch.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedBatch(batch)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        >
                                            Assign Dispatch
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {batches.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>
                                        No batches are currently ready to ship. Register a new batch first.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBatch && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card"
                        style={{ background: 'white', padding: '2.5rem', width: '90%', maxWidth: '450px', borderRadius: '16px' }}
                    >
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dispatch Batch #{selectedBatch.batchId}</h3>

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

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                                <Warehouse size={18} /> Select Destination Warehouse
                            </label>
                            <select
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                value={assignedWarehouse}
                                onChange={(e) => setAssignedWarehouse(e.target.value)}
                            >
                                <option value="">Select a registered Warehouse</option>
                                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => {
                                setSelectedBatch(null);
                                setAssignedTransporter('');
                                setAssignedWarehouse('');
                            }} className="btn" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                            <button onClick={handleDispatch} className="btn btn-primary" style={{ flex: 1 }}>Confirm Dispatch</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default FarmerDispatch;
