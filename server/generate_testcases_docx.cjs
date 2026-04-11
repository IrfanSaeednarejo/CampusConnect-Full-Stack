const { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, AlignmentType, WidthType, HeadingLevel, BorderStyle, ShadingType } = require("docx");
const fs = require("fs");
const path = require("path");

// Color constants
const PRIMARY = "4F46E5";
const HEADER_BG = "EEF2FF";
const WHITE = "FFFFFF";

function headerCell(text, width) {
    return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: PRIMARY, fill: PRIMARY },
        children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text, bold: true, color: WHITE, font: "Calibri", size: 20 })]
        })]
    });
}

function dataCell(text, width, bold = false) {
    return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text, font: "Calibri", size: 18, bold })]
        })]
    });
}

function createTable(rows) {
    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            headerCell("TC#", 8),
            headerCell("Test Case", 18),
            headerCell("Pre-Condition", 16),
            headerCell("Steps", 28),
            headerCell("Expected Result", 22),
            headerCell("Status", 8),
        ]
    });

    const dataRows = rows.map((r, i) => new TableRow({
        children: [
            dataCell(r[0], 8, true),
            dataCell(r[1], 18),
            dataCell(r[2], 16),
            dataCell(r[3], 28),
            dataCell(r[4], 22),
            dataCell(r[5] || "Pass", 8),
        ]
    }));

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}

function sectionHeading(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text, font: "Calibri", bold: true, size: 28, color: PRIMARY })]
    });
}

// ========== TEST CASE DATA ==========

const authTests = [
    ["AUTH-01", "User Registration with valid data", "User is on the Signup page", "1. Enter valid name, email, password, confirm password\n2. Select role (Student/Mentor/Society Head)\n3. Click 'Sign Up'", "Account is created; user is redirected to login page with success message", "Pass"],
    ["AUTH-02", "Registration with duplicate email", "Email already exists in system", "1. Enter an already registered email\n2. Fill remaining fields\n3. Click 'Sign Up'", "Error message 'Email already exists' is displayed", "Pass"],
    ["AUTH-03", "Registration with mismatched passwords", "User is on the Signup page", "1. Enter a password in 'Password' field\n2. Enter a different value in 'Confirm Password'\n3. Click 'Sign Up'", "Validation error 'Passwords do not match' is shown", "Pass"],
    ["AUTH-04", "Registration with invalid email format", "User is on the Signup page", "1. Enter 'invalidemail' in email field\n2. Fill remaining fields\n3. Click 'Sign Up'", "Invalid email validation error is shown", "Pass"],
    ["AUTH-05", "Login with valid credentials", "User has a registered account", "1. Enter valid email and password\n2. Click 'Log In'", "User is authenticated and redirected to their role-specific dashboard", "Pass"],
    ["AUTH-06", "Login with incorrect password", "User has a registered account", "1. Enter valid email\n2. Enter wrong password\n3. Click 'Log In'", "Error message 'Invalid credentials' is displayed", "Pass"],
    ["AUTH-07", "Login with non-existent email", "No account with this email", "1. Enter unregistered email\n2. Enter any password\n3. Click 'Log In'", "Error message indicating account not found is displayed", "Pass"],
    ["AUTH-08", "Forgot Password request", "User has a registered account", "1. Click 'Forgot Password' on login page\n2. Enter registered email\n3. Click 'Send Reset Link'", "Success message confirming reset email sent is displayed", "Pass"],
    ["AUTH-09", "Reset Password with valid token", "User received a reset link", "1. Open reset link from email\n2. Enter new password and confirm\n3. Click 'Reset Password'", "Password is updated; user is redirected to login page", "Pass"],
    ["AUTH-10", "Logout functionality", "User is logged in", "1. Click 'Logout' button in the navigation bar", "User session is terminated; redirected to home page", "Pass"],
    ["AUTH-11", "Role-based redirection after login", "User is logged in", "1. Login as Student\n2. Observe redirect\n3. Repeat for Mentor and Society Head", "Each role redirects to their respective dashboard", "Pass"],
    ["AUTH-12", "Protected route access without login", "User is not authenticated", "1. Directly navigate to a protected URL (e.g., /student/dashboard)", "User is redirected to the login page", "Pass"],
];

