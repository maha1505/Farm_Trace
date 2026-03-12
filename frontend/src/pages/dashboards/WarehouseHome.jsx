import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Clock, AlertCircle, Package, Warehouse, CheckCircle, BarChart2, Leaf, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const freshnessPercent = (batch) => {
    const elapsed = (Date.now() - new Date(batch.harvestTimestamp)) / 3600000;
    return Math.max(0, Math.min(100, 100 - (elapsed / batch.shelfLife) * 100));
};

const statusDotColor = (status) => {
    if (status === 'Assigned (Farm to Warehouse)') return '#1976d2';
    if (status === 'Picked Up') return '#f57c00';
    if (status === 'In Transit') return '#7b1fa2';
    return '#1976d2';
};

const WarehouseHome = () => {
    const [allBatches, setAllBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHistory, setSelectedHistory] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/batches');
            setAllBatches(res.data.data);
        } catch (err) {
            console.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    // Derived data slices
    const incomingBatches = allBatches.filter(b => {
        if (b.status === 'Assigned (Farm to Warehouse)') return true;
        if (b.status === 'Picked Up' || b.status === 'In Transit') {
            const assigned = b.timeline?.filter(e => e.status.includes('Assigned')) || [];
            return assigned.length > 0 && assigned[assigned.length - 1].status === 'Assigned (Farm to Warehouse)';
        }
        return false;
    });
    const inStock = allBatches.filter(b => b.status === 'Delivered to Warehouse' || b.status === 'Assigned (Warehouse to Retailer)');
    const dispatched = allBatches.filter(b => b.status === 'Delivered to Retailer');
    const atRisk = inStock.filter(b => freshnessPercent(b) < 50);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Warehouse Overview</h1>
                <p style={{ color: '#5f6368' }}>Monitor incoming shipments, stock health, and dispatch activity</p>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                {[
                    { icon: Truck, label: 'Incoming', value: incomingBatches.length, color: '#1976d2', sub: 'En route from farms' },
                    { icon: Warehouse, label: 'In Stock', value: inStock.length, color: '#2e7d32', sub: 'Currently in warehouse' },
                    { icon: CheckCircle, label: 'Dispatched', value: dispatched.length, color: '#7b1fa2', sub: 'Delivered to retailers' },
                    { icon: AlertCircle, label: 'Freshness Alerts', value: atRisk.length, color: '#d32f2f', sub: 'Items below 50% fresh' },
                ].map(({ icon: Icon, label, value, color, sub }) => (
                    <motion.div key={label} whileHover={{ y: -4 }} className="glass-card"
                        style={{ padding: '1.2rem', background: 'white', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ background: `${color}15`, padding: '0.8rem', borderRadius: '12px', flexShrink: 0 }}>
                            <Icon color={color} size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#9aa0a6', margin: 0 }}>{label}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '2px 0 0', lineHeight: 1 }}>{value}</p>
                            <p style={{ fontSize: '0.68rem', color: '#9aa0a6', margin: '3px 0 0' }}>{sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Pending Arrivals */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={18} color="#1976d2" /> Pending Arrivals
                    </h2>
                    {loading ? (
                        <p style={{ color: '#9aa0a6' }}>Loading...</p>
                    ) : incomingBatches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9aa0a6' }}>
                            <Truck size={40} style={{ opacity: 0.4, margin: '0 auto 0.5rem', display: 'block' }} />
                            <p>No pending arrivals.</p>
                            <p style={{ fontSize: '0.8rem' }}>Go to "Available Farm" to schedule pickups.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {incomingBatches.map(batch => (
                                <motion.div
                                    key={batch._id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => setSelectedHistory(batch)}
                                    style={{ padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #e3f2fd', borderLeft: `4px solid ${statusDotColor(batch.status)}`, cursor: 'pointer', background: '#fafafa' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.92rem' }}>{batch.productName}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} compact />
                                            <span style={{ fontSize: '0.7rem', background: `${statusDotColor(batch.status)}20`, color: statusDotColor(batch.status), padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                                                {batch.status === 'Assigned (Farm to Warehouse)' ? 'Scheduled' : batch.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>#{batch.batchId} · {batch.quantity} units</span>
                                        <span style={{ color: '#1976d2' }}>Click to trace →</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stock Freshness Monitor */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Leaf size={18} color="#2e7d32" /> Stock Freshness Monitor
                    </h2>
                    {inStock.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9aa0a6' }}>
                            <Package size={40} style={{ opacity: 0.4, margin: '0 auto 0.5rem', display: 'block' }} />
                            <p>No products in stock.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {inStock.map(batch => {
                                const fp = freshnessPercent(batch);
                                const color = fp < 20 ? '#d32f2f' : fp < 50 ? '#ffa000' : '#2e7d32';
                                return (
                                    <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#fafafa', border: `1px solid ${color}25` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>{batch.productName}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} compact />
                                                <span style={{ fontSize: '0.78rem', color, fontWeight: 'bold' }}>{Math.round(fp)}% fresh</span>
                                            </div>
                                        </div>
                                        <div style={{ height: '7px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                                            <div style={{ height: '100%', width: `${fp}%`, background: color, transition: 'width 1s' }} />
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#9aa0a6' }}>
                                            {batch.quantity} units · {batch.status === 'Assigned (Warehouse to Retailer)' ? '📤 Dispatching to Retailer' : '📦 In Stock'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Category Breakdown */}
            {allBatches.length > 0 && (
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={18} color="#7b1fa2" /> Category Distribution
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                        {Object.entries(allBatches.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + 1; return acc; }, {})).map(([cat, count]) => (
                            <div key={cat} style={{ padding: '0.8rem 1rem', background: '#f8f9fa', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{cat}</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#7b1fa2' }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Traceability Modal */}
            <AnimatePresence>
                {selectedHistory && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)', padding: '1rem' }}
                        onClick={e => e.target === e.currentTarget && setSelectedHistory(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="glass-card"
                            style={{ background: 'white', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>Product Traceability</h2>
                                    <p style={{ color: '#9aa0a6', fontSize: '0.82rem', margin: '3px 0 0' }}>{selectedHistory.productName} · #{selectedHistory.batchId}</p>
                                </div>
                                <button onClick={() => setSelectedHistory(null)} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                                <div><p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0 0 2px' }}>Quantity</p><p style={{ fontWeight: 'bold', margin: 0 }}>{selectedHistory.quantity} units</p></div>
                                <div><p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0 0 2px' }}>Category</p><p style={{ fontWeight: 'bold', margin: 0 }}>{selectedHistory.category}</p></div>
                                <div><p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0 0 2px' }}>Current Status</p><p style={{ fontWeight: 'bold', margin: 0, color: '#1976d2', fontSize: '0.85rem' }}>{selectedHistory.status}</p></div>
                            </div>

                            <div style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: '#e0e0e0' }} />
                                {selectedHistory.timeline.map((event, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '1.2rem' }}>
                                        <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: idx === 0 ? '#2e7d32' : idx === selectedHistory.timeline.length - 1 ? '#e91e63' : '#1976d2', border: '2px solid white', boxShadow: '0 0 0 2px #e0e0e0' }} />
                                        <div style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>{event.status}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>{new Date(event.timestamp).toLocaleString()} · {event.location}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#5f6368' }}>By: {event.responsibleRole}</div>
                                        {event.note && <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#5f6368', background: '#f5f5f5', padding: '0.3rem 0.6rem', borderRadius: '6px', marginTop: '0.2rem' }}>"{event.note}"</div>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WarehouseHome;
