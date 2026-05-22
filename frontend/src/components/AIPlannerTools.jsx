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
  ListTodo
} from 'lucide-react';

const CATEGORIES = ['Wedding', 'Seminar', 'Concert', 'College Fest', 'Corporate Event'];

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
    <div>
      <form onSubmit={handleSubmit} className="ai-form-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          Venue Finder Recommendation Engine
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select 
              className="form-control" 
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
              placeholder="e.g. 150"
              required
              value={formData.crowd_size}
              onChange={(e) => setFormData({ ...formData, crowd_size: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
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
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>EventAI is evaluating locations...</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="ai-results-card">
          <h3 style={{ marginBottom: '20px' }}>AI Recommended Venues</h3>
          {results.map((venue, idx) => (
            <div key={idx} className="result-venue-card">
              <div className="result-venue-header">
                <div className="result-venue-title">{venue.name}</div>
                <div className="result-venue-rating">
                  <Award size={16} />
                  <span>{venue.rating} / 5.0</span>
                </div>
              </div>
              <p className="result-venue-text" style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                {venue.reason}
              </p>
              <div className="result-venue-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {venue.address}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> Max Capacity: {venue.capacity}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
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
    <div>
      <form onSubmit={handleSubmit} className="ai-form-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={20} color="var(--accent-primary)" />
          Crowd Turnout Predictor
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Category</label>
            <select 
              className="form-control" 
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
              placeholder="e.g. 49.99"
              required
              value={formData.ticket_price}
              onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
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
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>EventAI is analyzing crowd patterns...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card">
          <h3 style={{ marginBottom: '20px' }}>AI Predictive Turnout Analysis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(var(--card-rgb), 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Turnout Probability</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-primary)' }}>{results.turnout_percentage}%</div>
            </div>
            <div style={{ background: 'rgba(var(--card-rgb), 0.5)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Predicted Audience Size</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--success)' }}>{results.predicted_crowd} pax</div>
            </div>
          </div>
          
          <div style={{ background: 'rgba(var(--card-rgb), 0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>AI Analyst Insights:</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{results.insights}</p>
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

  return (
    <div>
      <form onSubmit={handleSubmit} className="ai-form-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DollarSign size={20} color="var(--accent-primary)" />
          Budget Estimator Tool
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Category</label>
            <select 
              className="form-control" 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Crowd Size (People)</label>
            <input 
              type="number" 
              className="form-control" 
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
              placeholder="e.g. Los Angeles"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
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
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>EventAI is evaluating itemized vendor options...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h3>Estimated Itemized Budget</h3>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)' }}>
              ${results.total_estimated_cost.toLocaleString()} USD
            </div>
          </div>
          
          <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>Cost Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {results.items.map((item, idx) => {
              const percentage = (item.cost / results.total_estimated_cost) * 100;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span>{item.category}</span>
                    <strong>${item.cost.toLocaleString()} ({percentage.toFixed(0)}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'rgba(var(--card-rgb), 0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} /> Budget Saving Tips:
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
    <div>
      <form onSubmit={handleSubmit} className="ai-form-card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListTodo size={20} color="var(--accent-primary)" />
          Auto Schedule Itinerary Generator
        </h3>
        
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Event Title</label>
            <input 
              type="text" 
              className="form-control" 
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
              placeholder="e.g. 4.5"
              required
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
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
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>EventAI is arranging sessions chronologically...</p>
        </div>
      )}

      {results && (
        <div className="ai-results-card">
          <h3 style={{ marginBottom: '24px' }}>Generated Event Schedule</h3>
          
          {/* Vertical Timeline */}
          <div style={{ position: 'relative', paddingLeft: '30px', borderLeft: '2px solid var(--accent-primary)', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            {results.schedule.map((item, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                {/* Bullet */}
                <div style={{ position: 'absolute', left: '-37px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-secondary)', boxSizing: 'content-box' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                      <Clock size={12} /> {item.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.activity}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(var(--card-rgb), 0.3)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> Planner Notes:
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{results.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};
