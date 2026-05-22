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
  Layers 
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

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
    <div className="main-layout">
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
            <div key={idx} className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{card.label}</span>
                <div className="stat-icon-wrapper">{card.icon}</div>
              </div>
              <div className="stat-value">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Charts and Tables */}
        {user.role !== 'user' && chartData.length > 0 && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3 className="chart-title">
                {user.role === 'organizer' ? 'Revenue Breakdown by Category ($)' : 'Active Events by Category'}
              </h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)' 
                      }} 
                    />
                    <Bar dataKey={user.role === 'organizer' ? "revenue" : "count"} radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <TrendingUp size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Smart Growth Tip</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  AI recommendations indicate that scheduling seminars on Thursdays increases participant engagement by 18% compared to weekend sessions. Try running a pilot session!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Table */}
        {stats && stats.recent_bookings && (
          <div className="table-card">
            <div className="table-header-container">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Booking Activity</h3>
              <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>Live Feed</span>
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
