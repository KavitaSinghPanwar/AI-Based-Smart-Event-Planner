import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Lock, User, Mail, ShieldAlert, AlertCircle } from 'lucide-react';

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
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-gradient)', color: 'white', marginBottom: '20px' }}>
          <BrainCircuit size={32} />
        </div>
        <h2 className="auth-header-title">Create Account</h2>
        <p className="auth-subtitle">Join EventAI Smart Event Planner</p>

        {error && (
          <div className="alert alert-danger" style={{ whiteSpace: 'pre-line' }}>
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
                placeholder="Pick a username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '44px' }}
                placeholder="Enter email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Choose a strong password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ position: 'relative' }}>
              <ShieldAlert size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <select 
                className="form-control" 
                style={{ paddingLeft: '44px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">General User (Book Tickets)</option>
                <option value="organizer">Organizer (Manage & Plan Events)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