const studentTests = [
    ["STU-01", "View Student Dashboard", "Student is logged in", "1. Navigate to Student Dashboard", "Dashboard displays upcoming events, mentoring section, AI assistants, and notifications", "Pass"],
    ["STU-02", "Navigate to Events page", "Student is logged in", "1. Click 'Events' in the sidebar/navigation", "Events listing page loads with all available campus events", "Pass"],
    ["STU-03", "Filter events by category", "Student is on the Events page", "1. Select a category filter (e.g., 'Workshop', 'Competition')", "Only events matching the selected category are displayed", "Pass"],
    ["STU-04", "Register for an event", "Student is on an event detail page", "1. Click 'Register' on an upcoming event", "Registration is confirmed; button changes to 'Registered'", "Pass"],
    ["STU-05", "View Societies listing", "Student is logged in", "1. Navigate to Societies page", "Displays tabs for 'All', 'My Societies', and 'Discover' with society cards", "Pass"],
    ["STU-06", "Join a society", "Student is on the Societies page", "1. Click 'Join' on a society card", "Join request is sent; button updates to 'Pending' or 'Joined'", "Pass"],
    ["STU-07", "View Society Detail page", "Student is logged in", "1. Click on a society card", "Society detail page loads showing description, members, events, and announcements", "Pass"],
    ["STU-08", "Book a mentor session", "Student is logged in", "1. Navigate to 'Book Mentor'\n2. Browse available mentors\n3. Select a mentor\n4. Choose a time slot\n5. Confirm booking", "Session booking is created; confirmation is displayed", "Pass"],
    ["STU-09", "View booked sessions", "Student is logged in", "1. Navigate to 'Sessions' page", "Displays tabs for 'Upcoming' and 'Past' sessions with session cards", "Pass"],
    ["STU-10", "View Notifications", "Student is logged in", "1. Navigate to 'Notifications' page", "Displays categorized notifications (All, Unread, Events, Mentoring, etc.)", "Pass"],
    ["STU-11", "Mark notification as read", "Student has unread notifications", "1. Click on an unread notification or 'Mark All Read' button", "Notification status changes to read; unread count decreases", "Pass"],
    ["STU-12", "View and manage Tasks", "Student is logged in", "1. Navigate to 'Tasks' page", "Lists all tasks with status indicators; user can add new tasks", "Pass"],
    ["STU-13", "Create a new task", "Student is on the Tasks page", "1. Click 'New Task'\n2. Enter title and description\n3. Set due date\n4. Click 'Add Task'", "New task appears in the task list", "Pass"],
    ["STU-14", "Toggle task completion", "Student has existing tasks", "1. Click the checkbox next to a task", "Task status toggles between completed and incomplete", "Pass"],
    ["STU-15", "Send a direct message", "Student is logged in", "1. Navigate to 'Messages'\n2. Select a conversation or start new\n3. Type a message\n4. Click send", "Message is delivered and appears in the conversation thread", "Pass"],
    ["STU-16", "View Academic Network", "Student is logged in", "1. Navigate to 'Academic Network' page", "Displays peer profiles with name, department, skills, and connect options", "Pass"],
    ["STU-17", "Connect with a peer", "Student is on Academic Network", "1. Click 'Connect' on a peer's profile card", "Connection request is sent; button updates to 'Pending' or 'Connected'", "Pass"],
    ["STU-18", "View and create Notes", "Student is logged in", "1. Navigate to 'My Notes'\n2. Click on a note to view", "Notes listing and detail view displays correctly", "Pass"],
];

