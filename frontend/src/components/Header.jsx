import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User, Menu, Bell, CheckSquare } from 'lucide-react';

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  let outletContext = null;
  try {
    outletContext = useOutletContext();
  } catch (e) {
    // Fallback if not inside an outlet context
  }

  const setMobileOpen = outletContext?.setMobileSidebarOpen;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds to fetch notifications dynamically
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('notifications/mark_all_read/');
      fetchNotifications();
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="main-header" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {setMobileOpen && (
          <button 
            className="btn-burger-menu" 
            onClick={() => setMobileOpen(prev => !prev)}
            title="Toggle Menu"
            style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
          >
            <Menu size={20} color="var(--text-secondary)" />
          </button>
        )}
        <div className="header-title">
          {title}
        </div>
      </div>
      
      <div className="header-actions">
        {/* Notifications Icon with Badge */}
        {user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="theme-toggle" 
              onClick={() => setShowDropdown(!showDropdown)} 
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  border: '1.5px solid var(--bg-secondary)'
                }} />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showDropdown && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '320px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow)',
                  border: '1px solid var(--border-color)',
                  zIndex: 1000,
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14.5px' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckSquare size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '280px' }}>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map(item => (
                      <div 
                        key={item.id} 
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: item.is_read ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)',
                          borderLeft: item.is_read ? '2px solid transparent' : '2.5px solid var(--accent-primary)',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{item.title}</span>
                          {!item.is_read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: '5px' }} />
                          )}
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>{item.message}</p>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
            <User size={16} />
            <span>Hello, <strong style={{ color: 'var(--accent-primary)' }}>{user.username}</strong></span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
