import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { Search, MapPin, Calendar as CalendarIcon, Users, Tag } from 'lucide-react';

const CATEGORIES = ['Wedding', 'Seminar', 'Concert', 'College Fest', 'Corporate Event'];
const CITIES = ['Chicago', 'San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Boston', 'Austin'];

export const getEventBannerUrl = (event) => {
  if (event.banner) {
    if (event.banner.startsWith('http://') || event.banner.startsWith('https://')) {
      return event.banner;
    }
    return `http://127.0.0.1:8000${event.banner}`;
  }
  
  const cat = event.category ? event.category.toLowerCase() : '';
  if (cat.includes('wedding')) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('seminar')) {
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('concert')) {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('fest')) {
    return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80';
  }
  if (cat.includes('corporate')) {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
};

const getCategoryBadgeClass = (category) => {
  const cat = category ? category.toLowerCase() : '';
  if (cat.includes('wedding')) return 'badge-cat badge-cat-wedding';
  if (cat.includes('seminar')) return 'badge-cat badge-cat-seminar';
  if (cat.includes('concert')) return 'badge-cat badge-cat-concert';
  if (cat.includes('fest')) return 'badge-cat badge-cat-fest';
  if (cat.includes('corporate')) return 'badge-cat badge-cat-corporate';
  return 'badge badge-info';
};

const EventHub = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (city) params.city = city;

      const response = await api.get('events/', { params });
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, city]);

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title="Discover Events" />

      <div className="content-body">
        {/* Search & Filters */}
        <div className="filters-bar glass-panel animate-scale-in" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '32px' }}>
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '48px', height: '46px' }}
              placeholder="Search events by title or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
            style={{ height: '46px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            style={{ height: '46px' }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All Cities</option>
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        ) : (
          <div>
            {events.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', animation: 'scaleIn 0.3s ease-out' }}>
                <CalendarIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Events Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Try modifying your filters or search keywords.</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event.id} className="event-card glass-panel" style={{ animation: 'fadeInUp 0.3s ease-out both' }}>
                    <div className="event-card-banner">
                      <img src={getEventBannerUrl(event)} alt={event.title} style={{ transition: 'transform 0.4s ease', width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className={getCategoryBadgeClass(event.category)} style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
                        {event.category}
                      </span>
                    </div>
                    
                    <div className="event-card-body">
                      <h3 className="event-card-title" style={{ fontSize: '18px', fontWeight: 700 }}>{event.title}</h3>
                      <p className="event-card-desc">{event.description}</p>
                      
                      <div className="event-card-meta">
                        <div className="event-card-meta-item">
                          <CalendarIcon size={14} color="var(--accent-primary)" />
                          <span>{new Date(event.date).toLocaleDateString()} at {event.time.substring(0, 5)}</span>
                        </div>
                        <div className="event-card-meta-item">
                          <MapPin size={14} color="var(--accent-primary)" />
                          <span>{event.venue}, {event.city}</span>
                        </div>
                        <div className="event-card-meta-item">
                          <Users size={14} color="var(--accent-primary)" />
                          <span>Capacity: {event.crowd_limit} people</span>
                        </div>
                      </div>

                      <div className="event-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                        <div className="event-card-price" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                          {parseFloat(event.ticket_price) === 0 ? 'FREE' : `$${parseFloat(event.ticket_price).toFixed(2)}`}
                        </div>
                        <Link to={`/events/${event.id}`} className="btn-primary" style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '13px', borderRadius: '10px' }}>
                          Get Tickets
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHub;

