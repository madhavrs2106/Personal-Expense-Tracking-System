import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Receipt, Cpu, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme, currentPage, navigateTo } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (page) => currentPage === page;

  const handleNavClick = (page) => {
    setMobileMenuOpen(false);
    navigateTo(page);
  };

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        {/* Brand Logo with Custom Uploaded Logo Image */}
        <div onClick={() => handleNavClick(user ? 'dashboard' : 'auth')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer' }}>
          <img 
            src="/logo.png" 
            alt="PETS Logo" 
            style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h2 className="brand-font" style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1', color: 'var(--text-main)' }}>PETS</h2>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Expense Tracker</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
            <button 
              onClick={() => handleNavClick('dashboard')} 
              className="btn-secondary" 
              style={{
                background: isActive('dashboard') ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                color: isActive('dashboard') ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: isActive('dashboard') ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent'
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => handleNavClick('transactions')} 
              className="btn-secondary" 
              style={{
                background: isActive('transactions') ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                color: isActive('transactions') ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: isActive('transactions') ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent'
              }}
            >
              <Receipt size={18} />
              <span>Transactions</span>
            </button>

            <button 
              onClick={() => handleNavClick('ai-hub')} 
              className="btn-secondary" 
              style={{
                background: isActive('ai-hub') ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                color: isActive('ai-hub') ? 'var(--accent-primary)' : 'var(--text-muted)',
                border: isActive('ai-hub') ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent'
              }}
            >
              <Cpu size={18} />
              <span>Smart Hub</span>
            </button>
          </div>
        )}

        {/* Right Action Icons & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '8px 10px', borderRadius: '50%' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#0ea5e9" />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right', display: 'none' }} className="user-profile-label">
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{user.full_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
              <button onClick={logout} className="btn-danger" title="Logout">
                <LogOut size={16} />
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-secondary mobile-toggle-btn"
                style={{ padding: '8px' }}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          ) : (
            <button onClick={() => navigateTo('auth')} className="btn-primary">Sign In</button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }} className="mobile-drawer">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavClick('transactions')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Receipt size={18} />
            <span>Transactions</span>
          </button>
          <button
            onClick={() => handleNavClick('ai-hub')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Cpu size={18} />
            <span>AI Insights</span>
          </button>
        </div>
      )}

      {/* Responsive Navbar Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle-btn { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-toggle-btn { display: none !important; }
          .mobile-drawer { display: none !important; }
          .user-profile-label { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
