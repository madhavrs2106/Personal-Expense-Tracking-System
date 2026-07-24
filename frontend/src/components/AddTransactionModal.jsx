import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onRefresh }) {
  const [type, setType] = useState('expense'); // expense or income
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Auto');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // ML Prediction States
  const [predictedCat, setPredictedCat] = useState('');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (type === 'expense' && title.trim().length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const res = await API.post('/ml/predict-category', { title });
          setPredictedCat(res.data.predicted_category);
          setConfidence(res.data.confidence);
          if (category === 'Auto') {
            // Keep category as Auto
          }
        } catch (e) {
          console.error("Prediction failed", e);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPredictedCat('');
    }
  }, [title, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    try {
      if (type === 'expense') {
        await API.post('/expenses', {
          title,
          amount: parseFloat(amount),
          category: category === 'Auto' ? (predictedCat || 'Other') : category,
          notes
        });
      } else {
        await API.post('/incomes', {
          title,
          amount: parseFloat(amount),
          category: category === 'Auto' ? 'Salary' : category,
          notes
        });
      }
      setTitle('');
      setAmount('');
      setNotes('');
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Transaction</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Toggle Income/Expense */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setType('expense')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              background: type === 'expense' ? 'var(--accent-danger)' : 'transparent',
              color: '#fff'
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              background: type === 'income' ? 'var(--accent-success)' : 'transparent',
              color: '#fff'
            }}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Description / Title
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={type === 'expense' ? 'e.g. Starbucks Coffee, Uber Ride' : 'e.g. Monthly Salary, Freelance'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* AI Live Categorization Feedback Pill */}
          {type === 'expense' && predictedCat && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '10px 14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#c084fc" />
                <span>AI Suggested Category: <strong style={{ color: '#c084fc' }}>{predictedCat}</strong></span>
              </div>
              <span className="badge badge-ai">{Math.round(confidence * 100)}% match</span>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Category
            </label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Auto">✨ Auto ML Prediction</option>
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
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              Notes (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
