import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Cpu, Sparkles, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

export default function AIFinancialHubPage() {
  // Live ML Playground State
  const [inputTitle, setInputTitle] = useState('Starbucks Iced Caramel Macchiato');
  const [predictionResult, setPredictionResult] = useState(null);

  // Forecasting State
  const [forecastData, setForecastData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  // Anomaly State
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Categorization Test
  useEffect(() => {
    if (!inputTitle.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const res = await API.post('/ml/predict-category', { title: inputTitle });
        setPredictionResult(res.data);
      } catch (err) {
        console.error("ML prediction error", err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [inputTitle]);

  // Load Forecast & Anomalies
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        const fcRes = await API.get('/ml/forecast');
        setHistoricalData(fcRes.data.historical || []);
        setForecastData(fcRes.data.forecast || []);

        const anomRes = await API.get('/ml/anomalies');
        setAnomaliesData(anomRes.data);
      } catch (err) {
        console.error("Failed to load AI data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIData();
  }, []);

  // Merge historical and forecast data for chart
  const combinedChartData = [
    ...historicalData.map(h => ({ month: h.month, actual: h.total })),
    ...forecastData.map(f => ({
      month: f.month,
      predicted: f.predicted_amount,
      lowerBound: f.lower_bound,
      upperBound: f.upper_bound
    }))
  ];

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={28} color="#c084fc" />
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>AI & Machine Learning Hub</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Explore PETS's intelligent expense categorizer, time-series forecasting, and spending anomaly detection algorithms.
        </p>
      </div>

      {/* 1. Automated Expense Categorizer Live Playground */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="#c084fc" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>1. Automated Expense Categorizer (TF-IDF + ML Classifier)</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Type any transaction description to see how our trained Scikit-Learn TF-IDF model predicts the category in real-time.
        </p>

        <div className="grid-2">
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Test Transaction Description
            </label>
            <input
              type="text"
              className="form-input"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="e.g. Uber Ride, Netflix, Amazon Purchase..."
              style={{ fontSize: '15px', padding: '12px' }}
            />

            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quick Examples:</span>
              {['Starbucks Coffee', 'Uber Ride', 'Netflix 4K', 'Electricity Bill', 'Swiggy Dinner', 'Zara Jacket'].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInputTitle(ex)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            {predictionResult ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Predicted Category</span>
                  <span className="badge badge-ai">
                    {Math.round(predictionResult.confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ fontSize: '24px', fontWeight: '800', color: '#c084fc', marginBottom: '16px' }}>
                  {predictionResult.predicted_category}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Top Category Probabilities:
                </div>
                {Object.entries(predictionResult.top_categories || {}).map(([cat, prob], idx) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                      <span>{cat}</span>
                      <span>{Math.round(prob * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${prob * 100}%`, height: '100%', background: 'var(--accent-gradient)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Type a description to see ML classification...</div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Expense Time-Series Forecasting */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <TrendingUp size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>2. Time-Series Expense Forecasting</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Predicts future monthly expense projections and bounds based on historical spending data.
        </p>

        <div style={{ width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                formatter={(val) => val ? [`₹${val.toLocaleString()}`] : ['-']}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Historical Actual" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" name="ML Forecast" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="upperBound" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" name="Upper Limit" />
              <Line type="monotone" dataKey="lowerBound" stroke="#06b6d4" strokeWidth={1} strokeDasharray="3 3" name="Lower Limit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Spending Anomaly Detection */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={20} color="#ef4444" />
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>3. Spending Anomaly Detection Center</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Monitors daily spending baseline (Average daily: ₹{anomaliesData?.average_daily_spending?.toLocaleString() || '700'}) and flags transactions exceeding expected standard deviation.
        </p>

        {anomaliesData?.items?.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: '#10b981' }}>
            <ShieldCheck size={20} />
            <span>No unusual spending anomalies detected. All transaction amounts are within normal expected bounds!</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomaliesData?.items?.map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{item.title}</span>
                    <span className={`badge badge-${item.severity === 'High' ? 'danger' : 'warning'}`}>
                      {item.severity} Anomaly (Score: {item.anomaly_score})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Category: {item.category} • Date: {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>
                    ₹{item.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    vs Avg Daily ₹{anomaliesData?.average_daily_spending?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
