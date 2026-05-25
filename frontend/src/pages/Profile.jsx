import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { User, Mail, Lock, Phone, MapPin, AlignLeft, Sparkles, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      username,
      email,
      full_name: fullName,
      bio,
      phone,
      city
    };

    if (password) {
      payload.password = password;
    }

    const result = await updateProfile(payload);
    if (result.success) {
      setSuccessMsg('Profile updated successfully!');
      setPassword(''); // clear password field
    } else {
      setErrorMsg(result.error);
    }
    setLoading(false);
  };

  const isProfileComplete = user?.full_name && user?.city && user?.phone;

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title="My Profile Settings" />

      <div className="content-body">
        {/* Profile Completion Prompt */}
        {!isProfileComplete && (
          <div className="glass-panel" style={{ 
            padding: '20px 24px', 
            borderRadius: '16px', 
            background: 'rgba(var(--accent-rgb), 0.08)', 
            border: '1px solid rgba(var(--accent-rgb), 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <div style={{ background: 'rgba(var(--accent-rgb), 0.12)', padding: '10px', borderRadius: '50%', color: 'var(--accent-primary)' }}>
              <Sparkles size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Complete Your Profile Pass</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Fill in your full name, location, and phone number to unlock personalized event notifications and customized planning feeds!
              </p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={18} />
            <span style={{ fontSize: '13.5px' }}>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13.5px' }}>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }} className="split-grid">
          {/* Left panel: Profile Card */}
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: '16px' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'var(--accent-gradient)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: 800,
              fontSize: '28px',
              margin: '0 auto 20px auto',
              boxShadow: '0 4px 20px rgba(var(--accent-rgb), 0.25)'
            }}>
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0' }}>{user?.username}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{user?.email}</p>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Role:</span>
                <span className="badge badge-success" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Profile Status:</span>
                <span style={{ fontWeight: 600, color: isProfileComplete ? 'var(--success)' : 'var(--warning)' }}>
                  {isProfileComplete ? '100% Completed' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Edit Form */}
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Edit Profile Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-grid">
              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    placeholder="e.g. +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-grid">
              <div className="form-group">
                <label className="form-label">City / Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    placeholder="e.g. Chicago"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Update Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ paddingLeft: '38px', height: '42px' }}
                    placeholder="Leave blank to keep same"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Short Bio</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <textarea 
                  className="form-control" 
                  style={{ paddingLeft: '38px', paddingTop: '10px' }}
                  rows="3"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px' }} disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
