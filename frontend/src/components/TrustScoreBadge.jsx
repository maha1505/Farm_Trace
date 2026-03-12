import React, { useState } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * TrustScoreBadge – reusable component for displaying a batch's Trust Score.
 * Props:
 *   score       {number}  0-100
 *   log         {Array}   [{reason, deduction}]  – deduction history
 *   compact     {boolean} – smaller pill variant (default: false)
 */
const TrustScoreBadge = ({ score = 100, log = [], compact = false }) => {
    const [expanded, setExpanded] = useState(false);

    // Color thresholds
    const color = score >= 75 ? '#2e7d32' : score >= 50 ? '#f57c00' : '#d32f2f';
    const bg    = score >= 75 ? '#e8f5e9' : score >= 50 ? '#fff3e0' : '#ffebee';
    const label = score >= 75 ? 'Trusted' : score >= 50 ? 'Moderate' : 'At Risk';

    if (compact) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '20px',
                background: bg,
                color,
                fontWeight: 'bold',
                fontSize: '0.78rem',
                flexShrink: 0
            }}>
                <Shield size={13} />
                <span>{score}</span>
            </div>
        );
    }

    return (
        <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: '12px', padding: '0.8rem 1rem' }}>
            {/* Score Header Row */}
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: log.length > 0 ? 'pointer' : 'default' }}
                onClick={() => log.length > 0 && setExpanded(v => !v)}
            >
                <span style={{ fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', color: '#5f6368' }}>
                    <Shield size={15} color={color} />
                    Trust Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color }}>{score}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '500', color, background: `${color}15`, padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
                        {label}
                    </span>
                    {log.length > 0 && (expanded ? <ChevronUp size={14} color="#9aa0a6" /> : <ChevronDown size={14} color="#9aa0a6" />)}
                </div>
            </div>

            {/* Score Progress Bar */}
            <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', margin: '0.5rem 0 0' }}>
                <div style={{ height: '100%', width: `${score}%`, background: color, transition: 'width 1s ease-in-out', borderRadius: '3px' }} />
            </div>

            {/* Deduction Log – collapsible */}
            {expanded && log.length > 0 && (
                <div style={{ marginTop: '0.7rem', paddingTop: '0.6rem', borderTop: `1px dashed ${color}40` }}>
                    <p style={{ fontSize: '0.72rem', color: '#9aa0a6', margin: '0 0 0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Deductions Applied
                    </p>
                    {log.map((entry, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.76rem', color: '#5f6368', display: 'flex', gap: '5px' }}>
                                <AlertTriangle size={12} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
                                {entry.reason}
                            </span>
                            <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color, flexShrink: 0 }}>
                                −{entry.deduction}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrustScoreBadge;
