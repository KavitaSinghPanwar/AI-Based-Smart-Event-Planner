import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Ticket, 
  BrainCircuit, 
  MessageSquare, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <BrainCircuit size={28} />
        <span>EventAI</span>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} 
            onClick={handleLinkClick}
            end
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/events" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Calendar size={20} />
            <span>Event Hub</span>
          </NavLink>
        </li>
        
        {(user.role === 'organizer' || user.role === 'admin') && (
          <li className="sidebar-item">
            <NavLink 
              to="/create-event" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <PlusCircle size={20} />
              <span>Create Event</span>
            </NavLink>
          </li>
        )}
        
        <li className="sidebar-item">
          <NavLink 
            to="/bookings" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Ticket size={20} />
            <span>{user.role === 'user' ? 'My Bookings' : 'Bookings List'}</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/ai-planner" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <BrainCircuit size={20} />
            <span>AI Planner</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink 
            to="/chatbot" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <MessageSquare size={20} />
            <span>AI Chatbot</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <Link 
          to="/profile" 
          className="sidebar-user" 
          onClick={handleLinkClick}
          style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '8px 12px', 
            borderRadius: '12px', 
            transition: 'background-color 0.2s', 
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div className="sidebar-user-avatar">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{user.username}</div>
            <div className="sidebar-user-role">{user.role} (edit profile)</div>
          </div>
        </Link>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};


export default Sidebar;
