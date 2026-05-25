import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api, useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Ticket, Eye, X, Download } from 'lucide-react';

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

  const downloadPDF = (booking) => {
    const element = document.getElementById('ticket-download-area');
    if (!element) return;
    
    html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: '#111827' // dark background matches dark theme aesthetic
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 110; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 50, 30, imgWidth, imgHeight);
      pdf.save(`Ticket_BK-${booking.id}.pdf`);
    }).catch(err => {
      console.error("Error generating PDF", err);
    });
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
              <div id="ticket-download-area" className="ticket-pass animate-scale-in" style={{ padding: '24px', borderRadius: '16px', background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="ticket-header" style={{ marginBottom: '16px', borderBottom: '1px dashed rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#ffffff' }}>Admission Ticket</h3>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>EventAI Smart Pass</div>
                </div>
                
                <div className="ticket-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="qr-code-display" style={{ marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px', background: 'white' }}>
                    {activeBooking.qr_code_image ? (
                      <img src={`http://localhost:8000${activeBooking.qr_code_image}`} alt="Ticket QR Code" style={{ display: 'block', width: '160px', height: '160px' }} />
                    ) : (
                      <div style={{ width: '160px', height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        Generating Pass...
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: '#ffffff' }}>
                    {activeBooking.event_details?.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px', textAlign: 'center', lineHeight: '1.4' }}>
                    {activeBooking.event_details?.venue}, {activeBooking.event_details?.city}<br />
                    {new Date(activeBooking.event_details?.date).toLocaleDateString()} at {activeBooking.event_details?.time.substring(0, 5)}
                  </p>
 
                  <div style={{ width: '100%', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '16px', fontSize: '13px', textAlign: 'left', color: '#d1d5db' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#9ca3af' }}>Reference ID:</span>
                      <strong style={{ color: '#ffffff' }}>#BK-{activeBooking.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#9ca3af' }}>Ticket Holder:</span>
                      <strong style={{ color: '#ffffff' }}>{activeBooking.user_details?.username}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#9ca3af' }}>Quantity:</span>
                      <strong style={{ color: '#ffffff' }}>{activeBooking.ticket_quantity} pass(es)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#9ca3af' }}>Seats:</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{activeBooking.seat_numbers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#9ca3af' }}>Amount Paid:</span>
                      <strong style={{ color: '#10b981' }}>${parseFloat(activeBooking.total_price).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
              onClick={() => downloadPDF(activeBooking)}
            >
              <Download size={16} />
              <span>Download PDF Ticket</span>
            </button>

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

