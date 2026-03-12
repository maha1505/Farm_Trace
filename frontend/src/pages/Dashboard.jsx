import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Truck,
    Warehouse,
    Store,
    LogOut,
    User as UserIcon,
    Search,
    History
} from 'lucide-react';
import FarmerDashboard from './dashboards/FarmerDashboard';
import FarmerTrack from './dashboards/FarmerTrack';
import WarehouseHome from './dashboards/WarehouseHome';
import WarehouseAvailable from './dashboards/WarehouseAvailable';
import WarehouseInventory from './dashboards/WarehouseInventory';
import TransporterDashboard from './dashboards/TransporterDashboard';
import TransporterDelivered from './dashboards/TransporterDelivered';
import RetailerAvailable from './dashboards/RetailerAvailable';
import RetailerDelivered from './dashboards/RetailerDelivered';
import Overview from './dashboards/Overview';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.8rem 1.2rem',
            color: '#5f6368',
            textDecoration: 'none',
            borderRadius: '8px',
            margin: '0.2rem 0',
            transition: 'all 0.2s'
        }} className="nav-item">
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f6' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'white',
                borderRight: '1px solid #e0e0e0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#2e7d32', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1b5e20' }}>FarmTrace</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginLeft: '1rem' }}>Menu</p>
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Overview" />

                    {user.role === 'Farmer' && (
                        <>
                            <NavItem to="/dashboard/register" icon={Package} label="Register Batch" />
                            <NavItem to="/dashboard/track" icon={Search} label="Track Product" />
                        </>
                    )}
                    {user.role === 'Warehouse Manager' && (
                        <>
                            <NavItem to="/dashboard/available-farm" icon={Package} label="Available Farm" />
                            <NavItem to="/dashboard/inventory" icon={Warehouse} label="Inventory" />
                        </>
                    )}
                    {user.role === 'Transporter' && (
                        <>
                            <NavItem to="/dashboard/tasks" icon={Truck} label="Deliveries" />
                            <NavItem to="/dashboard/transporter-history" icon={History} label="Delivery History" />
                        </>
                    )}
                    {user.role === 'Retailer' && (
                        <>
                            <NavItem to="/dashboard/available-warehouse" icon={Package} label="Available Warehouse" />
                            <NavItem to="/dashboard/history" icon={Store} label="Receipts" />
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <div style={{ background: '#e8f5e9', padding: '0.5rem', borderRadius: '50%' }}>
                            <UserIcon size={20} color="#2e7d32" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#5f6368', margin: 0 }}>{user.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: '#d32f2f' }}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9aa0a6' }} size={16} />
                            <input type="text" placeholder="Search batch..." style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '20px', border: '1px solid #dadce0', outline: 'none', background: 'white' }} />
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={user.role === 'Warehouse Manager' ? <WarehouseHome /> : <Overview />} />
                    <Route path="/register" element={<FarmerDashboard />} />
                    <Route path="/track" element={<FarmerTrack />} />
                    <Route path="/available-farm" element={<WarehouseAvailable />} />
                    <Route path="/inventory" element={<WarehouseInventory />} />
                    <Route path="/tasks" element={<TransporterDashboard />} />
                    <Route path="/transporter-history" element={<TransporterDelivered />} />
                    <Route path="/available-warehouse" element={<RetailerAvailable />} />
                    <Route path="/history" element={<RetailerDelivered />} />
                </Routes>
            </main>
        </div>
    );
};

export default Dashboard;
