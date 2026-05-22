import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { Search, MapPin, Calendar as CalendarIcon, Users, Tag } from 'lucide-react';

const CATEGORIES = ['Wedding', 'Seminar', 'Concert', 'College Fest', 'Corporate Event'];
const CITIES = ['Chicago', 'San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Boston', 'Austin'];

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
    // Debounce search/filters
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, city]);

  return (
    <div className="main-layout">
      <Header title="Discover Events" />

      <div className="content-body">
        {/* Search & Filters */}
        <div className="filters-bar">
          <div className="search-input-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '48px' }}
              placeholder="Search events by title or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="filter-select"
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
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <CalendarIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Events Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Try modifying your filters or search keywords.</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-card-banner">
                      {event.banner ? (
                        <img src={event.banner} alt={event.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.8 }}></div>
                      )}
                      <span className="event-card-category">{event.category}</span>
                    </div>
                    
                    <div className="event-card-body">
                      <h3 className="event-card-title">{event.title}</h3>
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

                      <div className="event-card-footer">
                        <div className="event-card-price">
                          {parseFloat(event.ticket_price) === 0 ? 'FREE' : `$${parseFloat(event.ticket_price).toFixed(2)}`}
                        </div>
                        <Link to={`/events/${event.id}`} className="btn-details">
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
