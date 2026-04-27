/**
 * email.service.js
 * 
 * Centralised transactional email dispatcher.
 * 
 * - Uses Resend SDK for delivery.
 * - Fire-and-forget: all sends are non-blocking.
 *   Failures are logged but never surface to the caller.
 * 
 * Usage:
 *   import { sendEmail } from "./email.service.js";
 *   sendEmail(user.email, "password_reset", { firstName, resetUrl });
 */

import { resend } from "../config/resend.js";
import * as T from "../utils/emailTemplates.js";

const FROM = process.env.EMAIL_FROM || "CampusNexus <onboarding@resend.dev>";

// ─── Registry ────────────────────────────────────────────────────────────────
const EMAIL_MAP = {
    welcome_verification:    { subject: "✅ Verify your CampusNexus email",            template: T.welcomeVerificationEmail },
    password_reset:          { subject: "🔑 Reset your CampusNexus password",          template: T.passwordResetEmail },
    password_changed:        { subject: "🔒 Your password was changed",                   template: T.passwordChangedEmail },
    society_head_assigned:   { subject: "🏛️ You are now a Society Head!",               template: T.societyHeadAssignedEmail },
    join_request_resolved:   { subject: "📬 Society join request update",                 template: T.joinRequestResolutionEmail },
    event_registration:      { subject: "🎟️ Registration confirmed!",                    template: T.eventRegistrationEmail },
    event_update:            { subject: "⚡ Important event update",                      template: T.eventUpdateEmail },
    event_reminder:          { subject: "⏰ Your event starts soon",                      template: T.eventReminderEmail },
    mentor_application:      { subject: "🎓 Mentor application update",                   template: T.mentorApplicationEmail },
    mentor_booking_request:  { subject: "📚 New session booking request",                 template: T.mentorBookingRequestEmail },
    mentor_booking_status:   { subject: "📆 Your session booking update",                 template: T.mentorBookingStatusEmail },
    connection_request:      { subject: "🤝 New connection request on CampusNexus",     template: T.connectionRequestEmail },
    user_suspended:          { subject: "🚫 Notice regarding your CampusNexus account", template: T.userSuspendedEmail },
};

// ─── Dispatcher ──────────────────────────────────────────────────────────────
/**
 * @param {string} to    - Recipient email address
 * @param {string} type  - Key from EMAIL_MAP
 * @param {object} data  - Template variables
 */
export const sendEmail = (to, type, data) => {
    const entry = EMAIL_MAP[type];
    if (!entry) {
        console.warn(`[EmailService] Unknown email type: "${type}"`);
        return;
    }

    // Fire-and-forget: don't await, don't block the caller
    (async () => {
        try {
            const html = entry.template(data);
            const { error } = await resend.emails.send({
                from: FROM,
                to,
                subject: entry.subject,
                html,
            });

            if (error) {
                console.error(`[EmailService] Resend error for type="${type}" to="${to}":`, error.message);
            } else {
                console.log(`[EmailService] ✓ Sent "${type}" to ${to}`);
            }
        } catch (err) {
            console.error(`[EmailService] Failed to send "${type}" to ${to}:`, err.message);
        }
    })();
};
