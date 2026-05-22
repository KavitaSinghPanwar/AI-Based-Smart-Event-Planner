import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, User } from 'lucide-react';

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="main-header">
      <div className="header-title">
        {title}
      </div>
      
      <div className="header-actions">
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
