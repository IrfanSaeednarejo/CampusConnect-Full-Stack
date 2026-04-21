/**
 * AppRoutes.jsx — Phase 1 refactored routing
 *
 * Layout hierarchy:
 *   PublicLayout  (Layout.jsx)  → public pages: Header + Footer, no sidebar
 *   AppShell                    → all authenticated pages: GlobalNavbar + AppSidebar + content
 *   (no layout)                 → auth pages (login, signup, onboarding, errors)
 *
 * Auth gates:
 *   <ProtectedRoute>                        → must be logged in + onboarding complete
 *   <ProtectedRoute requireOnboarding={false}> → must be logged in (onboarding routes)
 *   <ProtectedRoute requiredRole="mentor">  → must have "mentor" in user.roles[]
 */

import { Routes, Route, Navigate, useParams } from "react-router-dom";

// Layout components
import Layout          from "../components/Layout";        // PublicLayout (Header+Footer)
import AppShell        from "../components/layout/AppShell"; // Authenticated shell
import ProtectedRoute  from "./ProtectedRoute";
import PublicRoute     from "./PublicRoute";
import ModularLayout from "../components/ModularLayout";

// ── Auth Pages (no layout) ───────────────────────────────────────────────────
import Login          from "../pages/Auth/Login";
import Signup         from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword  from "../pages/Auth/ResetPassword";
import Logout         from "../pages/Misc/Logout";

// ── Onboarding Pages (no layout) ─────────────────────────────────────────────
import OnboardingWizardWelcome  from "../pages/Onboarding/OnboardingWizardWelcome";
import ProfileSetup             from "../pages/Onboarding/ProfileSetup";
import NotificationsSetup       from "../pages/Onboarding/NotificationsSetup";
import OnboardingWizardComplete from "../pages/Onboarding/OnboardingWizardComplete";

// ── Public Pages (PublicLayout) ───────────────────────────────────────────────
import Home           from "../pages/Misc/Home";
import Events         from "../pages/Events";
import Mentors        from "../pages/Mentors";
// import Societies      from "../pages/Societies";
import AboutUs        from "../pages/Misc/About";
import ContactUs      from "../pages/Help/ContactUs";
import LegalPrivacy   from "../pages/Misc/LegalPrivacy";
import TermsOfService from "../pages/Misc/TermsOfService";

// ── Dashboard (Unified) ───────────────────────────────────────────────────────
import UnifiedDashboard from "../pages/Dashboard/index";

// ── Profile Pages (AppShell) ─────────────────────────────────────────────────
import ViewProfile             from "../pages/Profile/ViewProfile";
import EditProfile             from "../pages/Profile/EditProfile";
import AccountSettings         from "../pages/Profile/AccountSettings";
import PrivacySettings         from "../pages/Profile/PrivacySettings";
import NotificationPreferences from "../pages/Profile/NotificationPreferences";
import DeleteAccount           from "../pages/Profile/DeleteAccount";
import PublicUserProfile       from "../pages/Profile/PublicUserProfile";
import Network                 from "../pages/Network";

// ── Society Pages (AppShell) ─────────────────────────────────────────────────
import SocietiesList    from "../pages/Societies/SocietiesList";
import SocietyDetail    from "../pages/Societies/SocietyDetail";
import SocietyManagement from "../pages/Societies/SocietyManagement";
import MemberRequests   from "../pages/Societies/MemberRequests";
import SocietyEvents    from "../pages/Societies/SocietyEvents";
import SocietySettings  from "../pages/Societies/SocietySettings";
import SocietyAnalytics from "../pages/Societies/SocietyAnalytics";
import EditSociety      from "../pages/Societies/EditSociety";
import SocietyProfile   from "../pages/Societies/SocietyProfile";
import SocietyHQLayout  from "../components/societies/SocietyHQLayout";
import CreateEventForm  from "../pages/Societies/CreateEventForm";

// ── Event Pages (AppShell) ───────────────────────────────────────────────────
import EventDetailLayout   from "../pages/events/EventDetailFlow";
import EditEvent           from "../pages/events/EditEvent";
import SubmissionPanel     from "../pages/events/SubmissionPanel";
import JudgingDashboard    from "../pages/events/JudgingDashboard";
import TeamManagementFlow  from "../pages/events/TeamManagementFlow";
import EventAdminDashboard from "../pages/events/EventAdminDashboard";
import QRCheckInPanel      from "../pages/events/CheckIn/QRCheckInPanel";

