import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock } from 'lucide-react';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const WarehouseInventory = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/batches');
            const inventoryBatches = res.data.data.filter(b => 
                b.status === 'Delivered to Warehouse' || b.status === 'Assigned (Warehouse to Retailer)'
            );
            setBatches(inventoryBatches);
        } catch (err) {
            console.error('Error fetching inventory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Current Inventory</h1>
                <p style={{ color: '#5f6368' }}>Products currently stored in your warehouse facilities</p>
            </div>

            {loading ? (
                <p>Loading inventory...</p>
            ) : batches.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', background: 'white' }}>
                    <Package size={48} color="#dadce0" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#5f6368' }}>Inventory is Empty</h3>
                    <p style={{ color: '#9aa0a6' }}>No products are currently in your warehouse. Check Available Products to schedule pickups from farmers.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {batches.map((batch) => (
                        <div key={batch._id} className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
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
                                <span style={{ fontSize: '0.8rem', color: '#9aa0a6', fontWeight: 'bold' }}>#{batch.batchId}</span>
                            </div>

                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{batch.productName}</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#5f6368', fontSize: '0.9rem' }}>
                                <Package size={16} />
                                <span>{batch.quantity} Units</span>
                            </div>

                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#5f6368' }}>Freshness Status</span>
                                    <span className={`priority-${batch.priority.toLowerCase()}`} style={{ fontSize: '0.8rem' }}>
                                        {batch.priority} Priority
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (batch.remainingShelfLife / batch.shelfLife) * 100)}%`,
                                        background: batch.priority === 'High' ? '#d32f2f' : batch.priority === 'Medium' ? '#ffa000' : '#388e3c'
                                    }}></div>
                                </div>
                                {/* Trust Score */}
                                <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5f6368', fontSize: '0.8rem' }}>
                                <Clock size={14} />
                                <span>Harvested: {new Date(batch.harvestTimestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WarehouseInventory;
