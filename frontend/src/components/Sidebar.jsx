import React from 'react';
import { NavLink } from 'react-router-dom';
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

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <BrainCircuit size={28} />
        <span>EventAI</span>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/events" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Event Hub</span>
          </NavLink>
        </li>
        
        {(user.role === 'organizer' || user.role === 'admin') && (
          <li className="sidebar-item">
            <NavLink to="/create-event" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={20} />
              <span>Create Event</span>
            </NavLink>
          </li>
        )}
        
        <li className="sidebar-item">
          <NavLink to="/bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Ticket size={20} />
            <span>{user.role === 'user' ? 'My Bookings' : 'Bookings List'}</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/ai-planner" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            <span>AI Planner</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/chatbot" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            <span>AI Chatbot</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{user.username}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
