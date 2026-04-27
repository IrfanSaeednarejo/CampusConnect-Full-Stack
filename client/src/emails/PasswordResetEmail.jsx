// PasswordResetEmail.jsx
// Email template for password reset confirmation
// Used when users request to reset their password

import React from 'react';

export default function PasswordResetEmail({ userEmail, resetLink, expiryTime }) {
  return (
    <div style={emailContainerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Password Reset Request</h1>
      </div>

      <div style={contentStyle}>
        <p style={paragraphStyle}>
          Hello,
        </p>

        <p style={paragraphStyle}>
          We received a request to reset the password for your CampusNexus account associated with <strong>{userEmail}</strong>.
        </p>

        <div style={ctaContainerStyle}>
          <a
            href={resetLink}
            style={ctaButtonStyle}
          >
            Reset Your Password
          </a>
        </div>

        <p style={paragraphStyle}>
          Or copy and paste this link in your browser:
        </p>
        <p style={linkStyle}>{resetLink}</p>

        <p style={warningStyle}>
          <strong>Important:</strong> This link will expire in {expiryTime || '24 hours'}. 
          If you did not request a password reset, please ignore this email or contact our support team.
        </p>

        <p style={paragraphStyle}>
          For security reasons, we will never ask you for your password via email.
        </p>

        <hr style={dividerStyle} />

        <p style={footerStyle}>
          Best regards,<br />
          <strong>CampusNexus Team</strong>
        </p>

        <p style={disclaimerStyle}>
          This is an automated message. Please do not reply to this email.
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

const linkStyle = {
  wordBreak: 'break-all',
  color: '#0969da',
  fontSize: '12px',
  backgroundColor: '#f6f8fa',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '16px',
};

const warningStyle = {
  backgroundColor: '#fff8f1',
  border: '1px solid #ffb367',
  borderRadius: '4px',
  padding: '12px',
  fontSize: '13px',
  marginBottom: '16px',
  color: '#ae5a0b',
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