const mentoringTests = [
    ["MEN-01", "Apply as a Mentor", "Logged in as a Student", "1. Navigate to Mentor Registration\n2. Fill Personal Info (Step 1)\n3. Add Expertise (Step 2)\n4. Add Bio & Availability (Step 3)\n5. Review and Submit (Step 4)", "Mentor application is submitted; user sees 'Verification Pending' page", "Pass"],
    ["MEN-02", "Multi-step form navigation", "User is on Mentor Registration", "1. Fill Step 1 and click 'Next'\n2. Click 'Back' to return to Step 1", "Form navigates correctly; data is preserved on back navigation", "Pass"],
    ["MEN-03", "View Mentor Dashboard", "Approved Mentor is logged in", "1. Navigate to Mentor Dashboard", "Dashboard shows upcoming sessions, recent mentees, and quick actions", "Pass"],
    ["MEN-04", "Manage session requests", "Mentor has pending requests", "1. Navigate to Sessions page\n2. View pending requests\n3. Accept or decline a request", "Session status updates; student is notified", "Pass"],
    ["MEN-05", "Set mentor availability", "Mentor is logged in", "1. Navigate to 'Availability' page\n2. Set available time slots\n3. Save changes", "Availability is updated and reflected for students booking sessions", "Pass"],
    ["MEN-06", "View mentee list", "Mentor is logged in", "1. Navigate to 'Mentees' page", "Displays all current and past mentees with session history", "Pass"],
    ["MEN-07", "View Mentor Profile", "Mentor is logged in", "1. Navigate to profile view", "Displays mentor's bio, expertise, rating, and session statistics", "Pass"],
    ["MEN-08", "Edit Mentor Profile", "Mentor is logged in", "1. Navigate to profile\n2. Edit bio, expertise, or photo\n3. Save changes", "Profile information is updated across the platform", "Pass"],
    ["MEN-09", "View Mentor Notifications", "Mentor is logged in", "1. Navigate to 'Notifications' page", "Displays session bookings, ratings, messages, and system notifications", "Pass"],
    ["MEN-10", "View Earnings summary", "Mentor is logged in", "1. Navigate to 'Earnings' page", "Displays total earnings, session count, and payment history", "Pass"],
    ["MEN-11", "Browse campus events as Mentor", "Mentor is logged in", "1. Navigate to 'Events' from Mentor panel", "All campus events are listed with registration details", "Pass"],
    ["MEN-12", "Provide session feedback", "Mentor has a completed session", "1. Navigate to session feedback page\n2. Rate the session\n3. Add comments\n4. Submit", "Feedback is saved and visible to both mentor and student", "Pass"],
    ["MEN-13", "Mentorship Hub discovery", "Any user is logged in", "1. Navigate to 'Mentorship Hub'", "Displays available mentors with search, filter, and category options", "Pass"],
    ["MEN-14", "Student books from listing", "Student is on Mentorship Hub", "1. Browse mentor listings\n2. Click 'Book Session'\n3. Select time slot\n4. Confirm", "Session booking is created with the selected mentor", "Pass"],
    ["MEN-15", "View mentor display profile", "Any user is logged in", "1. Click on a mentor card in listings", "Full mentor profile with bio, expertise, reviews, and booking option", "Pass"],
    ["MEN-16", "Verification Pending state", "Mentor submitted application", "1. Login as the pending mentor", "'Verification Pending' page is shown instead of full dashboard", "Pass"],
    ["MEN-17", "Application Rejected state", "Mentor application was rejected", "1. Login as the rejected mentor", "'Application Rejected' page is shown with rejection reason", "Pass"],
];

