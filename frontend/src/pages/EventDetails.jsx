import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Header from '../components/Header';
import { MapPin, Calendar, Clock, Users, ArrowLeft, ShieldAlert, Award, X, Edit3, Trash2 } from 'lucide-react';
import { getEventBannerUrl } from './EventHub';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSubmitLoading, setFeedbackSubmitLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`events/${id}/`);
      setEvent(response.data);
    } catch (err) {
      console.error("Error loading event details", err);
    }
    setLoading(false);
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get(`feedback/?event=${id}`);
      setFeedbacks(response.data);
    } catch (err) {
      console.error("Error loading feedback", err);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchFeedbacks();
  }, [id]);

  const handleBook = async () => {
    setError('');
    setBookingLoading(true);
    try {
      const response = await api.post('bookings/', {
        event: event.id,
        ticket_quantity: qty
      });
      setBookingDetails(response.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Booking failed. Please try again.");
    }
    setBookingLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event? This will cancel all bookings and remove the event permanently.")) {
      try {
        await api.delete(`events/${id}/`);
        navigate('/events');
      } catch (err) {
        console.error("Error deleting event", err);
        setError("Failed to delete event. You may not have permission.");
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSubmitLoading(true);
    try {
      await api.post('feedback/', {
        event: event.id,
        rating: feedbackRating,
        comment: feedbackComment
      });
      setFeedbackComment('');
      setFeedbackRating(5);
      fetchFeedbacks();
    } catch (err) {
      console.error("Error submitting feedback", err);
      setFeedbackError("Failed to submit feedback. You must have an account.");
    }
    setFeedbackSubmitLoading(false);
  };

  if (loading) {
    return (
      <div className="main-layout">
        <Header title="Loading Event..." />
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

  if (!event) {
    return (
      <div className="main-layout">
        <Header title="Event Not Found" />
        <div className="content-body" style={{ textAlign: 'center', padding: '60px' }}>
          <h3>Event not found or has been deleted.</h3>
          <Link to="/events" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
            Go back to Event Hub
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(event.ticket_price);
  const total = price * qty;
  const isOrganizer = user && (user.role === 'admin' || user.id === event.organizer);

  const getCategoryBadgeClass = (category) => {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('wedding')) return 'badge-cat badge-cat-wedding';
    if (cat.includes('seminar')) return 'badge-cat badge-cat-seminar';
    if (cat.includes('concert')) return 'badge-cat badge-cat-concert';
    if (cat.includes('fest')) return 'badge-cat badge-cat-fest';
    if (cat.includes('corporate')) return 'badge-cat badge-cat-corporate';
    return 'badge badge-info';
  };

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title={event.title} />

      <div className="content-body">
        {/* Navigation / Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={16} />
            <span>Back to Event Hub</span>
          </Link>

          {isOrganizer && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                to={`/events/${event.id}/edit`} 
                className="btn-secondary" 
                style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
              >
                <Edit3 size={14} />
                <span>Edit Event</span>
              </Link>
              <button 
                onClick={handleDelete} 
                className="btn-logout" 
                style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
              >
                <Trash2 size={14} />
                <span>Delete Event</span>
              </button>
            </div>
          )}
        </div>

        <div className="details-layout">
          {/* Main Info */}
          <div className="details-main animate-scale-in">
            <div className="details-banner glass-panel">
              <img src={getEventBannerUrl(event)} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="details-content-card glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span className={getCategoryBadgeClass(event.category)}>
                  {event.category}
                </span>
                
                {/* Remaining Seats Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {event.crowd_limit - (event.booked_count || 0) <= 0 ? (
                    <span className="badge badge-danger">SOLD OUT</span>
                  ) : (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={12} />
                      {event.crowd_limit - (event.booked_count || 0)} spots left
                    </span>
                  )}
                </div>
              </div>

              <h1 className="details-title" style={{ marginTop: '16px', marginBottom: '8px' }}>{event.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <span>Hosted by <strong>{event.organizer_details?.username}</strong></span>
              </div>

              <p className="details-desc" style={{ marginBottom: '28px' }}>{event.description}</p>

              <div className="details-info-grid" style={{ marginBottom: '32px' }}>
                <div className="details-info-item">
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(var(--accent-rgb), 0.12)' }}><Calendar size={18} /></div>
                  <div>
                    <div className="details-info-label">Date</div>
                    <div className="details-info-value">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(var(--accent-rgb), 0.12)' }}><Clock size={18} /></div>
                  <div>
                    <div className="details-info-label">Time</div>
                    <div className="details-info-value">{event.time.substring(0, 5)}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(var(--accent-rgb), 0.12)' }}><MapPin size={18} /></div>
                  <div>
                    <div className="details-info-label">Venue</div>
                    <div className="details-info-value">{event.venue}, {event.city}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(var(--accent-rgb), 0.12)' }}><Users size={18} /></div>
                  <div>
                    <div className="details-info-label">Capacity</div>
                    <div className="details-info-value">{event.crowd_limit} People ({event.booked_count || 0} registered)</div>
                  </div>
                </div>
              </div>

              {/* Event Timeline / Itinerary section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '28px', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="var(--accent-primary)" />
                  Event Itinerary Timeline
                </h3>
                
                <div style={{ 
                  position: 'relative', 
                  paddingLeft: '24px', 
                  borderLeft: '2px dashed var(--accent-primary)', 
                  marginLeft: '8px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px' 
                }}>
                  {(() => {
                    const timeline = (() => {
                      const cat = event.category ? event.category.toLowerCase() : '';
                      let startHour = 18;
                      let startMin = 0;
                      try {
                        const parts = event.time.split(':');
                        startHour = parseInt(parts[0]);
                        startMin = parseInt(parts[1]);
                      } catch (e) {}

                      const formatTime = (h, m) => {
                        const hh = h % 24;
                        const ampm = hh >= 12 ? 'PM' : 'AM';
                        const displayHour = hh % 12 === 0 ? 12 : hh % 12;
                        const displayMin = m < 10 ? `0${m}` : m;
                        return `${displayHour}:${displayMin} ${ampm}`;
                      };

                      if (cat.includes('wedding')) {
                        return [
                          { time: formatTime(startHour, startMin), activity: "Guests Arrival & Welcome Drinks" },
                          { time: formatTime(startHour + 1, startMin), activity: "Vows Exchange & Wedding Ceremonies" },
                          { time: formatTime(startHour + 2, startMin), activity: "Photoshoots & Toast Speeches" },
                          { time: formatTime(startHour + 3, startMin), activity: "Grand Banquet Dinner & DJ Dance Floor" }
                        ];
                      } else if (cat.includes('seminar') || cat.includes('corporate') || cat.includes('business')) {
                        return [
                          { time: formatTime(startHour, startMin), activity: "Registrations Desk opens & Badge pickup" },
                          { time: formatTime(startHour, startMin + 30), activity: "Keynote Address & Guest Speakers Welcome" },
                          { time: formatTime(startHour + 1, startMin + 45), activity: "Core Presentations & Panel Discussions" },
                          { time: formatTime(startHour + 2, startMin + 45), activity: "Interactive Q&A Session & Coffee Networking" }
                        ];
                      } else if (cat.includes('concert') || cat.includes('music')) {
                        return [
                          { time: formatTime(startHour, startMin), activity: "Doors Open & Security Check-In Scans" },
                          { time: formatTime(startHour + 1, startMin), activity: "Opening Artist / Live DJ Set" },
                          { time: formatTime(startHour + 2, startMin + 15), activity: "Main Performance Live Act" },
                          { time: formatTime(startHour + 4, startMin), activity: "Merchandise Clearance & Event Close" }
                        ];
                      } else {
                        return [
                          { time: formatTime(startHour, startMin), activity: "Inaugural Ceremony & Lighting of Lamp" },
                          { time: formatTime(startHour + 1, startMin), activity: "Cultural Stage Competitions & Social Panels" },
                          { time: formatTime(startHour + 2, startMin + 30), activity: "Celebrity Guest Spotlights / Concert" },
                          { time: formatTime(startHour + 4, startMin), activity: "Awards Announcements & Closing Speeches" }
                        ];
                      }
                    })();

                    return timeline.map((item, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        {/* Dot node */}
                        <div style={{ 
                          position: 'absolute', 
                          left: '-30.5px', 
                          top: '3px', 
                          width: '9px', 
                          height: '9px', 
                          borderRadius: '50%', 
                          background: 'var(--accent-primary)', 
                          border: '3px solid var(--bg-secondary)', 
                          boxSizing: 'content-box' 
                        }}></div>
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', minWidth: '70px' }}>
                            {item.time}
                          </span>
                          <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {item.activity}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Organizer Info Card */}
              <div style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                background: 'rgba(var(--card-rgb), 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--accent-primary), #a855f7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white', 
                  fontWeight: 700,
                  fontSize: '15px' 
                }}>
                  {event.organizer_details?.username?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>EVENT HOST</div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>{event.organizer_details?.username}</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>Contact: {event.organizer_details?.email}</p>
                </div>
              </div>
            </div>

            {/* Feedback / Review Section */}
            <div className="details-content-card glass-panel" style={{ padding: '32px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--accent-primary)" />
                Feedback & Attendee Reviews
              </h3>
              
              {/* Existing Reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                {feedbacks.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>No reviews yet. Be the first to share your feedback!</p>
                ) : (
                  feedbacks.map((fb) => (
                    <div key={fb.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{fb.user_details?.username}</span>
                        <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                        </span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{fb.comment}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Review Submission Form */}
              {user && (
                <form onSubmit={handleFeedbackSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, marginBottom: '16px' }}>Write a Review</h4>
                  
                  {feedbackError && (
                    <div className="alert alert-danger" style={{ marginBottom: '16px', padding: '10px 14px' }}>
                      <span style={{ fontSize: '13px' }}>{feedbackError}</span>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Rating</label>
                    <select 
                      className="form-control" 
                      style={{ height: '40px', width: '120px' }}
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Your Feedback</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="Share your thoughts about this event's organization, venue, schedule, or presentation..."
                      required
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '10px' }} disabled={feedbackSubmitLoading}>
                    {feedbackSubmitLoading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <div>
            <div className="booking-widget glass-panel">
              <div className="booking-price-header">
                <span className="booking-price-label">Ticket Cost</span>
                <span className="booking-price-value">{price === 0 ? 'FREE' : `$${price.toFixed(2)}`}</span>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                  <ShieldAlert size={16} />
                  <span style={{ fontSize: '12px' }}>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Quantity</label>
                <div className="qty-selector" style={{ background: 'var(--input-bg)' }}>
                  <button className="qty-btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>-</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>

              <div className="booking-summary-row">
                <span>Subtotal</span>
                <span>${(price * qty).toFixed(2)}</span>
              </div>
              <div className="booking-summary-row">
                <span>Booking Fees</span>
                <span>$0.00</span>
              </div>

              <div className="booking-total-row">
                <span>Grand Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px', boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)' }}
                onClick={handleBook}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing Ticket...' : 'Secure My Spot'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Booking Modal */}
      {showModal && bookingDetails && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '420px', padding: '24px 32px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Booking Confirmed!</h3>
              <button className="modal-close-btn" onClick={() => { setShowModal(false); navigate('/bookings'); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="ticket-wrapper">
              <div className="ticket-pass animate-scale-in">
                <div className="ticket-header">
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Admission Ticket</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>EventAI Smart Pass</div>
                </div>
                
                <div className="ticket-body">
                  <div className="qr-code-display" style={{ marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px', background: 'white' }}>
                    {bookingDetails.qr_code_image ? (
                      <img src={`http://localhost:8000${bookingDetails.qr_code_image}`} alt="Ticket QR Code" style={{ display: 'block', width: '160px', height: '160px' }} />
                    ) : (
                      <div style={{ width: '160px', height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        Generating Pass...
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {event.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center', lineHeight: '1.4' }}>
                    {event.venue}, {event.city}<br />
                    {new Date(event.date).toLocaleDateString()} at {event.time.substring(0, 5)}
                  </p>

                  <div style={{ width: '100%', borderTop: '1px dashed var(--border-color)', paddingTop: '16px', fontSize: '13.5px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ticket Holder:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{bookingDetails.user_details?.username}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{bookingDetails.ticket_quantity} pass(es)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Seat Assignments:</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{bookingDetails.seat_numbers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Cost:</span>
                      <strong style={{ color: 'var(--success)' }}>${parseFloat(bookingDetails.total_price).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '24px' }}
              onClick={() => { setShowModal(false); navigate('/bookings'); }}
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
