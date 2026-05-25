import React, { useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Search, 
  DollarSign, 
  MapPin, 
  Users, 
  HelpCircle, 
  Calendar, 
  Clock, 
  Award,
  Sparkles,
  TrendingUp,
  ListTodo,
  Star,
  StarHalf
} from 'lucide-react';

const CATEGORIES = ['Wedding', 'Seminar', 'Concert', 'College Fest', 'Corporate Event'];

const renderStars = (rating) => {
  const roundedRating = Math.round(parseFloat(rating) * 2) / 2;
  return (
    <div style={{ display: 'inline-flex', gap: '3px', color: 'var(--warning)', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => {
        if (i <= roundedRating) return <Star key={i} size={13} fill="currentColor" stroke="none" />;
        if (i - 0.5 === roundedRating) return <StarHalf key={i} size={13} fill="currentColor" stroke="none" />;
        return <Star key={i} size={13} stroke="currentColor" fill="none" style={{ opacity: 0.35 }} />;
      })}
    </div>
  );
};

// 1. VENUE RECOMMENDATION TOOL
export const VenueRecommendations = () => {
  const [formData, setFormData] = useState({ event_type: 'Seminar', budget: '', city: '', crowd_size: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('ai/recommend-venue/', formData);
      setResults(response.data.venues || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit} className="ai-form-card glass-panel animate-scale-in">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          Venue Finder Recommendation Engine
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select 
              className="form-control" 
              style={{ height: '46px' }}
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Total Budget (USD)</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. 20000"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. San Francisco"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Attendees</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. 150"
              required
              value={formData.crowd_size}
              onChange={(e) => setFormData({ ...formData, crowd_size: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 24px' }} disabled={loading}>
          {loading ? 'Analyzing Venues...' : 'Get Recommendations'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="typing-indicator" style={{ justifyContent: 'center' }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>EventAI is evaluating local spaces...</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="ai-results-card glass-panel" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>AI Recommended Venues</h3>
          {results.map((venue, idx) => (
            <div key={idx} className="result-venue-card glass-panel animate-scale-in" style={{ padding: '20px', marginBottom: '16px', background: 'rgba(var(--card-rgb), 0.4)' }}>
              <div className="result-venue-header" style={{ marginBottom: '8px' }}>
                <div className="result-venue-title" style={{ fontSize: '16px', fontWeight: 700 }}>{venue.name}</div>
                <div className="result-venue-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {renderStars(venue.rating)}
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>({venue.rating})</span>
                </div>
              </div>
              <p className="result-venue-text" style={{ fontStyle: 'italic', marginBottom: '12px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                "{venue.reason}"
              </p>
              <div className="result-venue-meta" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <MapPin size={14} color="var(--accent-primary)" /> {venue.address}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Users size={14} color="var(--accent-primary)" /> Max Capacity: {venue.capacity}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>
                  <DollarSign size={14} /> Cost: {venue.estimated_cost}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. CROWD PREDICTION TOOL
export const CrowdPrediction = () => {
  const [formData, setFormData] = useState({ event_type: 'Seminar', category: 'Seminar', day_of_week: 'Saturday', ticket_price: '0' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('ai/predict-crowd/', formData);
      setResults(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit} className="ai-form-card glass-panel animate-scale-in">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}>
          <TrendingUp size={20} color="var(--accent-primary)" />
          Crowd Turnout Predictor
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Category</label>
            <select 
              className="form-control" 
              style={{ height: '46px' }}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, event_type: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Day of the Week</label>
            <select 
              className="form-control" 
              style={{ height: '46px' }}
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ticket Price (USD)</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. 49.99"
              required
              value={formData.ticket_price}
              onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 24px' }} disabled={loading}>
          {loading ? 'Predicting Crowd...' : 'Predict Attendance'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="typing-indicator" style={{ justifyContent: 'center' }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>EventAI is compiling crowd statistics...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card glass-panel" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 700 }}>AI Predictive Turnout Analysis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            {/* Speedometer Gauge */}
            <div className="gauge-container">
              <div className="gauge-circle" style={{ '--percentage': results.turnout_percentage }}>
                <div className="gauge-inner">
                  <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--accent-primary)' }}>{results.turnout_percentage}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>Probability</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(var(--card-rgb), 0.3)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Audience Outlook</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                  {results.predicted_crowd} attendees
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Estimated turnout scale</div>
              </div>
            </div>
          </div>
          
          <div className="advisor-card glass-panel" style={{ textAlign: 'left', padding: '16px', background: 'rgba(var(--accent-rgb), 0.05)', display: 'block' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              AI Turnout Insight
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{results.insights}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. BUDGET ESTIMATION TOOL
export const BudgetEstimation = () => {
  const [formData, setFormData] = useState({ category: 'Wedding', crowd_size: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('ai/estimate-budget/', formData);
      setResults(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getWeightColor = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('venue') || cat.includes('decor')) return 'linear-gradient(90deg, #0ea5e9, #38bdf8)';
    if (cat.includes('cater') || cat.includes('food')) return 'linear-gradient(90deg, #3b82f6, #60a5fa)';
    if (cat.includes('av') || cat.includes('production') || cat.includes('sound')) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #10b981, #34d399)';
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit} className="ai-form-card glass-panel animate-scale-in">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}>
          <DollarSign size={20} color="var(--accent-primary)" />
          Budget Estimator Tool
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Category</label>
            <select 
              className="form-control" 
              style={{ height: '46px' }}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Expected Guest Count</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. 200"
              required
              value={formData.crowd_size}
              onChange={(e) => setFormData({ ...formData, crowd_size: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. Los Angeles"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 24px' }} disabled={loading}>
          {loading ? 'Calculating Estimate...' : 'Estimate Budget'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="typing-indicator" style={{ justifyContent: 'center' }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>EventAI is researching itemized vendor options...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card glass-panel" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Estimated Itemized Budget</h3>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>
              ${results.total_estimated_cost.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>USD</span>
            </div>
          </div>
          
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel animate-scale-in" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(var(--card-rgb), 0.3)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Venue Cost</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                ${(results.items.find(i => i.category.toLowerCase().includes('venue'))?.cost || results.total_estimated_cost * 0.35).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="glass-panel animate-scale-in" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(var(--card-rgb), 0.3)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Food Cost</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                ${(results.items.find(i => i.category.toLowerCase().includes('cater') || i.category.toLowerCase().includes('food'))?.cost || results.total_estimated_cost * 0.30).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="glass-panel animate-scale-in" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(var(--card-rgb), 0.3)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Decoration & AV</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                ${(results.items.find(i => i.category.toLowerCase().includes('logistics') || i.category.toLowerCase().includes('decor') || i.category.toLowerCase().includes('av'))?.cost || results.total_estimated_cost * 0.20).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="glass-panel animate-scale-in" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(var(--accent-rgb), 0.1)', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Estimate</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                ${results.total_estimated_cost.toLocaleString()}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600, letterSpacing: '0.5px' }}>Cost Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
            {results.items.map((item, idx) => {
              const percentage = (item.cost / results.total_estimated_cost) * 100;
              return (
                <div key={idx} className="animate-scale-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500 }}>{item.category}</span>
                    <strong>${item.cost.toLocaleString()} ({percentage.toFixed(0)}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: getWeightColor(item.category), borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="advisor-card glass-panel" style={{ textAlign: 'left', padding: '16px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'block' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <HelpCircle size={16} color="var(--success)" /> Budget Saving Strategy:
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{results.savings_tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. AUTO SCHEDULE GENERATOR TOOL
export const ScheduleGenerator = () => {
  const [formData, setFormData] = useState({ title: '', category: 'Wedding', date: '', time: '', duration_hours: '' });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('ai/generate-schedule/', formData);
      setResults(response.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      <form onSubmit={handleSubmit} className="ai-form-card glass-panel animate-scale-in">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700 }}>
          <ListTodo size={20} color="var(--accent-primary)" />
          Auto Itinerary Timeline Generator
        </h3>
        
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Event Title</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. Annual Design Summit"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Category</label>
            <select 
              className="form-control" 
              style={{ height: '46px' }}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control" 
              style={{ height: '46px' }}
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input 
              type="time" 
              className="form-control" 
              style={{ height: '46px' }}
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Duration (Hours)</label>
            <input 
              type="number" 
              step="0.5"
              className="form-control" 
              style={{ height: '46px' }}
              placeholder="e.g. 4.5"
              required
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ height: '46px', padding: '0 24px' }} disabled={loading}>
          {loading ? 'Synthesizing Timeline...' : 'Generate Itinerary'}
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="typing-indicator" style={{ justifyContent: 'center' }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>EventAI is arranging sessions chronologically...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card glass-panel" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '28px', fontSize: '16px', fontWeight: 700 }}>Generated Event Schedule</h3>
          
          {/* Vertical Timeline */}
          <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '2.5px dashed var(--accent-primary)', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '26px', marginBottom: '32px' }}>
            {results.schedule.map((item, idx) => (
              <div key={idx} className="animate-scale-in" style={{ position: 'relative' }}>
                {/* Bullet node */}
                <div style={{ position: 'absolute', left: '-39.5px', top: '2px', width: '11px', height: '11px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-secondary)', boxSizing: 'content-box', boxShadow: '0 0 0 3px rgba(var(--accent-rgb), 0.2)' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(var(--accent-rgb), 0.12)', padding: '3px 10px', borderRadius: '8px' }}>
                      <Clock size={12} /> {item.time}
                    </span>
                    {(() => {
                      const act = item.activity.toLowerCase();
                      if (act.includes('registration') || act.includes('check-in') || act.includes('doors open') || act.includes('welcome')) {
                        return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.15)' }}>Registration</span>;
                      }
                      if (act.includes('break') || act.includes('lunch') || act.includes('refreshment') || act.includes('coffee') || act.includes('intermission')) {
                        return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)' }}>Break</span>;
                      }
                      return <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.15)' }}>Session</span>;
                    })()}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.activity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="advisor-card glass-panel" style={{ textAlign: 'left', padding: '16px', background: 'rgba(var(--accent-rgb), 0.04)', display: 'block' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <Calendar size={16} color="var(--accent-primary)" /> Planner Notes:
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{results.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

