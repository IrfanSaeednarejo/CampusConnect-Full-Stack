/**
 * emailTemplates.js
 * 
 * Central HTML template factory for all CampusConnect transactional emails.
 * Design system: dark-themed, matching the platform's #0d1117 / #161b22 / #1dc964 palette.
 * Each export is a pure function: (data) => html string
 */

// ─── Design Tokens ──────────────────────────────────────────────────────────
const BG       = "#0d1117";
const SURFACE  = "#161b22";
const BORDER   = "#30363d";
const ACCENT   = "#1dc964";
const TEXT     = "#e6edf3";
const MUTED    = "#8b949e";
const SUBTLE   = "#c9d1d9";
const YEAR     = new Date().getFullYear();
const CLIENT   = process.env.CLIENT_URL || "http://localhost:5173";

// ─── Shared Layout ───────────────────────────────────────────────────────────
const layout = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>CampusConnect</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center" style="padding:40px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" style="background:${SURFACE};border-radius:12px;border:1px solid ${BORDER};overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${BG};padding:24px 32px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:22px;font-weight:800;color:${TEXT};letter-spacing:-0.5px;">
              Campus<span style="color:${ACCENT};">Connect</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid ${BORDER};text-align:center;">
            <p style="margin:0;font-size:11px;color:${MUTED};line-height:1.6;">
              © ${YEAR} CampusConnect · You received this because you have an account on CampusConnect.<br>
              If you didn't expect this email, you can safely ignore it.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Building Blocks ─────────────────────────────────────────────────────────