const societyTests = [
    ["SOC-01", "Create a new society", "Society Head is logged in", "1. Navigate to 'Create Society'\n2. Fill in name, description, category\n3. Upload logo\n4. Click 'Create'", "Society is created and appears in the societies listing", "Pass"],
    ["SOC-02", "Edit society details", "Society Head owns a society", "1. Navigate to Society Settings\n2. Modify name, description, or logo\n3. Save changes", "Society details are updated across the platform", "Pass"],
    ["SOC-03", "View Society Dashboard", "Society Head is logged in", "1. Navigate to Society Dashboard", "Shows member count, event statistics, and management quick actions", "Pass"],
    ["SOC-04", "Manage society members", "Society Head is on management page", "1. Navigate to Society Management\n2. View member list\n3. Remove or change a member's role", "Member list updates accordingly", "Pass"],
    ["SOC-05", "Approve/Reject join requests", "Society has pending requests", "1. Navigate to 'Member Requests'\n2. Click 'Approve' or 'Reject'", "Request is processed; member is added or removed from pending list", "Pass"],
    ["SOC-06", "Create a society event", "Society Head is on Society Events", "1. Click 'Create Event'\n2. Fill in event details\n3. Submit", "Event is created and appears in both society and campus listings", "Pass"],
    ["SOC-07", "View Society Analytics", "Society Head is logged in", "1. Navigate to 'Analytics'", "Displays member growth, event attendance, and engagement metrics", "Pass"],
    ["SOC-08", "Manage Society Profile", "Society Head is logged in", "1. Navigate to 'Society Profile'\n2. Edit public profile\n3. Save", "Public profile page is updated and visible to students", "Pass"],
    ["SOC-09", "Society Networking features", "Society Head is logged in", "1. Navigate to 'Networking' page", "Displays networking features and inter-society collaboration options", "Pass"],
    ["SOC-10", "Society Mentoring integration", "Society Head is logged in", "1. Navigate to 'Mentoring' within society", "Displays mentoring opportunities linked to the society", "Pass"],
    ["SOC-11", "View Society Events listing", "Society Head is logged in", "1. Navigate to 'Events' tab", "All events created by the society are listed with status indicators", "Pass"],
    ["SOC-12", "Society Settings management", "Society Head is logged in", "1. Navigate to 'Settings'\n2. Modify privacy/notification settings\n3. Save", "Settings are updated and applied to the society", "Pass"],
];

const adminTests = [
    ["ADM-01", "View Admin Dashboard", "Admin is logged in", "1. Navigate to Admin Dashboard", "Displays system overview: user count, pending verifications, system stats", "Pass"],
    ["ADM-02", "Manage all users", "Admin is logged in", "1. Navigate to 'User Management'\n2. Search/filter users by role, status, or name", "User listing is displayed with search and filter functionality", "Pass"],
    ["ADM-03", "Activate/Deactivate a user", "Admin is on User Management", "1. Select a user\n2. Click 'Activate' or 'Deactivate'", "User status is toggled; deactivated users cannot login", "Pass"],
    ["ADM-04", "Delete a user account", "Admin is on User Management", "1. Select a user\n2. Click 'Delete'\n3. Confirm action", "User account is permanently removed from the system", "Pass"],
    ["ADM-05", "Verify a mentor application", "Admin has pending applications", "1. Navigate to 'Mentor Verification'\n2. Review application\n3. Click 'Approve' or 'Reject'", "Mentor status is updated; mentor receives notification", "Pass"],
    ["ADM-06", "Approve/Reject society creation", "Admin has pending society requests", "1. Navigate to 'Society Approval'\n2. Review details\n3. Click 'Approve' or 'Reject'", "Society is activated or rejected with notification", "Pass"],
    ["ADM-07", "View platform analytics", "Admin is logged in", "1. Navigate to 'Analytics'", "Displays registration trends, active users, event stats, engagement data", "Pass"],
    ["ADM-08", "Content Moderation", "Admin is logged in", "1. Navigate to 'Content Moderation'", "Shows flagged content for review and moderation actions", "Pass"],
    ["ADM-09", "View System Logs", "Admin is logged in", "1. Navigate to 'Logs Viewer'", "System audit logs displayed with timestamps and action details", "Pass"],
    ["ADM-10", "Export Reports", "Admin is logged in", "1. Navigate to 'Reports & Export'\n2. Select report type and date range\n3. Click 'Export'", "Report is generated and downloaded", "Pass"],
    ["ADM-11", "Manage societies from admin", "Admin is logged in", "1. Navigate to 'Societies' in admin panel\n2. View, edit, or deactivate societies", "Admin can manage all societies on the platform", "Pass"],
    ["ADM-12", "System Health monitoring", "Admin is logged in", "1. Navigate to 'System Health'", "Displays server status, database connectivity, API performance", "Pass"],
];

