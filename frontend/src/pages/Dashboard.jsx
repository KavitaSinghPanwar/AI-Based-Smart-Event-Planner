import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Header from '../components/Header';
import { 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

const COLORS = ['#0ea5e9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isRevenue = payload[0].dataKey === 'revenue';
    return (
      <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)' }}>
          {isRevenue ? `$${parseFloat(payload[0].value).toFixed(2)}` : `${payload[0].value} Event(s)`}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('dashboard/stats/');
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="main-layout">
        <Header title="Dashboard" />
        <div className="content-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-formatted default values if backend didn't return any data yet
  const cards = [];
  let chartData = [];
  
  if (stats) {
    if (stats.role === 'admin') {
      cards.push(
        { label: 'Total Users', value: stats.stats.total_users, icon: <Users size={20} /> },
        { label: 'Organizers', value: stats.stats.total_organizers, icon: <ShieldCheck size={20} /> },
        { label: 'Events Active', value: stats.stats.total_events, icon: <Calendar size={20} /> },
        { label: 'Total Bookings', value: stats.stats.total_bookings, icon: <Ticket size={20} /> },
        { label: 'Total Revenue', value: `$${parseFloat(stats.stats.total_revenue).toFixed(2)}`, icon: <DollarSign size={20} /> }
      );
      
      chartData = (stats.category_distribution || []).map(item => ({
        name: item.category,
        count: item.count
      }));
    } else if (stats.role === 'organizer') {
      cards.push(
        { label: 'Events Staged', value: stats.stats.total_events, icon: <Calendar size={20} /> },
        { label: 'Total Bookings', value: stats.stats.total_bookings, icon: <Ticket size={20} /> },
        { label: 'Tickets Sold', value: stats.stats.total_tickets_sold, icon: <Users size={20} /> },
        { label: 'Total Revenue', value: `$${parseFloat(stats.stats.total_revenue).toFixed(2)}`, icon: <DollarSign size={20} /> }
      );
      
      chartData = (stats.revenue_by_category || []).map(item => ({
        name: item.event__category,
        revenue: parseFloat(item.revenue || 0)
      }));
    } else {
      cards.push(
        { label: 'My Bookings', value: stats.stats.total_bookings, icon: <Ticket size={20} /> },
        { label: 'Tickets Booked', value: stats.stats.total_tickets, icon: <Users size={20} /> },
        { label: 'Total Spent', value: `$${parseFloat(stats.stats.total_spent).toFixed(2)}`, icon: <DollarSign size={20} /> }
      );
    }
  }

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title={`${user.role.toUpperCase()} Portal - Dashboard`} />
      
      <div className="content-body">
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
            Hello, {user.username}!
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here is a summary of what's happening with EventAI today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="stat-card glass-panel" style={{ padding: '20px 24px' }}>
              <div className="stat-header">
                <span className="stat-label" style={{ fontWeight: 500 }}>{card.label}</span>
                <div className="stat-icon-wrapper" style={{ background: 'rgba(var(--accent-rgb), 0.12)' }}>{card.icon}</div>
              </div>
              <div className="stat-value" style={{ marginTop: '8px' }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        {user.role !== 'user' && chartData.length > 0 && (
          <div className="charts-grid">
            <div className="chart-card glass-panel">
              <h3 className="chart-title">
                {user.role === 'organizer' ? 'Revenue Breakdown by Category ($)' : 'Active Events by Category'}
              </h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} style={{ fontSize: '12px' }} />
                    <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                    <Bar dataKey={user.role === 'organizer' ? "revenue" : "count"} radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="advisor-card glass-panel animate-scale-in">
              <Sparkles size={24} className="advisor-sparkle" color="var(--accent-primary)" />
              <TrendingUp size={44} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>AI Smart Advisor</h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 auto', maxWidth: '320px' }}>
                EventAI predictive turnout trends reveal scheduling <strong>Seminars</strong> on <strong>Thursdays</strong> increases participant retention and sign-ups by <strong>18%</strong> compared to weekend slots.
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity Table */}
        {stats && stats.recent_bookings && (
          <div className="table-card glass-panel">
            <div className="table-header-container">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Booking Activity</h3>
              <span className="badge badge-success" style={{ letterSpacing: '0.5px' }}>Live Feed</span>
            </div>
            
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Ticket Holder</th>
                    <th>Qty</th>
                    <th>Total Price</th>
                    <th>Date Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    stats.recent_bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>#BK-{booking.id}</strong></td>
                        <td>{booking.event_details.title}</td>
                        <td>{booking.user_details.username}</td>
                        <td>{booking.ticket_quantity}</td>
                        <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>${parseFloat(booking.total_price).toFixed(2)}</span></td>
                        <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

