import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  PlusCircle,
  MessageSquare,
  MapPin,
  User,
  CheckCircle,
  Clock,
  ArrowRight
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

  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const isProfileComplete = !!(user?.full_name && user?.city && user?.phone);

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
    const fetchEvents = async () => {
      try {
        const response = await api.get('events/');
        setEvents(response.data);
      } catch (err) {
        console.error("Error loading events", err);
      }
    };
    fetchStats();
    fetchEvents();
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

      // Compute tickets booked per category for User chart
      const categoryCounts = {};
      (stats.recent_bookings || []).forEach(b => {
        const cat = b.event_details?.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + b.ticket_quantity;
      });
      chartData = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count
      }));
    }
  }

  // Get user's upcoming booked events (filter bookings that are in the future, or just preview recent ones)
  const upcomingBookings = stats?.recent_bookings || [];
  
  // Recommend events not yet booked
  const bookedEventIds = new Set(upcomingBookings.map(b => b.event));
  const recommendedEvents = events.filter(e => !bookedEventIds.has(e.id)).slice(0, 3);

  const getDaysLeft = (eventDateStr) => {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    eventDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'Today', color: 'var(--danger)' };
    if (diffDays === 1) return { text: 'Tomorrow', color: '#f59e0b' };
    if (diffDays > 1) return { text: `${diffDays} days left`, color: 'var(--accent-primary)' };
    if (diffDays === -1) return { text: 'Yesterday', color: 'var(--text-muted)' };
    return { text: `${Math.abs(diffDays)} days ago`, color: 'var(--text-muted)' };
  };

  const getCountdownEvents = () => {
    if (user.role === 'user') {
      return upcomingBookings.map(b => ({
        id: b.id,
        title: b.event_details?.title,
        date: b.event_details?.date,
        category: b.event_details?.category,
        link: `/bookings`
      }));
    } else if (user.role === 'organizer') {
      return events.filter(e => e.organizer_id === user.id).map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        category: e.category,
        link: `/events/${e.id}`
      }));
    } else {
      return events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        category: e.category,
        link: `/events/${e.id}`
      }));
    }
  };

  const getRecentActivities = () => {
    const list = [];
    list.push({
      id: 'act-auth',
      text: 'Session authenticated successfully',
      time: 'Just now',
      type: 'success'
    });

    if (isProfileComplete) {
      list.push({
        id: 'act-profile',
        text: 'Profile verification pass completed',
        time: 'Today',
        type: 'success'
      });
    } else {
      list.push({
        id: 'act-profile-inc',
        text: 'Complete your profile details to unlock smart alerts',
        time: 'Pending',
        type: 'warning'
      });
    }

    if (user.role === 'user' && upcomingBookings.length > 0) {
      upcomingBookings.forEach((b) => {
        list.push({
          id: `act-book-${b.id}`,
          text: `Ticket pass booked: ${b.event_details?.title || 'Event'}`,
          time: new Date(b.booking_date).toLocaleDateString(),
          type: 'success'
        });
      });
    } else if ((user.role === 'organizer' || user.role === 'admin') && stats?.recent_bookings?.length > 0) {
      stats.recent_bookings.forEach((b) => {
        list.push({
          id: `act-recv-${b.id}`,
          text: `New registration: ${b.event_details?.title} from ${b.user_details?.username}`,
          time: new Date(b.booking_date).toLocaleDateString(),
          type: 'success'
        });
      });
    }

    list.push({
      id: 'act-planner',
      text: 'AI Event Planner itinerary model initialized',
      time: 'System',
      type: 'info'
    });

    return list.slice(0, 4);
  };


  return (
    <div className="main-layout animate-fade-in-up">
      <Header title={`${user.role.toUpperCase()} Portal - Dashboard`} />
      
      <div className="content-body">
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>
              Welcome back, {user.username} 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Here is a summary of what's happening with EventAI today.
            </p>
          </div>
          
          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {user.role === 'user' ? (
              <>
                <button className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/events')}>
                  <Calendar size={16} /> Browse Events
                </button>
                <button className="btn-details" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/ai-planner')}>
                  <Sparkles size={16} /> AI Planner
                </button>
              </>
            ) : (
              <>
                <button className="btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/create-event')}>
                  <PlusCircle size={16} /> Create Event
                </button>
                <button className="btn-details" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/bookings')}>
                  <Ticket size={16} /> View Bookings
                </button>
              </>
            )}
            <button className="btn-details" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/chatbot')}>
              <MessageSquare size={16} /> Chat AI
            </button>
            <button className="btn-details" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }} onClick={() => navigate('/profile')}>
              <User size={16} /> View Profile
            </button>
          </div>
        </div>

        {/* Profile Completion Reminder Banner */}
        {!isProfileComplete && (
          <div className="glass-panel card-hover-lift animate-fade-in" style={{ 
            padding: '18px 24px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.03))', 
            border: '1px solid rgba(var(--accent-rgb), 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div style={{ background: 'rgba(var(--accent-rgb), 0.15)', padding: '10px', borderRadius: '50%', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} style={{ filter: 'drop-shadow(0 0 3px rgba(var(--accent-rgb), 0.4))' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Complete Your Profile Pass 🚀</h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Provide your full name, location, and phone number to unlock personalized event notifications and custom planning feeds.
                </p>
              </div>
            </div>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate('/profile')}
            >
              Complete Profile <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
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

        {/* Main Dashboard Layout Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }} className="split-grid">
          
          {/* Left Column (2fr): Charts and Bookings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Chart Card */}
            {chartData.length > 0 && (
              <div className="chart-card glass-panel" style={{ padding: '24px', margin: 0 }}>
                <h3 className="chart-title" style={{ marginTop: 0 }}>
                  {user.role === 'organizer' ? 'Revenue Breakdown by Category ($)' : 
                   user.role === 'admin' ? 'Active Events by Category' : 
                   'My Tickets Purchased by Category'}
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.85} />
                          <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.25} />
                        </linearGradient>
                        <linearGradient id="barGradientOrganizer" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.25} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} style={{ fontSize: '12px' }} />
                      <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                      <Bar 
                        dataKey={user.role === 'organizer' ? "revenue" : "count"} 
                        radius={[8, 8, 0, 0]} 
                        maxBarSize={45}
                        fill={user.role === 'organizer' ? "url(#barGradientOrganizer)" : "url(#barGradient)"}
                        isAnimationActive={true}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Bookings / Events Table */}
            {user.role === 'user' ? (
              <div className="table-card glass-panel" style={{ padding: '24px', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Upcoming Booked Events</h3>
                  <Link to="/bookings" style={{ fontSize: '13px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>View All Tickets</Link>
                </div>
                {upcomingBookings.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ margin: 0 }}>No upcoming event bookings found. Browse and register for events in the Event Hub!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {upcomingBookings.slice(0, 3).map((booking) => {
                      const countdown = getDaysLeft(booking.event_details?.date);
                      return (
                        <div key={booking.id} className="glass-panel card-hover-lift" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--card-rgb), 0.3)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-primary)', padding: '10px', borderRadius: '10px' }}>
                              <Ticket size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>{booking.event_details?.title}</h4>
                              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                                {new Date(booking.event_details?.date).toLocaleDateString()} at {booking.event_details?.time.substring(0, 5)} | {booking.event_details?.venue}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span className="badge badge-success" style={{ display: 'inline-block' }}>Confirmed</span>
                              <span style={{ fontSize: '11.5px', fontWeight: 750, color: countdown.color }}>{countdown.text}</span>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Seats: {booking.seat_numbers}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Recent Activity Table for Organizers/Admins */
              stats && stats.recent_bookings && (
                <div className="table-card glass-panel" style={{ margin: 0 }}>
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
                              <td>{booking.event_details?.title}</td>
                              <td>{booking.user_details?.username}</td>
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
              )
            )}
          </div>

          {/* Right Column (1fr): Dynamic Widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Widget 1: My Profile Card */}
            <div className="glass-panel card-hover-lift" style={{ padding: '24px', textAlign: 'center', boxSizing: 'border-box' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'var(--accent-gradient)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: 800,
                fontSize: '20px',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.2)'
              }}>
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 850, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                {user?.full_name || user?.username}
              </h4>
              <span className="badge badge-success" style={{ display: 'inline-block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                {user?.role} Account
              </span>
              
              <div style={{ textAlign: 'left', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Profile Progress:</span>
                  <span style={{ fontWeight: 700, color: isProfileComplete ? 'var(--success)' : 'var(--warning)' }}>
                    {isProfileComplete ? '100% (Complete)' : '60% (Incomplete)'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: isProfileComplete ? '100%' : '60%', 
                    height: '100%', 
                    background: isProfileComplete ? 'var(--success)' : 'var(--warning)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>
              </div>

              <button 
                className="btn-details" 
                style={{ width: '100%', padding: '9px 0', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => navigate('/profile')}
              >
                <User size={13} /> View & Edit Profile
              </button>
            </div>

            {/* Widget 2: AI Smart Advisor Card */}
            <div className="advisor-card glass-panel animate-scale-in card-hover-lift" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(var(--card-rgb), 0.8), rgba(var(--accent-rgb), 0.07))',
              border: '1px solid rgba(var(--accent-rgb), 0.25)',
              position: 'relative',
              overflow: 'hidden',
              padding: '24px',
              margin: 0
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={20} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 4px rgba(var(--accent-rgb), 0.5))' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Smart Advisor</span>
              </div>

              {user.role === 'user' ? (
                <>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', textAlign: 'left' }}>Recommended Event Match</h4>
                  <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(var(--accent-rgb), 0.15)', marginBottom: '12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate('/events')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700 }}>🎵 CONCERT</span>
                      <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px' }}>85% Match</span>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Neon Symphony Concert</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tailored to your concert preference!</div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, textAlign: 'left' }}>
                    Based on your bookings, you love live music performances. We highly recommend registering before spots fill up.
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', textAlign: 'left' }}>Staging Recommendation</h4>
                  <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129, 0.15)', marginBottom: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>📈 RETENTION</span>
                      <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: '#10b981' }}>+18% Yield</span>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Seminars on Thursdays</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avoid weekend slots for seminars</div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, textAlign: 'left' }}>
                    EventAI Turnout models indicate scheduling workshops on weekdays boosts participant sign-ups.
                  </p>
                </>
              )}
            </div>

            {/* Widget 3: Recent Activity Feed */}
            <div className="glass-panel card-hover-lift" style={{ padding: '24px', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', marginTop: 0 }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {getRecentActivities().map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                    <CheckCircle size={15} style={{ color: act.type === 'warning' ? 'var(--warning)' : 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{act.text}</p>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

