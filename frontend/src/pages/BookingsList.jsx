import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Ticket, Eye, X } from 'lucide-react';

const BookingsList = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('bookings/');
      setBookings(response.data);
    } catch (err) {
      console.error("Error loading bookings", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openTicket = (booking) => {
    setActiveBooking(booking);
    setShowModal(true);
  };

  return (
    <div className="main-layout animate-fade-in-up">
      <Header title={user.role === 'user' ? 'My Bookings & Passes' : 'Managed Bookings Feed'} />

      <div className="content-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        ) : (
          <div className="table-card glass-panel">

            <div className="table-header-container">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {user.role === 'user' ? 'Purchased Tickets' : 'Participant Attendee Bookings'}
              </h3>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Date & Time</th>
                    {user.role !== 'user' && <th>Attendee</th>}
                    <th>Qty</th>
                    <th>Total Price</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={user.role === 'user' ? '7' : '8'} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                        <Ticket size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} /><br />
                        No bookings recorded. Discover events in the Event Hub!
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>#BK-{booking.id}</strong></td>
                        <td>{booking.event_details?.title}</td>
                        <td>
                          {new Date(booking.event_details?.date).toLocaleDateString()} at {booking.event_details?.time.substring(0, 5)}
                        </td>
                        {user.role !== 'user' && (
                          <td>{booking.user_details?.username} ({booking.user_details?.email})</td>
                        )}
                        <td>{booking.ticket_quantity}</td>
                        <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>${parseFloat(booking.total_price).toFixed(2)}</span></td>
                        <td><code>{booking.seat_numbers}</code></td>
                        <td>
                          <button 
                            className="btn-details" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                            onClick={() => openTicket(booking)}
                          >
                            <Eye size={14} />
                            <span>Ticket Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {showModal && activeBooking && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '420px', padding: '24px 32px' }}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h3 className="modal-title">Ticket Pass</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
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
                    {activeBooking.qr_code_image ? (
                      <img src={`http://localhost:8000${activeBooking.qr_code_image}`} alt="Ticket QR Code" style={{ display: 'block', width: '160px', height: '160px' }} />
                    ) : (
                      <div style={{ width: '160px', height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        Generating Pass...
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {activeBooking.event_details?.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center', lineHeight: '1.4' }}>
                    {activeBooking.event_details?.venue}, {activeBooking.event_details?.city}<br />
                    {new Date(activeBooking.event_details?.date).toLocaleDateString()} at {activeBooking.event_details?.time.substring(0, 5)}
                  </p>

                  <div style={{ width: '100%', borderTop: '1px dashed var(--border-color)', paddingTop: '16px', fontSize: '13.5px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Reference ID:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>#BK-{activeBooking.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ticket Holder:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{activeBooking.user_details?.username}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{activeBooking.ticket_quantity} pass(es)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Seats:</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{activeBooking.seat_numbers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                      <strong style={{ color: 'var(--success)' }}>${parseFloat(activeBooking.total_price).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
              Scan QR code at the entrance for automated check-in and seat verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;