const h1  = (t) => `<h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:${TEXT};line-height:1.3;">${t}</h1>`;
const p   = (t) => `<p  style="margin:10px 0;font-size:15px;color:${SUBTLE};line-height:1.65;">${t}</p>`;
const btn = (href, label) => `
  <table style="margin:24px 0 0;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="background:${ACCENT};border-radius:8px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;color:#0d1117;font-weight:700;font-size:15px;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
const divider = () => `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;">`;
const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 12px;color:${MUTED};font-size:13px;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;color:${TEXT};font-size:13px;">${value}</td>
  </tr>`;
const infoBox = (rows) => `
  <table style="width:100%;background:${BG};border-radius:8px;border:1px solid ${BORDER};margin:20px 0;" cellpadding="0" cellspacing="0">
    ${rows}
  </table>`;

// ─── Templates ───────────────────────────────────────────────────────────────

/**
 * Sent when a new user registers — contains email verification link.
 */
export const welcomeVerificationEmail = ({ firstName, verifyUrl }) =>
  layout(`
    ${h1(`Welcome to CampusConnect, ${firstName}! 🎉`)}
    ${p("You're almost there! Click below to verify your email address and activate your account.")}
    ${btn(verifyUrl, "Verify My Email")}
    ${divider()}
    ${p(`This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.`)}
  `);

/**
 * Sent when a user requests a password reset.
 */
export const passwordResetEmail = ({ firstName, resetUrl }) =>
  layout(`
    ${h1("Password Reset Request 🔑")}
    ${p(`Hi <strong>${firstName}</strong>, we received a request to reset the password for your CampusConnect account.`)}
    ${btn(resetUrl, "Reset My Password")}
    ${divider()}
    ${p("This link expires in <strong>1 hour</strong>. If you didn't request a reset, your account is safe — no action needed.")}
  `);

/**
 * Sent after a password has been successfully changed.
 */
export const passwordChangedEmail = ({ firstName }) =>
  layout(`
    ${h1("Password Changed ✅")}
    ${p(`Hi <strong>${firstName}</strong>, your CampusConnect password was successfully changed.`)}
    ${p("If this was you, no further action is needed.")}
    ${p("If you did <strong>not</strong> make this change, please secure your account immediately.")}
    ${btn(`${CLIENT}/forgot-password`, "Secure My Account")}
  `);

/**
 * Sent when an admin assigns a user as a Society Head.
 */
export const societyHeadAssignedEmail = ({ firstName, societyName, societyId }) =>
  layout(`
    ${h1(`Congratulations, ${firstName}! 🏛️`)}
    ${p(`You have been appointed as the <strong>Society Head</strong> of <strong>${societyName}</strong> on CampusConnect.`)}
    ${p("You can now manage members, create events, and configure your society from the Society HQ.")}
    ${btn(`${CLIENT}/society/${societyId}/manage`, "Open Society HQ")}
  `);

/**
 * Sent when a join request is accepted or rejected.
 */
export const joinRequestResolutionEmail = ({ firstName, societyName, accepted, societyId }) =>
  accepted
    ? layout(`
        ${h1("You're In! 🎊")}
        ${p(`Hi <strong>${firstName}</strong>, your request to join <strong>${societyName}</strong> has been <span style="color:${ACCENT};font-weight:700;">accepted</span>!`)}
        ${p("You are now an official member. Head over to the society page to get started.")}
        ${btn(`${CLIENT}/societies/${societyId}`, "View Society")}
      `)
    : layout(`
        ${h1("Join Request Update")}
        ${p(`Hi <strong>${firstName}</strong>, your request to join <strong>${societyName}</strong> was not approved at this time.`)}
        ${p("You can explore other societies on the platform.")}
        ${btn(`${CLIENT}/societies`, "Browse Societies")}
      `);

/**
 * Sent to a user when their event registration is confirmed.
 */
export const eventRegistrationEmail = ({ firstName, eventTitle, eventDate, venue, eventId }) =>
  layout(`
    ${h1("Registration Confirmed! 🎟️")}
    ${p(`Hi <strong>${firstName}</strong>, your spot for <strong>${eventTitle}</strong> is locked in.`)}
    ${infoBox(`
      ${infoRow("📅 Date & Time", eventDate)}
      ${infoRow("📍 Venue", venue)}
    `)}
    ${btn(`${CLIENT}/events/${eventId}`, "View Event Details")}
    ${divider()}
    ${p("Keep this email as your registration confirmation.")}
  `);

/**
 * Sent to all registrants when an event is updated or cancelled.
 */
export const eventUpdateEmail = ({ firstName, eventTitle, changeNote, eventId }) =>
  layout(`
    ${h1("Important Event Update ⚡")}
    ${p(`Hi <strong>${firstName}</strong>, there has been an update to <strong>${eventTitle}</strong> that you're registered for.`)}
    <div style="background:#1a1f2e;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;color:#fcd34d;font-size:14px;line-height:1.6;">${changeNote}</p>
    </div>
    ${btn(`${CLIENT}/events/${eventId}`, "View Updated Event")}
  `);

/**
 * Sent ~24h before an event starts.
 */
export const eventReminderEmail = ({ firstName, eventTitle, eventDate, venue, eventId }) =>
  layout(`
    ${h1("Your Event Starts Soon ⏰")}
    ${p(`Hi <strong>${firstName}</strong>, just a reminder that <strong>${eventTitle}</strong> is coming up!`)}
    ${infoBox(`
      ${infoRow("📅 Date & Time", eventDate)}
      ${infoRow("📍 Venue", venue)}
    `)}
    ${btn(`${CLIENT}/events/${eventId}`, "View Event")}
  `);

/**
 * Sent to a mentor applicant when their application is approved or rejected.
 */
export const mentorApplicationEmail = ({ firstName, status }) =>
  status === "approved"
    ? layout(`
        ${h1("Mentor Application Approved! 🎓")}
        ${p(`Congratulations <strong>${firstName}</strong>! Your mentor application has been <span style="color:${ACCENT};font-weight:700;">approved</span>.`)}
        ${p("Students on your campus can now discover your profile and book sessions with you.")}
        ${btn(`${CLIENT}/mentor/dashboard`, "Open Mentor Dashboard")}
      `)
    : layout(`
        ${h1("Mentor Application Update")}
        ${p(`Hi <strong>${firstName}</strong>, after careful review your mentor application was not approved at this time.`)}
        ${p("You're welcome to update your profile and expertise and apply again.")}
        ${btn(`${CLIENT}/mentor/register`, "Update Profile & Reapply")}
      `);

/**
 * Sent to a mentor when a student creates a new booking request.
 */
export const mentorBookingRequestEmail = ({ mentorFirstName, studentName, sessionDate, topic, bookingId }) =>
  layout(`
    ${h1("New Session Booking Request 📚")}
    ${p(`Hi <strong>${mentorFirstName}</strong>, <strong>${studentName}</strong> has requested a mentoring session with you.`)}
    ${infoBox(`
      ${infoRow("👤 Student", studentName)}
      ${infoRow("📅 Proposed Date", sessionDate)}
      ${infoRow("🎯 Topic", topic)}
    `)}
    ${btn(`${CLIENT}/my-sessions`, "Review & Respond")}
    ${divider()}
    ${p("Please respond promptly so the student can plan accordingly.")}
  `);

/**
 * Sent to a student when a mentor responds to their booking request.
 */
export const mentorBookingStatusEmail = ({ studentFirstName, mentorName, sessionDate, status }) =>
  status === "confirmed"
    ? layout(`
        ${h1("Session Confirmed! ✅")}
        ${p(`Hi <strong>${studentFirstName}</strong>, your mentoring session with <strong>${mentorName}</strong> has been <span style="color:${ACCENT};font-weight:700;">confirmed</span>.`)}
        ${infoBox(`
          ${infoRow("📅 Date & Time", sessionDate)}
          ${infoRow("👨‍🏫 Mentor", mentorName)}
        `)}
        ${btn(`${CLIENT}/my-sessions`, "View My Sessions")}
      `)
    : layout(`
        ${h1("Session Request Update")}
        ${p(`Hi <strong>${studentFirstName}</strong>, your session request with <strong>${mentorName}</strong> could not be confirmed at this time.`)}
        ${p("You can browse and book sessions with other available mentors.")}
        ${btn(`${CLIENT}/mentors`, "Browse Mentors")}
      `);

/**
 * Sent to a user when they receive a connection request.
 */
export const connectionRequestEmail = ({ firstName, senderName, profileUrl }) =>
  layout(`
    ${h1("New Connection Request 🤝")}
    ${p(`Hi <strong>${firstName}</strong>, <strong>${senderName}</strong> wants to connect with you on CampusConnect.`)}
    ${p("Visit their profile to accept or decline the request.")}
    ${btn(profileUrl, "View Profile & Respond")}
  `);

/**
 * Sent to a user when their account is suspended by an admin.
 */
export const userSuspendedEmail = ({ firstName, reason }) =>
  layout(`
    ${h1("Account Suspended 🚫")}
    ${p(`Hi <strong>${firstName}</strong>, your CampusConnect account has been suspended by an administrator.`)}
    ${infoBox(`
      ${infoRow("📋 Reason", reason || "Violating platform guidelines.")}
    `)}
    ${p("While your account is suspended, you will not be able to access the platform. If you believe this is a mistake, please contact support.")}
  `);