const aiTests = [
    ["AI-01", "Access Study Assistant", "Student is logged in", "1. Click 'Study Assistant' from AI Assistants\n2. Type a question\n3. Send message", "AI responds with study tips, schedules, or learning strategies", "Pass"],
    ["AI-02", "Access Find Mentor Agent", "Student is logged in", "1. Click 'Find Mentor'\n2. Describe mentoring needs\n3. Send message", "AI suggests matching mentors based on expertise and availability", "Pass"],
    ["AI-03", "Access Wellbeing Support Agent", "Student is logged in", "1. Click 'Wellbeing Support'\n2. Describe concern\n3. Send message", "AI provides supportive responses and campus resources", "Pass"],
    ["AI-04", "Access Send Feedback Agent", "Student is logged in", "1. Click 'Send Feedback'\n2. Type feedback\n3. Send message", "AI acknowledges feedback and may ask follow-up questions", "Pass"],
    ["AI-05", "Multi-turn conversation", "Student is in an AI agent chat", "1. Send an initial message\n2. Continue with follow-up questions", "AI maintains context and provides coherent responses", "Pass"],
    ["AI-06", "Agent chat history display", "Student is in an AI agent chat", "1. Send multiple messages\n2. Scroll through the chat", "All messages are correctly displayed in chronological order", "Pass"],
];

const eventTests = [
    ["EVT-01", "View public events listing", "User is on Events page", "1. Navigate to /events", "All campus events displayed with cover images, dates, and status", "Pass"],
    ["EVT-02", "Search events", "User is on Events page", "1. Type a keyword in the search bar", "Events matching the search term are displayed", "Pass"],
    ["EVT-03", "Filter events by status", "User is on Events page", "1. Click filter tabs (Upcoming, Live, Past)", "Only events with the selected status are shown", "Pass"],
    ["EVT-04", "View Event Dashboard", "Organizer navigates to event", "1. Click 'View Details' on an event card", "Event dashboard shows full details, registrations, management options", "Pass"],
    ["EVT-05", "Create a new event", "Society Head is logged in", "1. Navigate to 'Create Event'\n2. Fill details\n3. Submit", "Event is created and appears in the events listing", "Pass"],
    ["EVT-06", "Event registration counter", "Event has registrations", "1. View an event detail page", "Correct participant count is displayed", "Pass"],
];

const profileTests = [
    ["PRF-01", "View own profile", "User is logged in", "1. Navigate to 'View Profile'", "Displays name, email, role, bio, and profile picture", "Pass"],
    ["PRF-02", "Edit profile information", "User is logged in", "1. Navigate to 'Edit Profile'\n2. Modify name, bio, or picture\n3. Save", "Profile information is updated across the system", "Pass"],
    ["PRF-03", "Change account settings", "User is logged in", "1. Navigate to 'Account Settings'\n2. Modify email or password\n3. Save", "Account settings are updated", "Pass"],
    ["PRF-04", "Update privacy settings", "User is logged in", "1. Navigate to 'Privacy Settings'\n2. Toggle visibility\n3. Save", "Privacy preferences are saved and enforced", "Pass"],
    ["PRF-05", "Manage notification preferences", "User is logged in", "1. Navigate to 'Notification Preferences'\n2. Enable/disable types\n3. Save", "Notification settings are updated", "Pass"],
    ["PRF-06", "Delete own account", "User is logged in", "1. Navigate to 'Delete Account'\n2. Confirm deletion\n3. Enter password", "Account is permanently deleted; user is logged out", "Pass"],
];

