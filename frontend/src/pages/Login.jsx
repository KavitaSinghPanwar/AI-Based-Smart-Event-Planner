import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, User, AlertCircle, Sparkles, TrendingUp, ListTodo } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-split-container">
      {/* Left panel: Feature showcase */}
      <div className="auth-showcase-panel">
        <div className="auth-showcase-content">
          <div className="showcase-logo">
            <BrainCircuit size={32} />
            <span>EventAI</span>
          </div>
          <h1 className="showcase-title">Plan Smarter. Stage Better.</h1>
          <p className="showcase-desc">
            Unlock the power of artificial intelligence to design, predict, and run events that captivate your audience.
          </p>
          
          <div className="showcase-features-list">
            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="showcase-feature-title">AI Venue Recommendation</h3>
                <p className="showcase-feature-desc">Match your guest count and budget with optimal local venue options instantly.</p>
              </div>
            </div>
            
            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="showcase-feature-title">Crowd Turnout Predictor</h3>
                <p className="showcase-feature-desc">Leverage pricing, date and timing variables to estimate attendance rates with high accuracy.</p>
              </div>
            </div>
            
            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <ListTodo size={20} />
              </div>
              <div>
                <h3 className="showcase-feature-title">Auto Itinerary Generator</h3>
                <p className="showcase-feature-desc">Compile chronological timeline schedules complete with session timing, activities, and host notes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="auth-form-panel">
        <div className="auth-card glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '36px', boxSizing: 'border-box' }}>
          <h2 className="auth-header-title" style={{ fontSize: '26px', marginBottom: '6px' }}>Welcome Back</h2>
          <p className="auth-subtitle" style={{ marginBottom: '24px' }}>Sign in to access your portal</p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '44px', height: '46px' }}
                  placeholder="Enter username" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={{ paddingLeft: '44px', height: '46px' }}
                  placeholder="Enter password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" style={{ height: '48px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '20px', fontSize: '13px' }}>
            Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
          </div>
          
          <div className="terminal-accounts-box">
            <div className="terminal-title">
              <BrainCircuit size={14} />
              <span>TEST CREDENTIALS</span>
            </div>
            <div style={{ lineHeight: '1.6' }}>
              • Organizer: <code>organizer</code> / <code>organizer123</code><br />
              • Regular User: <code>user</code> / <code>user123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
