import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import MetricCard from '../components/MetricCard';
import AddTransactionModal from '../components/AddTransactionModal';
import { AuthContext } from '../context/AuthContext';
import {
  TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Plus, Sparkles,
  PieChart as PieIcon, BarChart3, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anomalies, setAnomalies] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      setSummary(res.data);
      const anomRes = await API.get('/ml/anomalies');
      setAnomalies(anomRes.data.items || []);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <Sparkles size={36} className="gradient-text" style={{ animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading AI Financial Insights...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>
            Welcome back, <span className="gradient-text">{user?.full_name || 'User'}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Here is your financial overview and AI-driven expense insights.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Anomaly Alert Banner if anomalies detected */}
      {anomalies.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div>
              <strong style={{ color: '#ef4444', fontSize: '15px' }}>⚠️ Spending Anomaly Detected</strong>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {anomalies.length} transaction(s) exceed your normal daily spending threshold. Recent: "{anomalies[0].title}" (₹{anomalies[0].amount.toLocaleString()}).
              </div>
            </div>
          </div>
          <a href="/ai-hub" className="btn-secondary" style={{ fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            Review Anomalies <ArrowUpRight size={16} />
          </a>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <MetricCard
          title="Total Income"
          amount={summary?.total_income}
          icon={TrendingUp}
          color="#10b981"
          subtitle="Lifetime recorded income"
          badge={{ text: 'Income', type: 'success' }}
        />
        <MetricCard
          title="Total Expenses"
          amount={summary?.total_expense}
          icon={TrendingDown}
          color="#ef4444"
          subtitle="Lifetime expenses"
          badge={{ text: 'Expenses', type: 'danger' }}
        />
        <MetricCard
          title="Net Savings"
          amount={summary?.net_savings}
          icon={PiggyBank}
          color="#6366f1"
          subtitle={`${summary?.savings_rate}% savings rate`}
          badge={{ text: `${summary?.savings_rate}% Saved`, type: 'info' }}
        />
        <MetricCard
          title="Spending Anomalies"
          amount={summary?.anomaly_count}
          icon={AlertTriangle}
          color="#f59e0b"
          subtitle="Flagged spike expenses"
          badge={{ text: summary?.anomaly_count > 0 ? 'Action Req' : 'Normal', type: summary?.anomaly_count > 0 ? 'warning' : 'success' }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Income vs Expense Monthly Trend */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--accent-primary)" />
              Monthly Income vs Expense Trend
            </h3>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.monthly_trends || []}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`]}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={18} color="#c084fc" />
              Expense Category Distribution
            </h3>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="category"
                >
                  {(summary?.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`]}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Progress Bars */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
          Monthly Category Budget Progress
        </h3>
        <div className="grid-2">
          {(summary?.budget_status || []).map((b, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600' }}>{b.category}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ₹{b.spent.toLocaleString()} / ₹{b.monthly_limit.toLocaleString()} ({b.percentage}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${b.percentage}%`,
                  height: '100%',
                  background: b.percentage > 90 ? 'var(--accent-danger)' : 'var(--accent-gradient)',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchDashboard}
      />
    </div>
  );
}