// ── Study Groups (AppShell) ──────────────────────────────────────────────────
import StudyGroupsList     from "../pages/StudyGroups/StudyGroupsList";
import CreateStudyGroup    from "../pages/StudyGroups/CreateStudyGroup";
import StudyGroupDetail    from "../pages/StudyGroups/StudyGroupDetail";
import JoinStudyGroup      from "../pages/StudyGroups/JoinStudyGroup";
import EditStudyGroup      from "../pages/StudyGroups/EditStudyGroup";
import StudyGroupChat      from "../pages/StudyGroups/StudyGroupChat";
import StudyGroupResources from "../pages/StudyGroups/StudyGroupResources";

// ── Notes / Academics (AppShell) ─────────────────────────────────────────────
import NotesList   from "../pages/Academics/NotesList";
import NoteDetail  from "../pages/Academics/NoteDetail";
import CreateNote  from "../pages/Academics/CreateNote";

// ── Chat (AppShell) ──────────────────────────────────────────────────────────
import ChatList    from "../pages/Chat/ChatList";
import Conversation from "../pages/Chat/Conversation";

// ── Notifications (AppShell) ─────────────────────────────────────────────────
import NotificationsPage from "../pages/Notifications";

// ── Mentoring Pages (AppShell) ───────────────────────────────────────────────
import MentorshipHub            from "../pages/Mentoring/MentorshipHub";
import MentorRegistration       from "../pages/Mentoring/MentorRegistration";
import MentorProfile            from "../pages/Mentoring/MentorProfile";
import MentorProfileView        from "../pages/Mentoring/MentorProfileView";
import MentorSessionsManagement from "../pages/Mentoring/MentorSessionsManagement";
import MentorEarnings           from "../pages/Mentoring/MentorEarnings";
import MentorMentees            from "../pages/Mentoring/MentorMentees";
import BookSession              from "../pages/Mentoring/BookSession";
import FeedbackMentoring        from "../pages/Mentoring/FeedbackMentoring";
import RequestAcceptedConfirmation from "../pages/Mentoring/RequestAcceptedConfirmation";
import VerificationPending      from "../pages/Mentoring/VerificationPending";
import ApplicationRejected      from "../pages/Mentoring/ApplicationRejected";
import MentorDisplayProfile     from "../pages/Mentoring/MentorDisplayProfile";
import SessionWorkspace        from "../pages/Mentoring/SessionWorkspace";

// ── Admin Portal Pages (Standalone shell) ────────────────────────────────────
import AdminRoute          from "../admin/guards/AdminRoute";
import AdminApp            from "../admin/AdminApp";
import AdminDashboard      from "../admin/pages/AdminDashboard";
import AdminUsers          from "../admin/pages/AdminUsers";
import AdminMentors        from "../admin/pages/AdminMentors";
import AdminSocieties      from "../admin/pages/AdminSocieties";
import AdminEvents         from "../admin/pages/AdminEvents";
import AdminStudyGroups    from "../admin/pages/AdminStudyGroups";
import AdminNotifications  from "../admin/pages/AdminNotifications";
import AdminAuditLogs      from "../admin/pages/AdminAuditLogs";
import AdminSystem         from "../admin/pages/AdminSystem";
import AdminUserDetail     from "../admin/pages/AdminUserDetail";
import AdminSocietyDetail  from "../admin/pages/AdminSocietyDetail";
import AdminAnalytics      from "../admin/pages/AdminAnalytics";
import AdminRequests       from "../admin/pages/AdminRequests";
import AdminStudyGroupDetail from "../admin/pages/AdminStudyGroupDetail";

// ── Payment (AppShell) ───────────────────────────────────────────────────────
import PaymentHistory from "../pages/Payments/PaymentHistory";

// ── AI Agents (AppShell) ─────────────────────────────────────────────────────
import StudyAssistantAgent from "../pages/Agent/StudyAssistantAgent";
import MentorMatchAgent    from "../pages/Agent/MentorMatchAgent";
import WellbeingAgent      from "../pages/Agent/WellbeingAgent";
import FeedbackAgent       from "../pages/Agent/FeedbackAgent";

