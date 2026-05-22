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
    <div className="main-layout">
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
          <div className="table-card">
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
          <div className="modal-content" style={{ position: 'relative' }}>
            <div className="modal-header">
              <h3 className="modal-title">Admission Ticket Pass</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="qr-code-display">
              {activeBooking.qr_code_image ? (
                <img src={`http://localhost:8000${activeBooking.qr_code_image}`} alt="Ticket QR Code" />
              ) : (
                <div style={{ width: '200px', height: '200px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  QR Code Generating...
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              {activeBooking.event_details?.title}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {activeBooking.event_details?.venue}, {activeBooking.event_details?.city}<br />
              {new Date(activeBooking.event_details?.date).toLocaleDateString()} at {activeBooking.event_details?.time.substring(0, 5)}
            </p>

            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '12px', textAlign: 'left', fontSize: '14px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Booking Reference:</span>
                <strong>#BK-{activeBooking.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ticket Holder:</span>
                <strong>{activeBooking.user_details?.username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                <strong>{activeBooking.ticket_quantity} pass(es)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Seats:</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{activeBooking.seat_numbers}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <strong style={{ color: 'var(--success)' }}>${parseFloat(activeBooking.total_price).toFixed(2)}</strong>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Scan QR code at the entrance for automated check-in and seat verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
