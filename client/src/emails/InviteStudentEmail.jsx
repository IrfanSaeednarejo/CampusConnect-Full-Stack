// InviteStudentEmail.jsx
// Email template for student invitations to join societies/study groups
// Used to invite students to join communities on CampusNexus

import React from 'react';

export default function InviteStudentEmail({ invitedStudentName, inviterName, inviterRole, communityName, communityType, communityDescription, joinLink, customMessage }) {
  return (
    <div style={emailContainerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🎓 You're Invited!</h1>
      </div>

      <div style={contentStyle}>
        <p style={paragraphStyle}>
          Hi {invitedStudentName},
        </p>

        <p style={paragraphStyle}>
          <strong>{inviterName}</strong> ({inviterRole}) has invited you to join <strong>{communityName}</strong> on CampusNexus!
        </p>

        {customMessage && (
          <div style={messageBoxStyle}>
            <p style={messageHeaderStyle}>Personal Message from {inviterName}:</p>
            <p style={messageContentStyle}>"{customMessage}"</p>
          </div>
        )}

        <div style={communityCardStyle}>
          <h2 style={communityTitleStyle}>{communityName}</h2>

          <div style={communityDetailsStyle}>
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>Type:</span>
              <p style={detailValueStyle}>{communityType}</p>
            </div>

            {communityDescription && (
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>About:</span>
                <p style={detailValueStyle}>{communityDescription}</p>
              </div>
            )}
          </div>
        </div>

        <p style={paragraphStyle}>
          CampusNexus communities help you:
        </p>

        <ul style={listStyle}>
          <li>Connect with fellow students who share your interests</li>
          <li>Collaborate on projects and group studies</li>
          <li>Attend exclusive community events</li>
          <li>Share resources and support each other</li>
          <li>Build lasting friendships and professional networks</li>
        </ul>

        <div style={ctaContainerStyle}>
          <a
            href={joinLink}
            style={ctaButtonStyle}
          >
            Accept Invitation & Join
          </a>
        </div>

        <p style={paragraphStyle}>
          Or copy and paste this link in your browser:
        </p>
        <p style={linkStyle}>{joinLink}</p>

        <p style={paragraphStyle}>
          If you're not interested in joining, you can simply ignore this email or decline the invitation in your CampusNexus account.
        </p>

        <hr style={dividerStyle} />

        <p style={footerStyle}>
          Best regards,<br />
          <strong>CampusNexus Community Team</strong>
        </p>

        <p style={disclaimerStyle}>
          You received this email because you were invited to a community on CampusNexus. 
          You can manage your invitations in your account settings.
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

const messageBoxStyle = {
  backgroundColor: '#f0f7ff',
  border: '1px solid #b1d7ff',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '20px',
};

const messageHeaderStyle = {
  margin: '0 0 8px 0',
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#0969da',
};

const messageContentStyle = {
  margin: '0',
  fontSize: '14px',
  color: '#333',
  fontStyle: 'italic',
};

const communityCardStyle = {
  backgroundColor: '#f6f8fa',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const communityTitleStyle = {
  margin: '0 0 16px 0',
  color: '#238636',
  fontSize: '18px',
};

const communityDetailsStyle = {
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

const listStyle = {
  marginBottom: '20px',
  paddingLeft: '20px',
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