// ── Error Pages (no layout) ──────────────────────────────────────────────────
import NotFound          from "../pages/NotFound";
import SessionExpired    from "../pages/ErrorPages/SessionExpired";
import AccessDenied      from "../pages/ErrorPages/AccessDenied";
import Forbidden         from "../pages/ErrorPages/Forbidden";
import NetworkError      from "../pages/ErrorPages/NetworkError";
import ServerError       from "../pages/ErrorPages/ServerError";
import ServiceUnavailable from "../pages/ErrorPages/ServiceUnavailable";
import SuspendedPage      from "../pages/ErrorPages/SuspendedPage";

// ─────────────────────────────────────────────────────────────────────────────

// Helper component for legacy redirects requiring params
const RouteRedirect = ({ to }) => {
  const params = useParams();
  let resolvedTo = to;
  Object.keys(params).forEach(key => {
    resolvedTo = resolvedTo.replace(`:${key}`, params[key]);
  });
  return <Navigate to={resolvedTo} replace />;
};

export default function AppRoutes() {
  return (
    <Routes>

      {/* ══════════════════════════════════════════════════
          AUTH ROUTES — No layout wrapper
      ══════════════════════════════════════════════════ */}
      <Route element={<PublicRoute />}>
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/logout"          element={<Logout />} />

      {/* ══════════════════════════════════════════════════
          ONBOARDING — Auth required, onboarding NOT required
      ══════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requireOnboarding={false} />}>
        <Route path="/onboarding/welcome"            element={<OnboardingWizardWelcome />} />
        <Route path="/onboarding/profile-setup"      element={<ProfileSetup />} />
        <Route path="/onboarding/notifications-setup" element={<NotificationsSetup />} />
        <Route path="/onboarding/complete"           element={<OnboardingWizardComplete />} />
      </Route>

      {/* ══════════════════════════════════════════════════
          PUBLIC LANDING — Layout (Header + Footer)
      ══════════════════════════════════════════════════ */}
      <Route element={<Layout />}>
        <Route path="/"          element={<Home />} />
        <Route path="/about-us"  element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy"   element={<LegalPrivacy />} />
        <Route path="/terms"     element={<TermsOfService />} />
      </Route>

      {/* ══════════════════════════════════════════════════
          HYBRID MODULES — ModularLayout (AppShell or PublicLayout)
          These routes work for both guests and logged-in users.
      ══════════════════════════════════════════════════ */}
      <Route element={<ModularLayout />}>
        {/* Events */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id/*" element={<EventDetailLayout />} />
        
        {/* Societies */}
        <Route path="/societies" element={<SocietiesList />} />
        <Route path="/societies/browse" element={<Navigate to="/societies" replace />} />
        <Route path="/societies/:id" element={<SocietyDetail />} />
        
        {/* Mentors */}
        <Route path="/mentors"   element={<Mentors />} />
        <Route path="/mentors/:mentorId" element={<MentorProfileView />} />
        <Route path="/mentor-profile/:id" element={<RouteRedirect to="/mentors/:id" />} />
        
        <Route path="/members"        element={<Navigate to="/network" replace />} />
        <Route path="/users/:id"      element={<PublicUserProfile />} />
        <Route path="/members/:id"    element={<PublicUserProfile />} />

        {/* Study Groups */}
        <Route path="/study-groups"           element={<StudyGroupsList />} />
        <Route path="/study-groups/:id"       element={<StudyGroupDetail />} />
      </Route>

      {/* ══════════════════════════════════════════════════
          AUTHENTICATED — AppShell (GlobalNavbar + AppSidebar)
          All routes below require login + onboarding complete
      ══════════════════════════════════════════════════ */}
      <Route element={<ProtectedRoute requireOnboarding={true} disallowAdmin={true} />}>
        <Route element={<AppShell />}>

          {/* ── Unified Dashboard ──────────────────── */}
          <Route path="/dashboard" element={<UnifiedDashboard />} />

          {/* Legacy dashboard redirects → unified dashboard */}
          <Route path="/student/dashboard"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/mentor/dashboard"   element={<Navigate to="/dashboard" replace />} />
          <Route path="/society/dashboard"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/event/dashboard"    element={<Navigate to="/dashboard" replace />} />

          {/* ── Profile ────────────────────────────── */}
          <Route path="/profile/view"                  element={<ViewProfile />} />
          <Route path="/profile/edit"                  element={<EditProfile />} />
          <Route path="/profile/account-settings"      element={<AccountSettings />} />
          <Route path="/profile/privacy-settings"      element={<PrivacySettings />} />
          <Route path="/profile/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/profile/delete-account"        element={<DeleteAccount />} />
          
          {/* ── Network ────────────────────────────── */}
          {/* ── Network & Discovery (Unified) ────── */}
          <Route path="/network"                       element={<Network />} />

          
          {/* ── Other Users ──────────────────────────── */}
          {/* Handled by HYBRID section */}

          {/* ── Societies (any auth user) ────────────── */}
          <Route path="/my-societies"       element={<SocietiesList />} />

          {/* ── Society Head HQ — all wrapped in shared layout shell ────── */}
          <Route element={<SocietyHQLayout />}>
            <Route path="/society/:id/manage"          element={<SocietyManagement />} />
            <Route path="/society/:id/members"         element={<MemberRequests />} />
            <Route path="/society/:id/member-requests" element={<MemberRequests />} />
            <Route path="/society/:id/events/create"   element={<CreateEventForm />} />
            <Route path="/society/:id/events"          element={<SocietyEvents />} />
            <Route path="/society/:id/settings"        element={<SocietySettings />} />
            <Route path="/society/:id/analytics"       element={<SocietyAnalytics />} />
            <Route path="/society/:id/profile"         element={<SocietyProfile />} />
            <Route path="/society/:id/edit"            element={<EditSociety />} />
          </Route>

          {/* ── Events ───────────────────────────────── */}
          {/* Handled by HYBRID section */}
          <Route path="/events/:id/edit"      element={<EditEvent />} />
          <Route path="/events/:id/team"      element={<TeamManagementFlow />} />
          <Route path="/events/:id/submission" element={<SubmissionPanel />} />
          <Route path="/events/:id/judge"     element={<JudgingDashboard />} />
          <Route path="/events/:id/manage"    element={<EventAdminDashboard />} />
          <Route path="/events/:id/check-in"  element={<QRCheckInPanel />} />

          {/* ── Study Groups ─────────────────────────── */}
          <Route path="/study-groups/create"    element={<CreateStudyGroup />} />
          <Route path="/study-groups/:id/join"  element={<JoinStudyGroup />} />
          <Route path="/study-groups/:id/edit"  element={<EditStudyGroup />} />
          <Route path="/study-groups/:id/chat"  element={<StudyGroupChat />} />
          <Route path="/study-groups/:id/resources" element={<StudyGroupResources />} />

          {/* ── Notes ────────────────────────────────── */}
          <Route path="/notes"          element={<NotesList />} />
          <Route path="/notes/create"   element={<CreateNote />} />
          <Route path="/notes/:id"      element={<NoteDetail />} />
          {/* Legacy notes routes */}
          <Route path="/academics/notes"        element={<Navigate to="/notes" replace />} />
          <Route path="/academics/notes/create" element={<Navigate to="/notes/create" replace />} />
          <Route path="/academics/notes/:id"    element={<NoteDetail />} />

          {/* ── Chat ─────────────────────────────────── */}
          <Route path="/messages"                          element={<ChatList />} />
          <Route path="/messages/:conversationId"          element={<Conversation />} />
          {/* Legacy chat routes */}
          <Route path="/student/messages"                  element={<Navigate to="/messages" replace />} />
          <Route path="/student/messages/:conversationId"  element={<Conversation />} />

          {/* ── Notifications ────────────────────────── */}
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Legacy notification routes */}
          <Route path="/student/notifications" element={<Navigate to="/notifications" replace />} />
          <Route path="/mentor-notifications"  element={<Navigate to="/notifications" replace />} />

          {/* ── Mentoring (any auth user can browse/apply) ── */}
          <Route path="/mentorship-hub"        element={<Navigate to="/mentors" replace />} />
          <Route path="/mentor/register"       element={<MentorRegistration />} />
          <Route path="/mentor-registration"   element={<Navigate to="/mentor/register" replace />} />
          <Route path="/mentor-apply"          element={<Navigate to="/mentor/register" replace />} />
          <Route path="/mentor/display-profile" element={<MentorDisplayProfile />} />
          <Route path="/book-session"          element={<BookSession />} />
          <Route path="/mentor/book/:mentorId" element={<BookSession />} />
          <Route path="/feedback"              element={<FeedbackMentoring />} />
          <Route path="/request-accepted"      element={<RequestAcceptedConfirmation />} />
          <Route path="/verification-pending"  element={<VerificationPending />} />
          <Route path="/application-rejected"  element={<ApplicationRejected />} />
          <Route path="/my-sessions"           element={<MentorSessionsManagement />} />
          <Route path="/workspace/session/:bookingId" element={<SessionWorkspace />} />
          <Route path="/student/sessions"      element={<Navigate to="/my-sessions" replace />} />
          <Route path="/student/book-mentor"   element={<Navigate to="/mentors" replace />} />

          {/* ── Mentor-role routes (component guards via RoleGuard internally) ── */}
          <Route path="/mentor/sessions"      element={<MentorSessionsManagement />} />
          <Route path="/mentor/mentees"       element={<Navigate to="/mentor/sessions" replace />} />
          <Route path="/mentor/earnings"      element={<MentorEarnings />} />
          <Route path="/mentor/profile"       element={<MentorDisplayProfile />} />
          <Route path="/mentor/availability"  element={<MentorProfile />} />
          {/* Legacy mentor routes */}
          <Route path="/mentor-sessions"      element={<Navigate to="/mentor/sessions" replace />} />
          <Route path="/mentor-mentees"       element={<Navigate to="/mentor/mentees" replace />} />
          <Route path="/earnings"             element={<Navigate to="/mentor/earnings" replace />} />
          <Route path="/mentor-events"        element={<Navigate to="/events" replace />} />

          {/* Admin routes migrated out of AppShell to their own AdminApp layout */}

          {/* ── AI Agents ────────────────────────────── */}
          <Route path="/agents/study"    element={<StudyAssistantAgent />} />
          <Route path="/agents/mentor"   element={<MentorMatchAgent />} />
          <Route path="/agents/wellbeing" element={<WellbeingAgent />} />
          <Route path="/agents/feedback" element={<FeedbackAgent />} />
          {/* Legacy agent routes */}
          <Route path="/student/agents/study"    element={<Navigate to="/agents/study" replace />} />
          <Route path="/student/agents/mentor"   element={<Navigate to="/agents/mentor" replace />} />
          <Route path="/student/agents/wellbeing" element={<Navigate to="/agents/wellbeing" replace />} />
          <Route path="/student/agents/feedback"  element={<Navigate to="/agents/feedback" replace />} />

          {/* ── Payments ─────────────────────────────── */}
          <Route path="/payments/history"         element={<PaymentHistory />} />
          <Route path="/student/payments/history" element={<Navigate to="/payments/history" replace />} />
        </Route>{/* END AppShell */}
      </Route>{/* END PROTECTED (STUDENT) */}

      {/* ══════════════════════════════════════════════════
          ADMIN PORTAL — Standalone Layout (AdminApp)
          Uses AdminRoute for specialized admin role gating.
      ══════════════════════════════════════════════════ */}
      <Route element={<AdminRoute requiredRole="any_admin" />}>
        <Route path="/admin" element={<AdminApp />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="mentors" element={<AdminMentors />} />
          <Route path="societies" element={<AdminSocieties />} />
          <Route path="societies/:id" element={<AdminSocietyDetail />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="study-groups" element={<AdminStudyGroups />} />
          <Route path="study-groups/:id" element={<AdminStudyGroupDetail />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* ══════════════════════════════════════════════════
          ERROR PAGES — No layout
      ══════════════════════════════════════════════════ */}
      <Route path="/error/session-expired"    element={<SessionExpired />} />
      <Route path="/error/access-denied"      element={<AccessDenied />} />
      <Route path="/error/forbidden"          element={<Forbidden />} />
      <Route path="/error/network-error"      element={<NetworkError />} />
      <Route path="/error/server-error"       element={<ServerError />} />
      <Route path="/error/service-unavailable" element={<ServiceUnavailable />} />
      <Route path="/suspended"                element={<SuspendedPage />} />

      {/* ══════════════════════════════════════════════════
          LEGACY ROUTE REDIRECTS (top-level catch-alls)
      ══════════════════════════════════════════════════ */}
      <Route path="/student/*"       element={<Navigate to="/dashboard" replace />} />
      <Route path="/mentor-profile-view" element={<Navigate to="/profile/view" replace />} />
      <Route path="/academic-network"    element={<Navigate to="/dashboard" replace />} />

      {/* ══════════════════════════════════════════════════
          404
      ══════════════════════════════════════════════════ */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
