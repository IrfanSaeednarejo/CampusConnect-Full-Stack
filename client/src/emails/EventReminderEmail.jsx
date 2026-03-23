// EventReminderEmail.jsx
// Email template for event reminders
// Used to notify students about upcoming events they registered for

import React from 'react';

export default function EventReminderEmail({ studentName, eventTitle, eventDate, eventTime, eventLocation, eventImage, registrationDeadline }) {
  return (
    <div style={emailContainerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📅 Event Reminder</h1>
      </div>

      <div style={contentStyle}>
        <p style={paragraphStyle}>
          Hi {studentName},
        </p>

        <p style={paragraphStyle}>
          This is a friendly reminder about an event you registered for:
        </p>

        {eventImage && (
          <div style={imageContainerStyle}>
            <img
              src={eventImage}
              alt={eventTitle}
              style={eventImageStyle}
            />
          </div>
        )}

        <div style={eventCardStyle}>
          <h2 style={eventTitleStyle}>{eventTitle}</h2>

          <div style={eventDetailsStyle}>
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>📅 Date & Time:</span>
              <p style={detailValueStyle}>
                {eventDate} at {eventTime}
              </p>
            </div>

            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>📍 Location:</span>
              <p style={detailValueStyle}>
                {eventLocation}
              </p>
            </div>

            {registrationDeadline && (
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>⏰ Registration Deadline:</span>
                <p style={detailValueStyle}>
                  {registrationDeadline}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={ctaContainerStyle}>
          <a
            href="https://campusconnect.com/events"
            style={ctaButtonStyle}
          >
            View Event Details
          </a>
        </div>

        <p style={paragraphStyle}>
          We look forward to seeing you there! If you have any questions about the event, feel free to contact the event organizers through the CampusConnect platform.
        </p>

        <hr style={dividerStyle} />

        <p style={footerStyle}>
          Best regards,<br />
          <strong>CampusConnect Events Team</strong>
        </p>

        <p style={disclaimerStyle}>
          You received this email because you registered for this event. 
          You can manage your event preferences in your account settings.
        </p>
      </div>
    </div>
  );
}

// Styles for email template
const emailContainerStyle = {
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  lineHeight: '1.6',
  color: '#333',
  backgroundColor: '#f5f5f5',
  padding: '20px',
};

const headerStyle = {
  backgroundColor: '#238636',
  color: 'white',
  padding: '20px',
  textAlign: 'center',
  borderRadius: '8px 8px 0 0',
};

const titleStyle = {
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
};

const contentStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const paragraphStyle = {
  marginBottom: '16px',
  fontSize: '14px',
};

const imageContainerStyle = {
  textAlign: 'center',
  margin: '20px 0',
};

const eventImageStyle = {
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  maxHeight: '300px',
};

const eventCardStyle = {
  backgroundColor: '#f6f8fa',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const eventTitleStyle = {
  margin: '0 0 16px 0',
  color: '#238636',
  fontSize: '18px',
};

const eventDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const detailItemStyle = {
  marginBottom: '8px',
};

const detailLabelStyle = {
  fontWeight: 'bold',
  color: '#333',
  fontSize: '13px',
};

const detailValueStyle = {
  margin: '4px 0 0 0',
  fontSize: '14px',
  color: '#666',
};

const ctaContainerStyle = {
  textAlign: 'center',
  margin: '30px 0',
};

const ctaButtonStyle = {
  display: 'inline-block',
  backgroundColor: '#238636',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
};

const dividerStyle = {
  backgroundColor: '#e8e8e8',
  border: 'none',
  height: '1px',
  margin: '20px 0',
};

const footerStyle = {
  fontSize: '12px',
  color: '#666',
  marginTop: '16px',
};

const disclaimerStyle = {
  fontSize: '11px',
  color: '#999',
  marginTop: '16px',
  fontStyle: 'italic',
};
