import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Header from '../components/Header';
import { MapPin, Calendar, Clock, Users, ArrowLeft, ShieldAlert, Award, X } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`events/${id}/`);
        setEvent(response.data);
      } catch (err) {
        console.error("Error loading event details", err);
      }
      setLoading(false);
    };
    fetchEvent();
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

  return (
    <div className="main-layout">
      <Header title={event.title} />

      <div className="content-body">
        {/* Back Link */}
        <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          <span>Back to Event Hub</span>
        </Link>

        <div className="details-layout">
          {/* Main Info */}
          <div className="details-main">
            <div className="details-banner">
              {event.banner ? (
                <img src={event.banner} alt={event.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.8 }}></div>
              )}
            </div>

            <div className="details-content-card">
              <span className="details-category">{event.category}</span>
              <h1 className="details-title">{event.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <span>Hosted by <strong>{event.organizer_details?.username}</strong></span>
              </div>

              <p className="details-desc">{event.description}</p>

              <div className="details-info-grid">
                <div className="details-info-item">
                  <div className="stat-icon-wrapper"><Calendar size={18} /></div>
                  <div>
                    <div className="details-info-label">Date</div>
                    <div className="details-info-value">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper"><Clock size={18} /></div>
                  <div>
                    <div className="details-info-label">Start Time</div>
                    <div className="details-info-value">{event.time.substring(0, 5)}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper"><MapPin size={18} /></div>
                  <div>
                    <div className="details-info-label">Location / City</div>
                    <div className="details-info-value">{event.venue}, {event.city}</div>
                  </div>
                </div>

                <div className="details-info-item">
                  <div className="stat-icon-wrapper"><Users size={18} /></div>
                  <div>
                    <div className="details-info-label">Attendee Limit</div>
                    <div className="details-info-value">{event.crowd_limit} guests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div>
            <div className="booking-widget">
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
                <div className="qty-selector">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>-</button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(qty + 1)}>+</button>
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
                style={{ width: '100%', padding: '14px' }}
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
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Booking Confirmed!</h3>
              <button className="modal-close-btn" onClick={() => { setShowModal(false); navigate('/bookings'); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="qr-code-display">
              {bookingDetails.qr_code_image ? (
                <img src={`http://localhost:8000${bookingDetails.qr_code_image}`} alt="Ticket QR Code" />
              ) : (
                <div style={{ width: '200px', height: '200px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  QR Code Generating...
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              {event.title}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {new Date(event.date).toLocaleDateString()} at {event.time.substring(0, 5)}
            </p>

            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', textAlign: 'left', fontSize: '14px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ticket Holder:</span>
                <strong>{bookingDetails.user_details?.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                <strong>{bookingDetails.ticket_quantity} pass(es)</strong>
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

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px' }}
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
