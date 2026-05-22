import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, User, AlertCircle } from 'lucide-react';

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
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-gradient)', color: 'white', marginBottom: '20px' }}>
          <BrainCircuit size={32} />
        </div>
        <h2 className="auth-header-title">Welcome to EventAI</h2>
        <p className="auth-subtitle">AI-Powered Smart Event Planner</p>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '44px' }}
                placeholder="Enter username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '44px' }}
                placeholder="Enter password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </div>
        
        <div style={{ marginTop: '20px', padding: '10px 14px', background: 'var(--border-color)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Quick Accounts:</strong><br />
          Organizer: <code>organizer</code> / <code>organizer123</code><br />
          General User: <code>user</code> / <code>user123</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
