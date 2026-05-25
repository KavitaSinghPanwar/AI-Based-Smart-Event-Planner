import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EventHub from './pages/EventHub';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import BookingsList from './pages/BookingsList';
import AIPlanner from './pages/AIPlanner';
import ChatbotAssistant from './pages/ChatbotAssistant';
import Profile from './pages/Profile';

// Route guards
const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="typing-indicator">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    );
  }
  
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// Main Layout Wrapper
const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      {mobileSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
      )}
      <Outlet context={{ mobileSidebarOpen, setMobileSidebarOpen }} />
    </div>
  );
};


// Organizer specific route guard
const OrganizerRoute = () => {
  const { user } = useAuth();
  if (user && (user.role === 'organizer' || user.role === 'admin')) {
    return <Outlet />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public auth pages */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Private dashboard pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/events" element={<EventHub />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/bookings" element={<BookingsList />} />
                <Route path="/ai-planner" element={<AIPlanner />} />
                <Route path="/chatbot" element={<ChatbotAssistant />} />
                
                {/* Organizer actions */}
                <Route element={<OrganizerRoute />}>
                  <Route path="/create-event" element={<CreateEvent />} />
                  <Route path="/events/:id/edit" element={<CreateEvent />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
