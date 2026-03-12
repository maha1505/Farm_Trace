import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, CheckCircle, History, Info, Leaf, Package, Clock, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const freshnessPercent = (batch) => {
    const elapsed = (Date.now() - new Date(batch.harvestTimestamp)) / 3600000;
    return Math.max(0, Math.min(100, 100 - (elapsed / batch.shelfLife) * 100));
};

const freshnessColor = (fp) => fp < 20 ? '#d32f2f' : fp < 50 ? '#ffa000' : '#2e7d32';
const freshnessLabel = (fp) => fp < 20 ? 'Critical' : fp < 50 ? 'Moderate' : 'Good';

const RetailerDelivered = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/batches');
            const delivered = res.data.data.filter(b => b.status === 'Delivered to Retailer');
            setBatches(delivered);
        } catch (err) {
            console.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Receipts</h1>
                <p style={{ color: '#5f6368' }}>Products delivered to your store — click any receipt to view traceability & freshness</p>
            </div>

            {loading ? (
                <p style={{ color: '#9aa0a6' }}>Loading receipts...</p>
            ) : batches.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', background: 'white' }}>
                    <Store size={56} color="#dadce0" style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <h3 style={{ color: '#5f6368' }}>No Receipts Yet</h3>
                    <p style={{ color: '#9aa0a6' }}>Products delivered to your store will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {batches.map(batch => {
                        const fp = freshnessPercent(batch);
                        const color = freshnessColor(fp);
                        const lastEvent = batch.timeline[batch.timeline.length - 1];
                        return (
                            <motion.div
                                key={batch._id}
                                whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                                onClick={() => setSelectedBatch(batch)}
                                className="glass-card"
                                style={{ background: 'white', padding: '1.5rem', cursor: 'pointer', borderLeft: `4px solid ${color}` }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', background: '#e8f5e9', color: '#2e7d32' }}>
                                        {batch.category}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} compact />
                                        <span style={{ fontSize: '0.75rem', color: '#9aa0a6', fontWeight: 'bold' }}>#{batch.batchId}</span>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>{batch.productName}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '1rem' }}>
                                    <Package size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    {batch.quantity} units
                                </p>

                                {/* Freshness Bar */}
                                <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: '10px', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.78rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Leaf size={13} /> Freshness Score
                                        </span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color }}>
                                            {Math.round(fp)}% — {freshnessLabel(fp)}
                                        </span>
                                    </div>
                                    <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${fp}%`, background: color, transition: 'width 1s' }} />
                                    </div>
                                </div>

                                {/* Received date */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9aa0a6' }}>
                                    <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Received: {new Date(lastEvent?.timestamp).toLocaleDateString()}</span>
                                    <span style={{ color: '#1976d2', fontWeight: '500' }}>View Trace →</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Traceability Modal */}
            <AnimatePresence>
                {selectedBatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: '1rem' }}
                        onClick={e => e.target === e.currentTarget && setSelectedBatch(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ background: 'white', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px' }}
                        >
                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontWeight: 'bold', fontSize: '1.4rem', margin: 0 }}>{selectedBatch.productName}</h2>
                                    <p style={{ color: '#9aa0a6', fontSize: '0.82rem', margin: '3px 0 0' }}>Batch #{selectedBatch.batchId}</p>
                                </div>
                                <button onClick={() => setSelectedBatch(null)} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Freshness Score Card */}
                            {(() => {
                                const fp = freshnessPercent(selectedBatch);
                                const color = freshnessColor(fp);
                                return (
                                    <div style={{ background: `${color}10`, border: `1px solid ${color}40`, borderRadius: '14px', padding: '1.2rem', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Leaf size={16} color={color} /> Freshness Score
                                            </span>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color }}>{Math.round(fp)}%</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                                            <div style={{ height: '100%', width: `${fp}%`, background: color }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#5f6368' }}>
                                            <span>Status: <strong style={{ color }}>{freshnessLabel(fp)}</strong></span>
                                            <span>Shelf life: {selectedBatch.shelfLife}h · Qty: {selectedBatch.quantity} units</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Trust Score Card */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <TrustScoreBadge score={selectedBatch.trustScore} log={selectedBatch.trustScoreLog} />
                            </div>

                            {/* Supply Chain Timeline */}
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History size={18} color="#1976d2" /> Supply Chain Journey
                            </h3>
                            <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: '#e0e0e0' }} />
                                {selectedBatch.timeline.map((event, idx) => {
                                    const isFirst = idx === 0;
                                    const isLast = idx === selectedBatch.timeline.length - 1;
                                    const dotColor = isFirst ? '#2e7d32' : isLast ? '#e91e63' : '#1976d2';
                                    return (
                                        <div key={idx} style={{ position: 'relative', marginBottom: '1.2rem' }}>
                                            <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: dotColor, border: '2px solid white', boxShadow: '0 0 0 2px #e0e0e0' }} />
                                            <div style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>{event.status}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
                                                {new Date(event.timestamp).toLocaleString()} · {event.location}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>By: {event.responsibleRole}</div>
                                            {event.note && (
                                                <div style={{ fontSize: '0.76rem', color: '#5f6368', background: '#f5f5f5', padding: '0.4rem 0.6rem', borderRadius: '6px', marginTop: '0.3rem', fontStyle: 'italic' }}>
                                                    "{event.note}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RetailerDelivered;
