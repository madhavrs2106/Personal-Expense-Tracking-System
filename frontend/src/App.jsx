import React, { useContext } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AIFinancialHubPage from './pages/AIFinancialHubPage';
import AuthPage from './pages/AuthPage';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const { user, loading, currentPage } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        Loading Session...
      </div>
    );
  }

  // Render correct page view dynamically based on custom currentPage context state
  const renderPage = () => {
    if (!user) {
      return <AuthPage />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'ai-hub':
        return <AIFinancialHubPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div>
      <Navbar />
      {renderPage()}
    </div>
  );
}
