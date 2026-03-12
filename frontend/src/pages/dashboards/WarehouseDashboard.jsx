import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WarehouseDashboard = () => {
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
                axios.get('http://localhost:5000/api/auth/users?role=Transporter') // I need to implement this
            ]);
            // Sort by freshness priority (least remaining shelf life first)
            const sorted = batchRes.data.data.sort((a, b) => a.remainingShelfLife - b.remainingShelfLife);
            setBatches(sorted);
            setTransporters(userRes.data.data);
        } catch (err) {
            console.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async () => {
        try {
            await axios.put(`http://localhost:5000/api/batches/${selectedBatch._id}/status`, {
                status: 'Picked Up',
                location: 'Warehouse',
                note: 'Assigned to transporter',
                transporterId: assignedTransporter
            });
            setSelectedBatch(null);
            fetchData();
        } catch (err) {
            alert('Dispatch failed');
        }
    };

    return (
        <>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Warehouse Inventory</h1>
                    <p style={{ color: '#5f6368' }}>Monitor freshness and prioritize dispatches</p>
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
                                        <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>{batch.category}</div>
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
                                            disabled={batch.status !== 'Ready for Supply Chain'}
                                        >
                                            Dispatch
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBatch && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ background: 'white', padding: '2rem', width: '100%', maxWidth: '400px' }}>
                        <h3>Dispatch Batch #{selectedBatch.batchId}</h3>
                        <p style={{ margin: '1rem 0', color: '#5f6368' }}>Select a transporter for assignment</p>

                        <select
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1.5rem' }}
                            value={assignedTransporter}
                            onChange={(e) => setAssignedTransporter(e.target.value)}
                        >
                            <option value="">Select Transporter</option>
                            {transporters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setSelectedBatch(null)} className="btn" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                            <button onClick={handleDispatch} className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WarehouseDashboard;
