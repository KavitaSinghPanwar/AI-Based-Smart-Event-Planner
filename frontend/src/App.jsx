import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventHub from './pages/EventHub';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import BookingsList from './pages/BookingsList';
import AIPlanner from './pages/AIPlanner';
import ChatbotAssistant from './pages/ChatbotAssistant';

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
  return token ? <Navigate to="/" replace /> : <Outlet />;
};

// Main Layout Wrapper
const DashboardLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Outlet />
    </div>
  );
};

// Organizer specific route guard
const OrganizerRoute = () => {
  const { user } = useAuth();
  if (user && (user.role === 'organizer' || user.role === 'admin')) {
    return <Outlet />;
  }
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public auth pages */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Private dashboard pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/events" element={<EventHub />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/bookings" element={<BookingsList />} />
                <Route path="/ai-planner" element={<AIPlanner />} />
                <Route path="/chatbot" element={<ChatbotAssistant />} />
                
                {/* Organizer actions */}
                <Route element={<OrganizerRoute />}>
                  <Route path="/create-event" element={<CreateEvent />} />
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