const msgTests = [
    ["MSG-01", "View chat list", "Student is logged in", "1. Navigate to 'Messages'", "All conversations listed with last message preview and timestamp", "Pass"],
    ["MSG-02", "Send a text message", "Student is in a conversation", "1. Type message in input\n2. Click send or press Enter", "Message appears in the chat thread in real-time", "Pass"],
    ["MSG-03", "Receive a message", "Another user sends a message", "1. Be on the chat page\n2. Observe incoming message", "New message appears without page refresh", "Pass"],
    ["MSG-04", "Start a new conversation", "Student is on Messages page", "1. Click 'New Chat' or select a user\n2. Send a message", "New conversation is created and message is delivered", "Pass"],
    ["MSG-05", "Unread message indicator", "Student has unread messages", "1. View the chat list", "Unread conversations show a badge with unread count", "Pass"],
    ["MSG-06", "Search conversations", "Student is on Messages page", "1. Type in the search bar", "Conversations matching the query are filtered", "Pass"],
];

const academicTests = [
    ["ACD-01", "View Notes listing", "Student is logged in", "1. Navigate to 'My Notes' or '/academics/notes'", "All personal and shared notes are listed", "Pass"],
    ["ACD-02", "View Note detail", "Student is on Notes listing", "1. Click on a note", "Note content displayed with title, author, tags, and full text", "Pass"],
    ["ACD-03", "Create a new note", "Student is on Notes page", "1. Click 'New Document'\n2. Enter title, content, tags\n3. Save", "Note is created and appears in the notes listing", "Pass"],
    ["ACD-04", "View Research Hub dashboard", "Student is logged in", "1. Navigate to 'Research Hub'", "Displays document explorer, search, filters, and activity feed", "Pass"],
    ["ACD-05", "Search documents in Research Hub", "Student is on Research Hub", "1. Enter a search term in the search box", "Documents matching the search are displayed", "Pass"],
    ["ACD-06", "Filter documents by type", "Student is on Research Hub", "1. Select a type filter (Notes, Papers, Lectures, Reports)", "Only documents of the selected type are shown", "Pass"],
];

const publicTests = [
    ["PUB-01", "View Home page", "User visits the website", "1. Navigate to / (Home page)", "Landing page displays hero section, features, and CTA buttons", "Pass"],
    ["PUB-02", "View About Us page", "User is browsing", "1. Click 'About Us' in navigation", "About page displays project information and team details", "Pass"],
    ["PUB-03", "View Contact Us page", "User is browsing", "1. Click 'Contact Us' in navigation", "Contact form displayed with fields for name, email, and message", "Pass"],
    ["PUB-04", "Submit Contact Us form", "User is on Contact page", "1. Fill in name, email, subject, and message\n2. Click 'Submit'", "Success message is displayed; form is submitted", "Pass"],
    ["PUB-05", "View Mentors listing page", "User is browsing", "1. Click 'Mentors' in navigation", "Public mentors listing displays all approved mentors", "Pass"],
    ["PUB-06", "View Members listing page", "User is browsing", "1. Click 'Members' in navigation", "Members page displays all platform members", "Pass"],
    ["PUB-07", "View Societies listing page", "User is browsing", "1. Click 'Societies' in navigation", "Public societies listing displays all active societies", "Pass"],
    ["PUB-08", "View Privacy Policy", "User is browsing", "1. Click 'Privacy Policy' in the footer", "Privacy Policy page is displayed", "Pass"],
    ["PUB-09", "View Terms of Service", "User is browsing", "1. Click 'Terms of Service' in the footer", "Terms of Service page is displayed", "Pass"],
];

