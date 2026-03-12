import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Package, Truck, Warehouse, Store, AlertTriangle,
    CheckCircle, Clock, TrendingUp, Activity, ArrowRight,
    Leaf, BarChart2, ShoppingBag, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─────────── Shared helpers ─────────── */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <motion.div whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        className="glass-card"
        style={{ padding: '1.5rem', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: `${color}18`, padding: '1rem', borderRadius: '14px', flexShrink: 0 }}>
            <Icon color={color} size={26} />
        </div>
        <div>
            <p style={{ fontSize: '0.78rem', color: '#9aa0a6', margin: 0 }}>{label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '2px 0 0', lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '4px 0 0' }}>{sub}</p>}
        </div>
    </motion.div>
);

const TimelineItem = ({ status, time, note, isLast }) => (
    <div style={{ display: 'flex', gap: '1rem', paddingBottom: isLast ? 0 : '1.2rem', position: 'relative' }}>
        {!isLast && <div style={{ position: 'absolute', left: '9px', top: '22px', bottom: 0, width: '2px', background: '#e0e0e0' }} />}
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isLast ? '#2e7d32' : '#1976d2', border: '3px solid white', boxShadow: '0 0 0 2px #e0e0e0', flexShrink: 0, marginTop: '2px' }} />
        <div>
            <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>{status}</p>
            <p style={{ fontSize: '0.78rem', color: '#9aa0a6', margin: '2px 0' }}>{new Date(time).toLocaleString()}</p>
            {note && <p style={{ fontSize: '0.78rem', color: '#5f6368', fontStyle: 'italic', margin: 0 }}>"{note}"</p>}
        </div>
    </div>
);

const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {children}
    </h2>
);

const freshnessPercent = (batch) => {
    const elapsed = (Date.now() - new Date(batch.harvestTimestamp)) / 3600000;
    return Math.max(0, 100 - (elapsed / batch.shelfLife) * 100);
};

/* ─────────── Farmer Overview ─────────── */
const FarmerOverview = ({ batches }) => {
    const ready = batches.filter(b => b.status === 'Ready for Supply Chain');
    const inTransit = batches.filter(b => b.status === 'Picked Up' || b.status === 'In Transit');
    const delivered = batches.filter(b => b.status.includes('Delivered'));
    const atRisk = batches.filter(b => {
        const fp = freshnessPercent(b);
        return fp < 50 && b.status !== 'Delivered to Retailer';
    });

    const statusColors = {
        'Ready for Supply Chain': '#2e7d32',
        'Assigned (Farm to Warehouse)': '#1976d2',
        'Picked Up': '#f57c00',
        'In Transit': '#7b1fa2',
        'Delivered to Warehouse': '#0097a7',
        'Delivered to Retailer': '#388e3c',
    };

    return (
        <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                <StatCard icon={Package} label="Total Registered" value={batches.length} color="#2e7d32" sub="All your batches" />
                <StatCard icon={Leaf} label="Ready to Ship" value={ready.length} color="#1976d2" sub="Awaiting warehouse pickup" />
                <StatCard icon={Truck} label="In Transit" value={inTransit.length} color="#f57c00" sub="Being transported now" />
                <StatCard icon={AlertTriangle} label="Freshness Alerts" value={atRisk.length} color="#d32f2f" sub="Products below 50% fresh" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Freshness Alerts */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><AlertTriangle size={18} color="#d32f2f" /> Freshness Risk Monitor</SectionTitle>
                    {atRisk.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9aa0a6' }}>
                            <CheckCircle size={40} color="#2e7d32" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                            <p>All products are in good freshness!</p>
                        </div>
                    ) : atRisk.sort((a, b) => freshnessPercent(a) - freshnessPercent(b)).map(batch => {
                        const fp = freshnessPercent(batch);
                        const color = fp < 20 ? '#d32f2f' : '#ffa000';
                        return (
                            <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: `${color}0d`, border: `1px solid ${color}30`, marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                    <span style={{ fontSize: '0.75rem', color, fontWeight: 'bold' }}>{Math.round(fp)}% fresh</span>
                                </div>
                                <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${fp}%`, background: color, transition: 'width 1s' }} />
                                </div>
                                <p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0.3rem 0 0' }}>#{batch.batchId} · {batch.status}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Batch Status Breakdown */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><BarChart2 size={18} color="#1976d2" /> Batch Status Breakdown</SectionTitle>
                    {Object.entries(
                        batches.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {})
                    ).map(([status, count]) => (
                        <div key={status} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.82rem', color: '#5f6368' }}>{status}</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>{count}</span>
                            </div>
                            <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(count / batches.length) * 100}%`, background: statusColors[status] || '#757575', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))}
                    {batches.length === 0 && <p style={{ color: '#9aa0a6', textAlign: 'center', padding: '2rem 0' }}>No batches registered yet.</p>}
                </div>
            </div>
        </div>
    );
};

