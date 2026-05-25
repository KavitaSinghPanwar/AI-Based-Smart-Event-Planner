import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  ListTodo, 
  MessageSquare, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Users, 
  Star 
} from 'lucide-react';

const LandingPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.get('events/');
        // Get first 3 events as a preview
        setEvents(response.data.slice(0, 3));
      } catch (err) {
        console.error("Error loading events", err);
      }
    };
    loadEvents();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      {/* Landing Navbar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 8%', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        backgroundColor: 'rgba(var(--card-rgb), 0.7)', 
        backdropFilter: 'blur(12px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: 800 }}>
          <BrainCircuit size={28} color="var(--accent-primary)" />
          <span style={{ background: 'linear-gradient(135deg, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EventAI
          </span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontWeight: 500, fontSize: '15px' }} className="nav-links">
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
          <a href="#events" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Explore Events</a>
          <a href="#testimonials" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Testimonials</a>
        </div>
        <div>
          {token ? (
            <button 
              className="btn-primary" 
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 600 }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14.5px' }}>Sign In</Link>
              <button 
                className="btn-primary" 
                style={{ padding: '10px 24px', fontSize: '14.5px', fontWeight: 600 }}
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '100px 8% 120px 8%', 
        textAlign: 'center',
        background: 'radial-gradient(circle at top, rgba(var(--accent-rgb), 0.08) 0%, transparent 60%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(var(--accent-rgb), 0.12)', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '24px', border: '1px solid rgba(var(--accent-rgb), 0.15)' }} className="animate-fade-in">
          <Sparkles size={14} /> Next-Gen Event Coordination
        </div>
        <h1 style={{ 
          fontSize: '64px', 
          fontWeight: 900, 
          lineHeight: '1.15', 
          maxWidth: '850px', 
          margin: '0 auto 24px auto',
          letterSpacing: '-1.5px',
          background: 'linear-gradient(135deg, var(--text-primary) 30%, #a855f7 70%, var(--accent-primary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Plan Smart Events <br />with Cognitive AI
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: 'var(--text-secondary)', 
          maxWidth: '620px', 
          margin: '0 auto 40px auto', 
          lineHeight: '1.6',
          fontWeight: 400
        }}>
          Organize professional conferences, weddings, concerts, or college fests using smart algorithms for venue discovery, crowd prediction, and automated timeline generation.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {token ? (
            <button 
              className="btn-primary" 
              style={{ padding: '14px 36px', fontSize: '16px', fontWeight: 700, borderRadius: '12px' }}
              onClick={() => navigate('/dashboard')}
            >
              Get Started Now
            </button>
          ) : (
            <>
              <button 
                className="btn-primary" 
                style={{ padding: '14px 36px', fontSize: '16px', fontWeight: 700, borderRadius: '12px' }}
                onClick={() => navigate('/register')}
              >
                Register as Attendee/Organizer
              </button>
              <button 
                style={{ 
                  padding: '14px 36px', 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => navigate('/login')}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 8%', backgroundColor: 'rgba(var(--card-rgb), 0.2)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Powered by Specialized Planning Engines
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '580px', margin: '0 auto' }}>
            EventAI replaces guesswork with machine intelligence, facilitating instant setup guides and robust predictions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', transition: 'all 0.3s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent-primary)', marginBottom: '24px' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Smart Venue Finder</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
              Input your guest capacity, city location, and budget constraints, and let our AI engine evaluate and recommend top local venues.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', transition: 'all 0.3s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '24px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Turnout Predictor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
              Utilizes event category, ticket pricing structure, and staging day to forecast probability ratings and expected crowd sizes.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', transition: 'all 0.3s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', marginBottom: '24px' }}>
              <ListTodo size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Itinerary Generator</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
              Automatically synthesizes timeline itineraries detailing check-ins, workshops, coffee sessions, and exit timings.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', transition: 'all 0.3s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', marginBottom: '24px' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Interactive AI Chatbot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
              Resolve staging details on the fly. Consult the chatbot for styling tips, coordinator check-lists, or custom theme advice.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="events" style={{ padding: '100px 8%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
              Popular Live Events
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              See what’s happening right now in the community.
            </p>
          </div>
          <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 600 }}>
            View All Events
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="event-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
                <div style={{ position: 'relative', height: '180px', backgroundColor: 'var(--border-color)' }}>
                  {event.banner ? (
                    <img src={`http://localhost:8000${event.banner}`} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      <Calendar size={48} style={{ opacity: 0.3 }} />
                    </div>
                  )}
                  <span className="badge badge-success" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>{event.category}</span>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{event.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' }}>
                    {event.description}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--accent-primary)" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time.substring(0, 5)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="var(--accent-primary)" />
                      <span>{event.venue}, {event.city}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '15px' }}>
                        {event.ticket_price > 0 ? `$${parseFloat(event.ticket_price).toFixed(2)}` : 'FREE'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Capacity: {event.crowd_limit} spots
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Pre-loading/Fallback Mock Cards
            [1, 2, 3].map(i => (
              <div key={i} className="glass-panel" style={{ height: '360px', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ width: '100%', height: '140px', background: 'var(--border-color)', borderRadius: '12px' }}></div>
                <div style={{ height: '20px', background: 'var(--border-color)', width: '60%', borderRadius: '4px' }}></div>
                <div style={{ height: '40px', background: 'var(--border-color)', width: '90%', borderRadius: '4px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ height: '16px', background: 'var(--border-color)', width: '30%', borderRadius: '4px' }}></div>
                  <div style={{ height: '16px', background: 'var(--border-color)', width: '20%', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={{ padding: '100px 8%', backgroundColor: 'rgba(var(--card-rgb), 0.2)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Trusted by Modern Coordinators
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px' }}>
            Hear from organizers who transformed their execution workflows.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div style={{ color: 'var(--warning)', display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              "The AI Venue Recommendation saved us days of calling halls in San Francisco. It suggested a scenic garden venue that fitted our guest buffer and budget down to the dollar!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: 'white' }}>
                SC
              </div>
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Sarah Chen</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Corporate Coordinator, TechCorp</p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div style={{ color: 'var(--warning)', display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              "The Crowd Turnout Predictor is surprisingly accurate! We adjusted our college concert ticket prices based on its advice, which increased our student turnout rate by almost 20%."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: 'white' }}>
                MD
              </div>
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Marcus Davis</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cultural Head, SF State University</p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
            <div style={{ color: 'var(--warning)', display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              "Generating a detailed itinerary takes seconds now. The timeline slots are well-spaced, and the planner notes help our stage staff coordinate mic checks and speaker transitions smoothly."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: 'white' }}>
                EL
              </div>
              <div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>Emily Larson</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Wedding Stylist, EverAfter Events</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 8%', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
          <BrainCircuit size={26} color="var(--accent-primary)" />
          <span>EventAI</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '24px' }}>
          © 2026 EventAI Planning Systems Inc. All rights reserved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Support Center</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
