import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Package, Clock, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const FarmerDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Registration form state
    const [formData, setFormData] = useState({
        productName: '',
        category: 'Fruits',
        quantity: '',
        harvestTimestamp: new Date().toISOString().slice(0, 16),
        shelfLife: ''
    });

    const [predefinedProducts, setPredefinedProducts] = useState({
        Fruits: ['Apple', 'Banana', 'Mango', 'Grapes', 'Orange'],
        Vegetables: ['Tomato', 'Potato', 'Spinach', 'Carrot', 'Onion']
    });

    const shelfLifeMapping = {
        'Apple': 168, 'Banana': 72, 'Mango': 120, 'Grapes': 144, 'Orange': 168,
        'Tomato': 96, 'Potato': 720, 'Spinach': 48, 'Carrot': 240, 'Onion': 720
    };

    const [isManual, setIsManual] = useState(false);

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

    const handleRegister = async (e) => {
        // ... (rest remains the same)
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/batches', formData);
            setShowModal(false);
            setIsManual(false); // Reset manual mode
            fetchBatches();
            // Reset form
            setFormData({
                productName: '',
                category: 'Fruits',
                quantity: '',
                harvestTimestamp: new Date().toISOString().slice(0, 16),
                shelfLife: ''
            });
        } catch (err) {
            alert('Registration failed');
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card"
            style={{ padding: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
            <div style={{ background: `${color}15`, padding: '1rem', borderRadius: '12px' }}>
                <Icon color={color} size={24} />
            </div>
            <div>
                <p style={{ fontSize: '0.8rem', color: '#5f6368', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{value}</p>
            </div>
        </motion.div>
    );

    return (
        <>
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Product Batches</h1>
                        <p style={{ color: '#5f6368' }}>Manage and track your harvested products</p>
                    </div>
                    <button onClick={() => {
                        setIsManual(false);
                        setFormData({
                            productName: '',
                            category: 'Fruits',
                            quantity: '',
                            harvestTimestamp: new Date().toISOString().slice(0, 16),
                            shelfLife: ''
                        });
                        setShowModal(true);
                    }} className="btn btn-primary">
                        <Plus size={20} />
                        <span>Register New Batch</span>
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <StatCard icon={Package} label="Total Batches" value={batches.length} color="#2e7d32" />
                    <StatCard icon={TrendingUp} label="Ready to Ship" value={batches.filter(b => b.status === 'Ready for Supply Chain').length} color="#1976d2" />
                    <StatCard icon={AlertCircle} label="High Priority" value={batches.filter(b => b.priority === 'High').length} color="#d32f2f" />
                </div>

                {loading ? (
                    <p>Loading batches...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {batches.map((batch) => (
                            <motion.div
                                whileHover={{ y: -5 }}
                                key={batch._id}
                                className="glass-card"
                                style={{ padding: '1.5rem', background: 'white' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: batch.category === 'Fruits' ? '#e3f2fd' : '#e8f5e9',
                                        color: batch.category === 'Fruits' ? '#1976d2' : '#2e7d32'
                                    }}>
                                        {batch.category}
                                    </span>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
                                        background: '#333',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {batch.batchId}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{batch.productName}</h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#5f6368', fontSize: '0.9rem' }}>
                                    <Package size={16} />
                                    <span>{batch.quantity} Units</span>
                                </div>

                                {/* Freshness + Trust Score Panel */}
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#5f6368' }}>Freshness Status</span>
                                        <span className={`priority-${batch.priority.toLowerCase()}`} style={{ fontSize: '0.8rem' }}>
                                            {batch.priority} Priority
                                        </span>
                                    </div>
                                    <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                                        {(() => {
                                            const harvestDate = new Date(batch.harvestTimestamp);
                                            const now = new Date();
                                            const elapsedHours = (now - harvestDate) / (1000 * 60 * 60);
                                            const freshnessPercent = Math.max(0, 100 - ((elapsedHours / batch.shelfLife) * 100));

                                            let barColor = freshnessPercent < 20 ? '#d32f2f' : freshnessPercent < 50 ? '#ffa000' : '#388e3c';

                                            return (
                                                <div style={{
                                                    height: '100%',
                                                    width: `${freshnessPercent}%`,
                                                    background: barColor,
                                                    transition: 'width 1s ease-in-out'
                                                }}></div>
                                            );
                                        })()}
                                    </div>
                                    {/* Trust Score */}
                                    <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5f6368', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                                    <Clock size={14} />
                                    <span>Harvested: {new Date(batch.harvestTimestamp).toLocaleDateString()}</span>
                                </div>

                                {/* Current Status Badge */}
                                {(() => {
                                    const s = batch.status;
                                    let bg, color, handler;
                                    if (s === 'Ready for Supply Chain') { bg = '#e8f5e9'; color = '#2e7d32'; handler = 'At Farm (Awaiting Pickup)'; }
                                    else if (s === 'Assigned (Farm to Warehouse)') { bg = '#e3f2fd'; color = '#1976d2'; handler = 'Warehouse Manager Scheduled'; }
                                    else if (s === 'Picked Up') { bg = '#fff8e1'; color = '#f57c00'; handler = 'Transporter — Picked Up'; }
                                    else if (s === 'In Transit') { bg = '#f3e5f5'; color = '#7b1fa2'; handler = 'Transporter — In Transit'; }
                                    else if (s === 'Delivered to Warehouse') { bg = '#e0f7fa'; color = '#0097a7'; handler = 'Stored in Warehouse'; }
                                    else if (s === 'Assigned (Warehouse to Retailer)') { bg = '#fce4ec'; color = '#c2185b'; handler = 'Warehouse → Retailer Scheduled'; }
                                    else if (s === 'Delivered to Retailer') { bg = '#e8f5e9'; color = '#388e3c'; handler = 'Delivered to Retailer'; }
                                    else { bg = '#f5f5f5'; color = '#757575'; handler = s; }
                                    return (
                                        <div style={{ background: bg, borderRadius: '10px', padding: '0.6rem 0.8rem', border: `1px solid ${color}30` }}>
                                            <div style={{ fontSize: '0.7rem', color: '#9aa0a6', marginBottom: '2px' }}>Current Status</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color }}>{handler}</div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-card"
                        style={{ background: 'white', padding: '2.5rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Register New Batch</h2>
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Category</label>
                                <select
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Fruits">Fruits</option>
                                    <option value="Vegetables">Vegetables</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Product Name</label>
                                {!isManual ? (
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            value={formData.productName}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    setIsManual(true);
                                                    setFormData({ ...formData, productName: '', shelfLife: '' });
                                                } else {
                                                    const selectedProduct = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        productName: selectedProduct,
                                                        shelfLife: shelfLifeMapping[selectedProduct] || 48
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">Select Product</option>
                                            {predefinedProducts[formData.category].map(p => <option key={p} value={p}>{p}</option>)}
                                            <option value="Other">Other (Enter Manually)</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            value={formData.productName}
                                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsManual(false);
                                                setFormData({ ...formData, productName: '', shelfLife: '' });
                                            }}
                                            style={{ padding: '0 0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
                                        >
                                            Back
                                        </button>
                                    </div>
                                )}
                                {formData.productName && !isManual && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e8f5e9', padding: '0.5rem', borderRadius: '6px' }}>
                                        <Clock size={14} />
                                        <span>Initial Freshness Score: <strong>{formData.shelfLife} Hours</strong></span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Shelf Life (Hours)</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        value={formData.shelfLife}
                                        onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label>Harvest Date & Time</label>
                                <input
                                    type="datetime-local"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    value={formData.harvestTimestamp}
                                    onChange={(e) => setFormData({ ...formData, harvestTimestamp: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default FarmerDashboard;