/* ─────────── Warehouse Manager Overview ─────────── */
const WarehouseOverview = ({ batches }) => {
    const incoming = batches.filter(b =>
        b.status === 'Assigned (Farm to Warehouse)' || b.status === 'Picked Up' || b.status === 'In Transit'
    );
    const inStock = batches.filter(b =>
        b.status === 'Delivered to Warehouse' || b.status === 'Assigned (Warehouse to Retailer)'
    );
    const dispatched = batches.filter(b => b.status === 'Delivered to Retailer');
    const atRisk = inStock.filter(b => freshnessPercent(b) < 50);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                <StatCard icon={Truck} label="Incoming Shipments" value={incoming.length} color="#1976d2" sub="En route from farms" />
                <StatCard icon={Warehouse} label="In Stock" value={inStock.length} color="#2e7d32" sub="Currently in your warehouse" />
                <StatCard icon={Store} label="Dispatched to Retailers" value={dispatched.length} color="#7b1fa2" sub="Delivered successfully" />
                <StatCard icon={AlertTriangle} label="Freshness Alerts" value={atRisk.length} color="#d32f2f" sub="Stock items below 50% fresh" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Incoming Shipments */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><Truck size={18} color="#1976d2" /> Incoming Shipments</SectionTitle>
                    {incoming.length === 0 ? (
                        <p style={{ color: '#9aa0a6', textAlign: 'center', padding: '2rem 0' }}>No incoming shipments.</p>
                    ) : incoming.map(batch => (
                        <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#e3f2fd', border: '1px solid #bbdefb', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                <span style={{ fontSize: '0.75rem', background: '#1976d2', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>{batch.status}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.3rem' }}>#{batch.batchId} · {batch.quantity} units</p>
                        </div>
                    ))}
                </div>

                {/* Stock Freshness */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><Leaf size={18} color="#2e7d32" /> Current Stock Freshness</SectionTitle>
                    {inStock.length === 0 ? (
                        <p style={{ color: '#9aa0a6', textAlign: 'center', padding: '2rem 0' }}>Warehouse is empty.</p>
                    ) : inStock.map(batch => {
                        const fp = freshnessPercent(batch);
                        const color = fp < 20 ? '#d32f2f' : fp < 50 ? '#ffa000' : '#2e7d32';
                        return (
                            <div key={batch._id} style={{ marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{batch.productName}</span>
                                    <span style={{ fontSize: '0.78rem', color, fontWeight: 'bold' }}>{Math.round(fp)}%</span>
                                </div>
                                <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${fp}%`, background: color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ─────────── Transporter Overview ─────────── */
const TransporterOverview = ({ batches }) => {
    const active = batches.filter(b => !b.status.includes('Delivered to'));
    const completedWH = batches.filter(b => b.status === 'Delivered to Warehouse');
    const completedRT = batches.filter(b => b.status === 'Delivered to Retailer');
    const recentDeliveries = [...batches].filter(b => b.status.includes('Delivered')).slice(-5).reverse();

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                <StatCard icon={Activity} label="Active Deliveries" value={active.length} color="#f57c00" sub="Pending or in transit" />
                <StatCard icon={Warehouse} label="Delivered to Warehouse" value={completedWH.length} color="#1976d2" sub="Completed farm→warehouse" />
                <StatCard icon={Store} label="Delivered to Retailer" value={completedRT.length} color="#2e7d32" sub="Completed warehouse→retailer" />
                <StatCard icon={TrendingUp} label="Total Deliveries" value={batches.length} color="#7b1fa2" sub="All time" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Active Delivery Status */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><Truck size={18} color="#f57c00" /> Active Deliveries</SectionTitle>
                    {active.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9aa0a6' }}>
                            <CheckCircle size={40} color="#2e7d32" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                            <p>No active deliveries right now.</p>
                        </div>
                    ) : active.map(batch => {
                        const isToWarehouse = batch.timeline?.some(t => t.status === 'Assigned (Farm to Warehouse)');
                        return (
                            <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#fff8e1', border: '1px solid #ffe082', marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                    <span style={{ fontSize: '0.72rem', color: '#f57c00', fontWeight: 'bold' }}>{batch.status}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#5f6368' }}>
                                    <span>Farm</span>
                                    <ArrowRight size={12} />
                                    <span>{isToWarehouse ? 'Warehouse' : 'Retailer'}</span>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0.3rem 0 0' }}>#{batch.batchId} · {batch.quantity} units</p>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Completed */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><CheckCircle size={18} color="#2e7d32" /> Recent Completions</SectionTitle>
                    {recentDeliveries.length === 0 ? (
                        <p style={{ color: '#9aa0a6', textAlign: 'center', padding: '2rem 0' }}>No completed deliveries yet.</p>
                    ) : recentDeliveries.map(batch => (
                        <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#e8f5e9', border: '1px solid #c8e6c9', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 'bold' }}>{batch.status}</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0.3rem 0 0' }}>
                                #{batch.batchId} · Delivered {new Date(batch.timeline[batch.timeline.length - 1]?.timestamp).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─────────── Retailer Overview ─────────── */
const RetailerOverview = ({ batches }) => {
    const available = batches.filter(b => b.status === 'Delivered to Warehouse' || b.status === 'Assigned (Warehouse to Retailer)');
    const inTransit = batches.filter(b => b.status === 'Assigned (Warehouse to Retailer)');
    const received = batches.filter(b => b.status === 'Delivered to Retailer');
    const recentReceipts = [...received].reverse().slice(0, 5);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                <StatCard icon={ShoppingBag} label="Available to Order" value={available.length} color="#1976d2" sub="Products in warehouses" />
                <StatCard icon={Truck} label="On Its Way" value={inTransit.length} color="#f57c00" sub="Assigned & heading to you" />
                <StatCard icon={CheckCircle} label="Total Received" value={received.length} color="#2e7d32" sub="Delivered to you" />
                <StatCard icon={Star} label="Latest Receipt" value={received.length > 0 ? received[received.length - 1].productName : 'None'} color="#7b1fa2" sub="Most recent delivery" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Orders in Transit */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><Truck size={18} color="#f57c00" /> Orders in Transit</SectionTitle>
                    {inTransit.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9aa0a6' }}>
                            <Package size={40} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                            <p>No orders currently in transit.</p>
                        </div>
                    ) : inTransit.map(batch => (
                        <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#fff8e1', border: '1px solid #ffe082', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                <span style={{ fontSize: '0.72rem', color: '#f57c00', fontWeight: 'bold' }}>On the way</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#5f6368', margin: 0 }}>#{batch.batchId} · {batch.quantity} units</p>
                        </div>
                    ))}
                </div>

                {/* Recent Receipts + Timeline */}
                <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
                    <SectionTitle><CheckCircle size={18} color="#2e7d32" /> Recent Receipts</SectionTitle>
                    {recentReceipts.length === 0 ? (
                        <p style={{ color: '#9aa0a6', textAlign: 'center', padding: '2rem 0' }}>No receipts yet.</p>
                    ) : recentReceipts.map(batch => {
                        const lastEvent = batch.timeline[batch.timeline.length - 1];
                        return (
                            <div key={batch._id} style={{ padding: '0.8rem', borderRadius: '10px', background: '#e8f5e9', border: '1px solid #c8e6c9', marginBottom: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{batch.productName}</span>
                                    <span style={{ fontSize: '0.72rem', color: '#9aa0a6' }}>{new Date(lastEvent?.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: '#5f6368', margin: 0 }}>#{batch.batchId} · {batch.quantity} units · {batch.category}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ─────────── Main Overview ─────────── */
const Overview = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/batches');
                setBatches(res.data.data);
            } catch (err) {
                console.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    const greetingColors = {
        'Farmer': ['#1b5e20', '#2e7d32'],
        'Warehouse Manager': ['#0d47a1', '#1565c0'],
        'Transporter': ['#e65100', '#ef6c00'],
        'Retailer': ['#4a148c', '#6a1b9a'],
    };
    const [c1, c2] = greetingColors[user.role] || ['#2e7d32', '#1b5e20'];

    const roleWidget = {
        'Farmer': <FarmerOverview batches={batches} />,
        'Warehouse Manager': <WarehouseOverview batches={batches} />,
        'Transporter': <TransporterOverview batches={batches} />,
        'Retailer': <RetailerOverview batches={batches} />,
    };

    return (
        <div className="fade-in">
            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                    padding: '2rem 2.5rem',
                    borderRadius: '16px',
                    color: 'white',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', right: '80px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name}!
                </h1>
                <p style={{ opacity: 0.85, margin: 0, fontSize: '0.95rem' }}>
                    {user.role} Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </motion.div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9aa0a6' }}>
                    <Activity size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                    <p>Loading your dashboard...</p>
                </div>
            ) : (
                roleWidget[user.role] || <p style={{ color: '#9aa0a6' }}>No dashboard available for your role.</p>
            )}
        </div>
    );
};

export default Overview;
