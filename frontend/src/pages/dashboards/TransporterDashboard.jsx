import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, Map, PackageCheck, Package, Navigation, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import TrustScoreBadge from '../../components/TrustScoreBadge';

const TransporterDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [updateStatusVal, setUpdateStatusVal] = useState('');
    const [updateLocation, setUpdateLocation] = useState('');
    const [updateNote, setUpdateNote] = useState('');

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

    const getNextStatus = (currentStatus) => {
        if (currentStatus === 'Assigned (Farm to Warehouse)' || currentStatus === 'Assigned (Warehouse to Retailer)') {
            return 'Picked Up';
        }
        if (currentStatus === 'Picked Up') {
            return 'In Transit';
        }
        if (currentStatus === 'In Transit') {
            // Check previous assignment to determine final destination
            const assignedEvents = selectedBatch?.timeline.filter(e => e.status.includes('Assigned'));
            if (assignedEvents && assignedEvents.length > 0) {
                const lastAssignment = assignedEvents[assignedEvents.length - 1];
                if (lastAssignment.status === 'Assigned (Farm to Warehouse)') return 'Delivered to Warehouse';
                if (lastAssignment.status === 'Assigned (Warehouse to Retailer)') return 'Delivered to Retailer';
            }
            return 'Delivered'; // Fallback
        }
        return null;
    };

    // Map the generic "Delivered" UI label to the correct backend status
    const resolveActualStatus = (displayStatus, batch) => {
        if (displayStatus !== 'Delivered') return displayStatus;
        // Determine destination from the batch timeline assignment history
        const assignedEvents = batch?.timeline?.filter(e => e.status.includes('Assigned')) || [];
        if (assignedEvents.length > 0) {
            const lastAssignment = assignedEvents[assignedEvents.length - 1].status;
            if (lastAssignment === 'Assigned (Farm to Warehouse)') return 'Delivered to Warehouse';
            if (lastAssignment === 'Assigned (Warehouse to Retailer)') return 'Delivered to Retailer';
        }
        return 'Delivered to Warehouse'; // fallback
    };

    const handleUpdateSubmit = async () => {
        if (!selectedBatch || !updateStatusVal) return;

        const actualStatus = resolveActualStatus(updateStatusVal, selectedBatch);

        try {
            await axios.put(`http://localhost:5000/api/batches/${selectedBatch._id}/status`, {
                status: actualStatus,
                location: updateLocation || 'Transporter update',
                note: updateNote || `Status updated to ${actualStatus}`
            });
            setSelectedBatch(null);
            setUpdateStatusVal('');
            setUpdateLocation('');
            setUpdateNote('');
            fetchBatches();
        } catch (err) {
            alert('Update failed');
        }
    };

    const getStatusIcon = (status) => {
        if (status.includes('Assigned')) return <Package size={20} color="#f57c00" />;
        if (status === 'Picked Up') return <Truck size={20} color="#1976d2" />;
        if (status === 'In Transit') return <Navigation size={20} color="#388e3c" />;
        return <PackageCheck size={20} color="#757575" />;
    };

    // Filter out already delivered batches from main view
    const activeBatches = batches.filter(b => !b.status.includes('Delivered to'));

    return (
        <>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Active Deliveries</h1>
                    <p style={{ color: '#5f6368' }}>Click a batch to update its delivery status in real-time</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {activeBatches.map((batch) => (
                        <motion.div
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            key={batch._id}
                            onClick={() => setSelectedBatch(batch)}
                            className="glass-card"
                            style={{ padding: '1.5rem', background: 'white', cursor: 'pointer', border: '2px solid transparent', transition: 'border 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.border = '2px solid #2e7d32'}
                            onMouseLeave={(e) => e.currentTarget.style.border = '2px solid transparent'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#9aa0a6', fontWeight: 'bold' }}>#{batch.batchId}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrustScoreBadge score={batch.trustScore} log={batch.trustScoreLog} compact />
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        background: '#f8f9fa',
                                        color: '#5f6368'
                                    }}>
                                        {getStatusIcon(batch.status)}
                                        {batch.status}
                                    </span>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{batch.productName} ({batch.quantity} units)</h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5f6368', marginBottom: '0.5rem' }}>
                                    <MapPin size={16} />
                                    <span>Last Location: {batch.timeline[batch.timeline.length - 1].location}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#5f6368' }}>
                                    <Map size={16} />
                                    <span>Route: {batch.status.includes('Warehouse to Retailer') ? 'Warehouse ➔ Retailer' : 'Farm ➔ Warehouse'}</span>
                                </div>
                            </div>

                            <div style={{
                                textAlign: 'center',
                                padding: '0.8rem',
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                Tap to Update Status
                            </div>
                        </motion.div>
                    ))}
                    {activeBatches.length === 0 && !loading && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#5f6368', gridColumn: '1 / -1' }}>
                            <Truck size={48} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.5 }} />
                            You have no active deliveries assigned at the moment.
                        </div>
                    )}
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
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Update Shipment: #{selectedBatch.batchId}</h3>

                        <div style={{ marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#5f6368', marginBottom: '0.3rem' }}>Current Status</div>
                            <div style={{ fontWeight: 'bold', color: '#1976d2' }}>{selectedBatch.status}</div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select New Status</label>
                            <select
                                value={updateStatusVal}
                                onChange={(e) => setUpdateStatusVal(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                required
                            >
                                <option value="">-- Choose Status --</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Current Geographic Location</label>
                            <input
                                type="text"
                                placeholder="e.g., Highway 41, Near Metro City"
                                value={updateLocation}
                                onChange={(e) => setUpdateLocation(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Delivery Notes (Optional)</label>
                            <textarea
                                placeholder="Any condition or delay notes..."
                                value={updateNote}
                                onChange={(e) => setUpdateNote(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => {
                                setSelectedBatch(null);
                                setUpdateStatusVal('');
                                setUpdateLocation('');
                                setUpdateNote('');
                            }} className="btn" style={{ flex: 1, border: '1px solid #ddd' }}>Cancel</button>
                            <button
                                onClick={handleUpdateSubmit}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                disabled={!updateLocation || !updateStatusVal}
                            >
                                Submit Update
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default TransporterDashboard;