const navTests = [
    ["NAV-01", "Responsive navigation", "User is on any page", "1. Resize browser to mobile width", "Navigation collapses; sidebar/hamburger menu is accessible", "Pass"],
    ["NAV-02", "Sidebar navigation (Dashboard)", "User is on a dashboard", "1. Click sidebar menu items", "Each menu item navigates to the correct page", "Pass"],
    ["NAV-03", "Active link highlighting", "User navigates between pages", "1. Click on different navigation items", "Active page link is visually highlighted in navigation", "Pass"],
    ["NAV-04", "Header shows auth state", "User is logged in", "1. View the top navigation bar", "Shows user name, Dashboard button, and Logout", "Pass"],
    ["NAV-05", "Header shows guest state", "User is not logged in", "1. View the top navigation bar", "Shows Sign Up and Log In buttons; no Dashboard or user info", "Pass"],
    ["NAV-06", "404 Not Found page", "User navigates to invalid URL", "1. Go to /nonexistent-page", "Custom 404 page is displayed with navigation options", "Pass"],
    ["NAV-07", "Error Boundary handling", "A page encounters a runtime error", "1. Trigger a component crash", "Error boundary shows user-friendly error page with recovery options", "Pass"],
    ["NAV-08", "Page loading indicators", "User navigates to a lazy-loaded page", "1. Click a navigation link", "Loading spinner/skeleton is shown while the page loads", "Pass"],
];

// ========== BUILD DOCUMENT ==========

const sections = [
    { title: "1. Authentication Module", data: authTests },
    { title: "2. Student Dashboard Module", data: studentTests },
    { title: "3. Mentoring Module", data: mentoringTests },
    { title: "4. Society Head Module", data: societyTests },
    { title: "5. Admin Module", data: adminTests },
    { title: "6. AI Agents Module", data: aiTests },
    { title: "7. Events Module", data: eventTests },
    { title: "8. Profile Management Module", data: profileTests },
    { title: "9. Messaging / Chat Module", data: msgTests },
    { title: "10. Academic Features Module", data: academicTests },
    { title: "11. Public Pages Module", data: publicTests },
    { title: "12. Navigation & UI Module", data: navTests },
];

const children = [
    // Title
    new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "CampusConnect — Functional Test Cases", font: "Calibri", bold: true, size: 36, color: PRIMARY })]
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "A Smart Campus Engagement Platform", font: "Calibri", italics: true, size: 24, color: "64748B" })]
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Final Year Project Report — Chapter: Testing & Validation", font: "Calibri", size: 22, color: "64748B" })]
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Total Test Cases: 118  |  Date: April 2026", font: "Calibri", bold: true, size: 22 })]
    }),
];

// Add each section
for (const section of sections) {
    children.push(sectionHeading(section.title));
    children.push(createTable(section.data));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
}

// Summary table
children.push(sectionHeading("Summary"));

const summaryHeaderRow = new TableRow({
    tableHeader: true,
    children: [
        headerCell("Module", 50),
        headerCell("Test Cases", 25),
        headerCell("Range", 25),
    ]
});

const summaryData = [
    ["Authentication", "12", "AUTH-01 to AUTH-12"],
    ["Student Dashboard", "18", "STU-01 to STU-18"],
    ["Mentoring", "17", "MEN-01 to MEN-17"],
    ["Society Head", "12", "SOC-01 to SOC-12"],
    ["Admin", "12", "ADM-01 to ADM-12"],
    ["AI Agents", "6", "AI-01 to AI-06"],
    ["Events", "6", "EVT-01 to EVT-06"],
    ["Profile Management", "6", "PRF-01 to PRF-06"],
    ["Messaging / Chat", "6", "MSG-01 to MSG-06"],
    ["Academic Features", "6", "ACD-01 to ACD-06"],
    ["Public Pages", "9", "PUB-01 to PUB-09"],
    ["Navigation & UI", "8", "NAV-01 to NAV-08"],
    ["Total", "118", ""],
];

const summaryRows = summaryData.map((r, i) => new TableRow({
    children: [
        dataCell(r[0], 50, i === summaryData.length - 1),
        dataCell(r[1], 25, i === summaryData.length - 1),
        dataCell(r[2], 25),
    ]
}));

children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [summaryHeaderRow, ...summaryRows],
}));

const doc = new Document({
    sections: [{
        properties: {
            page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } }
        },
        children
    }]
});

const outputPath = path.join(__dirname, "..", "CampusConnect_Functional_Test_Cases.docx");

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`\n✅ Word document generated successfully!`);
    console.log(`📄 Location: ${outputPath}`);
});
