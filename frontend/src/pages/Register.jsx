import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, User, Mail, ShieldAlert, AlertCircle, Sparkles, TrendingUp, ListTodo, Users } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(username, email, password, role);
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
          <h1 className="showcase-title">Your Portal to Event Innovation.</h1>
          <p className="showcase-desc">
            Organize high-turnout conferences, seminars, concerts or wedding ceremonies using our suite of cognitive planning widgets.
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

      {/* Right panel: Register form */}
      <div className="auth-form-panel">
        <div className="auth-card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', boxSizing: 'border-box' }}>
          <h2 className="auth-header-title" style={{ fontSize: '26px', marginBottom: '6px' }}>Create Account</h2>
          <p className="auth-subtitle" style={{ marginBottom: '24px' }}>Join the EventAI planning community</p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '13px' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ paddingLeft: '44px', height: '46px' }}
                  placeholder="Pick a username" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-control" 
                  style={{ paddingLeft: '44px', height: '46px' }}
                  placeholder="Enter email address" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={{ paddingLeft: '44px', height: '46px' }}
                  placeholder="Choose a strong password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Account Role</label>
              <div className="role-cards-container">
                <div 
                  type="button"
                  className={`role-card ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                >
                  <Users size={22} className="role-card-icon" />
                  <div className="role-card-title">Attendee</div>
                  <div className="role-card-desc">Browse hub & book tickets</div>
                </div>

                <div 
                  type="button"
                  className={`role-card ${role === 'organizer' ? 'active' : ''}`}
                  onClick={() => setRole('organizer')}
                >
                  <ShieldAlert size={22} className="role-card-icon" />
                  <div className="role-card-title">Organizer</div>
                  <div className="role-card-desc">Staging & planning events</div>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-btn" style={{ height: '48px' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '20px', fontSize: '13px' }}>
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

