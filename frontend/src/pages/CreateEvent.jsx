import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { Calendar, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Wedding', 'Seminar', 'Concert', 'College Fest', 'Corporate Event'];

const CreateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Seminar',
    date: '',
    time: '',
    city: '',
    venue: '',
    budget: '',
    ticket_price: '0.00',
    crowd_limit: '',
  });
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchEvent = async () => {
        setFetching(true);
        try {
          const response = await api.get(`events/${id}/`);
          const ev = response.data;
          setFormData({
            title: ev.title,
            description: ev.description,
            category: ev.category,
            date: ev.date,
            time: ev.time.substring(0, 5), // Format HH:MM
            city: ev.city,
            venue: ev.venue,
            budget: ev.budget,
            ticket_price: ev.ticket_price,
            crowd_limit: ev.crowd_limit
          });
        } catch (err) {
          console.error("Error loading event for editing", err);
          setError("Failed to load event details.");
        }
        setFetching(false);
      };
      fetchEvent();
    }
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBanner(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Multi-part form data to support file upload
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (banner) {
      data.append('banner', banner);
    }

    try {
      if (isEdit) {
        await api.put(`events/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('events/', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      navigate('/events');
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        setError(
          Object.entries(errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join('\n')
        );
      } else {
        setError(isEdit ? "Failed to update event. Please verify all inputs." : "Failed to create event. Please verify all inputs.");
      }
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="main-layout">
        <Header title="Staging - Edit Event" />
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

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title={isEdit ? "Staging - Edit Event" : "Staging - Create Event"} />

      <div className="content-body">
        <div className="form-card glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Calendar size={28} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{isEdit ? "Edit Event Details" : "Publish a New Event"}</h2>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input 
                type="text" 
                name="title"
                className="form-control" 
                placeholder="e.g. Annual Tech Symposium 2026"
                required
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                name="description"
                className="form-control" 
                rows="4"
                placeholder="Describe your event agenda, schedule information, or targets..."
                required
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category"
                  className="form-control" 
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Banner / Image</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  name="date"
                  className="form-control" 
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  name="time"
                  className="form-control" 
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  name="city"
                  className="form-control" 
                  placeholder="e.g. Chicago"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue Address</label>
                <input 
                  type="text" 
                  name="venue"
                  className="form-control" 
                  placeholder="e.g. 101 Convention Center"
                  required
                  value={formData.venue}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allocated Budget (USD)</label>
                <input 
                  type="number" 
                  name="budget"
                  className="form-control" 
                  placeholder="e.g. 20000"
                  required
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Price (USD)</label>
                <input 
                  type="number" 
                  name="ticket_price"
                  step="0.01"
                  className="form-control" 
                  placeholder="0.00 for FREE"
                  required
                  value={formData.ticket_price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Crowd Turnout Limit (Attendees)</label>
                <input 
                  type="number" 
                  name="crowd_limit"
                  className="form-control" 
                  placeholder="e.g. 300"
                  required
                  value={formData.crowd_limit}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-btn-container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/events')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (isEdit ? 'Saving changes...' : 'Creating event...') : (isEdit ? 'Save Changes' : 'Publish Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
