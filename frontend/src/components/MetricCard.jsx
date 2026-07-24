import React from 'react';

export default function MetricCard({ title, amount, icon: Icon, color, subtitle, badge }) {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>{title}</span>
        {Icon && (
          <div style={{
            background: `${color}20`,
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} color={color} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
        ₹{amount?.toLocaleString('en-IN') || '0'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtitle && <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{subtitle}</span>}
        {badge && <span className={`badge badge-${badge.type}`}>{badge.text}</span>}
      </div>
    </div>
  );
}
