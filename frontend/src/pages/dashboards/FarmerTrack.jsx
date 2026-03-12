import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, History, Info, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const FarmerTrack = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState('');
    const [selectedBatch, setSelectedBatch] = useState(null);

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

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedId = searchId.trim();
        const found = batches.find(b => b.batchId.toLowerCase().trim() === trimmedId.toLowerCase());
        if (found) {
            setSelectedBatch(found);
        } else {
            alert('Product ID not found in your registered batches.');
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Track Product</h1>
                <p style={{ color: '#5f6368' }}>Enter your Unique Product ID (e.g. FT-202603-...) to see its live journey</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Search Panel */}
                <div className="glass-card" style={{ background: 'white', padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={20} color="#2e7d32" /> Lookup Product
                    </h3>

                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <input
                                type="text"
                                placeholder="Enter Product ID"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onPaste={(e) => {
                                    e.stopPropagation();
                                    const pastedText = e.clipboardData.getData('text').trim();
                                    setSearchId(pastedText);
                                    e.preventDefault();
                                }}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                            Track
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#5f6368', marginBottom: '1rem' }}>Or select from recent:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[...batches].reverse().slice(0, 5).map(batch => (
                                <button
                                    key={batch._id}
                                    onClick={() => {
                                        setSearchId(batch.batchId);
                                        setSelectedBatch(batch);
                                    }}
                                    style={{
                                        textAlign: 'left',
                                        padding: '0.8rem',
                                        background: selectedBatch?._id === batch._id ? '#e8f5e9' : '#f8f9fa',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{batch.productName}</span>
                                    <span style={{ color: '#9aa0a6', fontSize: '0.75rem' }}>{batch.batchId}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Panel */}
                <div className="glass-card" style={{ background: 'white', padding: '2rem', minHeight: '500px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={24} color="#1976d2" />
                        Supply Chain Traceability
                    </h2>

                    {selectedBatch ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #2e7d32' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{selectedBatch.productName}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', color: '#5f6368', fontSize: '0.9rem' }}>
                                            <span>Quantity: {selectedBatch.quantity} units</span>
                                            <span>|</span>
                                            <span>Category: {selectedBatch.category}</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        background: '#333',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px'
                                    }}>
                                        {selectedBatch.batchId}
                                    </div>
                                </div>
                                {/* Trust Score */}
                                <div style={{ marginTop: '1rem' }}>
                                    <TrustScoreBadge score={selectedBatch.trustScore} log={selectedBatch.trustScoreLog} />
                                </div>
                            </div>

                            <div style={{ paddingLeft: '2rem', position: 'relative' }}>
                                {/* Timeline vertical line */}
                                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: '#e0e0e0' }}></div>

                                {selectedBatch.timeline.map((event, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '2rem' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '-32px',
                                            top: '2px',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            background: idx === 0 ? '#2e7d32' : idx === selectedBatch.timeline.length - 1 ? '#e91e63' : '#1976d2',
                                            border: '3px solid white',
                                            boxShadow: '0 0 0 2px #e0e0e0'
                                        }}></div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{event.status}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '0.3rem' }}>
                                            <strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '0.3rem' }}>
                                            <strong>Location:</strong> {event.location}
                                        </div>
                                        {event.note && (
                                            <div style={{ fontSize: '0.85rem', color: '#5f6368', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                                "{event.note}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#9aa0a6' }}>
                            <Package size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '1.1rem' }}>Search for a Product ID to view its complete journey</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerTrack;
