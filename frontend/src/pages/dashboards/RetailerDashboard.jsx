import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, CheckCircle, History, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const RetailerDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHistory, setSelectedHistory] = useState(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/batches');
            setBatches(res.data.data);
        } catch (err) {
            console.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Retailer Portal</h1>
                <p style={{ color: '#5f6368' }}>Track incoming shipments and verify product history</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Recent Deliveries */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="#388e3c" />
                        Recent Deliveries
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {batches.map(batch => (
                            <div
                                key={batch._id}
                                onClick={() => setSelectedHistory(batch)}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    background: selectedHistory?._id === batch._id ? '#e8f5e9' : 'transparent'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>{batch.productName}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#9aa0a6' }}>#{batch.batchId}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>
                                    Delivered on: {new Date(batch.timeline[batch.timeline.length - 1].timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Traceability Timeline */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={20} color="#1976d2" />
                        Product Traceability
                    </h2>

                    {selectedHistory ? (
                        <div>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px' }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 0.2rem' }}>{selectedHistory.productName}</p>
                                <p style={{ fontSize: '0.8rem', color: '#5f6368' }}>Batch ID: {selectedHistory.batchId}</p>
                            </div>

                            <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                                {/* Timeline vertical line */}
                                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: '#e0e0e0' }}></div>

                                {selectedHistory.timeline.map((event, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '-22px',
                                            top: '4px',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: idx === 0 ? '#2e7d32' : '#1976d2',
                                            border: '2px solid white',
                                            boxShadow: '0 0 0 2px #e0e0e0'
                                        }}></div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{event.status}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9aa0a6', marginBottom: '0.2rem' }}>
                                            {new Date(event.timestamp).toLocaleString()} | {event.location}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#5f6368' }}>
                                            Responsible: {event.responsibleRole}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9aa0a6' }}>
                            <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Select a batch to view its journey</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RetailerDashboard;
