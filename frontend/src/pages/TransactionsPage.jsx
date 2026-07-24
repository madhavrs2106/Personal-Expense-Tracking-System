import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';
import { Plus, Search, Filter, Trash2, AlertCircle } from 'lucide-react';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('expenses'); // expenses or incomes
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'expenses' ? '/expenses' : '/incomes';
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;

      const res = await API.get(endpoint, { params });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/${activeTab}/${id}`);
      fetchTransactions();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Transaction History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage, search, and audit your personal incomes & expenses.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => { setActiveTab('expenses'); setCategory('All'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'expenses' ? 'var(--accent-primary)' : 'transparent',
                color: '#fff'
              }}
            >
              Expenses
            </button>
            <button
              onClick={() => { setActiveTab('incomes'); setCategory('All'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'incomes' ? 'var(--accent-success)' : 'transparent',
                color: '#fff'
              }}
            >
              Incomes
            </button>
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search transactions..."
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                className="form-input"
                style={{ width: '160px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Groceries">Groceries</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '16px 20px' }}>Date</th>
              <th style={{ padding: '16px 20px' }}>Title</th>
              <th style={{ padding: '16px 20px' }}>Category</th>
              <th style={{ padding: '16px 20px' }}>Amount</th>
              <th style={{ padding: '16px 20px' }}>Status / Flags</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                    {item.title}
                    {item.notes && <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '400' }}>{item.notes}</div>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span className="badge badge-info">{item.category}</span>
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontWeight: '700',
                    color: activeTab === 'expenses' ? 'var(--accent-danger)' : 'var(--accent-success)'
                  }}>
                    {activeTab === 'expenses' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {item.is_anomaly ? (
                      <span className="badge badge-danger" title={`Z-Score anomaly (${item.anomaly_score})`}>
                        <AlertCircle size={12} /> Anomaly ({item.anomaly_score})
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Normal</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-danger"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchTransactions}
      />
    </div>
  );
}
