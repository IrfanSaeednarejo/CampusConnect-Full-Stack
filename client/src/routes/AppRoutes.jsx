import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Standard components (loaded immediately for layout structure)
import Layout from "../components/Layout";
import StudentLayout from "../components/StudentLayout";
import AdminLayout from "../components/admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// ==========================================
// LAZY LOADED PAGES (Code Splitting)
// ==========================================

// Auth Pages
const Login = lazy(() => import("../pages/Auth/Login"));
const Signup = lazy(() => import("../pages/Auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const RoleSelection = lazy(() => import("../pages/Auth/RoleSelection"));
const Logout = lazy(() => import("../pages/Misc/Logout"));

// Main Pages
const ThemePreview = lazy(() => import("../pages/Misc/ThemePreview"));
const AdminThemePreview = lazy(() => import("../pages/Misc/AdminThemePreview"));
const StudentThemePreview = lazy(() => import("../pages/Misc/StudentThemePreview"));
const Home = lazy(() => import("../pages/Misc/Home"));
const Events = lazy(() => import("../pages/Events"));
const Mentors = lazy(() => import("../pages/Mentors"));
const Members = lazy(() => import("../pages/Members"));
const Societies = lazy(() => import("../pages/Societies"));
const AboutUs = lazy(() => import("../pages/Misc/About"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("../pages/Misc/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/Misc/TermsOfService"));

// Dashboard Pages
const StudentDashboard = lazy(() => import("../pages/Dashboard/StudentDashboard"));
const AdminDashboard = lazy(() => import("../pages/Dashboard/AdminDashboard"));
const UserManagement = lazy(() => import("../pages/Admin/UserManagement"));
const MentorVerification = lazy(() => import("../pages/Admin/MentorVerification"));
const SocietyApproval = lazy(() => import("../pages/Admin/SocietyApproval"));
const AdminSocieties = lazy(() => import("../pages/Admin/AdminSocieties"));
const SocietyDashboard = lazy(() => import("../pages/Dashboard/SocietyDashboard"));
const MentorDashboard = lazy(() => import("../pages/Dashboard/MentorDashboard"));
const EventDashboard = lazy(() => import("../pages/Dashboard/EventDashboard"));

// Student Pages
const StudentProfile = lazy(() => import("../pages/Student/StudentProfile"));
const AcademicNetwork = lazy(() => import("../pages/Student/AcademicNetwork"));
const ChatList = lazy(() => import("../pages/Student/messages/ChatList"));
const StudentTasks = lazy(() => import("../pages/Student/StudentTasks"));
const StudentEvents = lazy(() => import("../pages/Student/StudentEvents"));
const StudentSocieties = lazy(() => import("../pages/Student/StudentSocieties"));
const StudentBookMentor = lazy(() => import("../pages/Student/StudentBookMentor"));
const StudentSessions = lazy(() => import("../pages/Student/StudentSessions"));
const StudentNotifications = lazy(() => import("../pages/Student/StudentNotifications"));
const StudentPersonalNotes = lazy(() => import("../pages/Student/StudentPersonalNotes"));
const StudentMyNotes = lazy(() => import("../pages/Student/StudentMyNotes"));

// Society Pages
const SocietyManagement = lazy(() => import("../pages/Societies/SocietyManagement"));
const SocietyEvents = lazy(() => import("../pages/Societies/SocietyEvents"));
const SocietyMentoring = lazy(() => import("../pages/Societies/SocietyMentoring"));
const SocietyNetworking = lazy(() => import("../pages/Societies/SocietyNetworking"));
const SocietySettings = lazy(() => import("../pages/Societies/SocietySettings"));
const CreateSociety = lazy(() => import("../pages/Societies/CreateSociety"));
const MemberRequests = lazy(() => import("../pages/Societies/MemberRequests"));
const SocietyProfile = lazy(() => import("../pages/Societies/SocietyProfile"));
const SocietiesList = lazy(() => import("../pages/Societies/SocietiesList"));
const SocietyDetail = lazy(() => import("../pages/Societies/SocietyDetail"));
const EditSociety = lazy(() => import("../pages/Societies/EditSociety"));
const SocietyAnalytics = lazy(() => import("../pages/Societies/SocietyAnalytics"));
const SocietyDetailPage = lazy(() => import("../pages/Student/societies/SocietyDetailPage"));

// Study Groups Pages
const StudyGroupsList = lazy(() => import("../pages/StudyGroups/StudyGroupsList"));
const CreateStudyGroup = lazy(() => import("../pages/StudyGroups/CreateStudyGroup"));
const StudyGroupDetail = lazy(() => import("../pages/StudyGroups/StudyGroupDetail"));
const JoinStudyGroup = lazy(() => import("../pages/StudyGroups/JoinStudyGroup"));
const EditStudyGroup = lazy(() => import("../pages/StudyGroups/EditStudyGroup"));
const StudyGroupChat = lazy(() => import("../pages/StudyGroups/StudyGroupChat"));
const StudyGroupResources = lazy(() => import("../pages/StudyGroups/StudyGroupResources"));

// Onboarding Pages
const OnboardingWizardWelcome = lazy(() => import("../pages/Onboarding/OnboardingWizardWelcome"));
const ProfileSetup = lazy(() => import("../pages/Onboarding/ProfileSetup"));
const NotificationsSetup = lazy(() => import("../pages/Onboarding/NotificationsSetup"));
const OnboardingWizardComplete = lazy(() => import("../pages/Onboarding/OnboardingWizardComplete"));

// Mentorship Pages
const MentorshipHub = lazy(() => import("../pages/Mentoring/MentorshipHub"));
const MentorRegistration = lazy(() => import("../pages/Mentoring/MentorRegistration"));
const RequestAcceptedConfirmation = lazy(() => import("../pages/Mentoring/RequestAcceptedConfirmation"));
const VerificationPending = lazy(() => import("../pages/Mentoring/VerificationPending"));
const ApplicationRejected = lazy(() => import("../pages/Mentoring/ApplicationRejected"));
const MentorSessions = lazy(() => import("../pages/Mentoring/MentorSessions"));
const BookSession = lazy(() => import("../pages/Mentoring/BookSession"));
const FeedbackMentoring = lazy(() => import("../pages/Mentoring/FeedbackMentoring"));
const MentorApplication = lazy(() => import("../pages/Mentoring/MentorApplication"));
const MentorEarnings = lazy(() => import("../pages/Mentoring/MentorEarnings"));
const MentorMentees = lazy(() => import("../pages/Mentoring/MentorMentees"));
const MentorEvents = lazy(() => import("../pages/Mentoring/MentorEvents"));
const MentorProfileView = lazy(() => import("../pages/Mentoring/MentorProfileView"));
const MentorNotifications = lazy(() => import("../pages/Mentoring/MentorNotifications"));
const MentorAvailability = lazy(() => import("../pages/Mentoring/MentorAvailability"));
const MentorDisplayProfile = lazy(() => import("../pages/Mentoring/MentorDisplayProfile"));

// Academics Pages
const NotesList = lazy(() => import("../pages/Academics/NotesList"));
const NoteDetail = lazy(() => import("../pages/Academics/NoteDetail"));
const CreateNote = lazy(() => import("../pages/Academics/CreateNote"));
const CreateTask = lazy(() => import("../pages/Academics/CreateTask"));

// Profile Pages
const ViewProfile = lazy(() => import("../pages/Profile/ViewProfile"));
const EditProfile = lazy(() => import("../pages/Profile/EditProfile"));
const AccountSettings = lazy(() => import("../pages/Profile/AccountSettings"));
const PrivacySettings = lazy(() => import("../pages/Profile/PrivacySettings"));
const NotificationPreferences = lazy(() => import("../pages/Profile/NotificationPreferences"));
const DeleteAccount = lazy(() => import("../pages/Profile/DeleteAccount"));

// Error Pages
const NotFound = lazy(() => import("../pages/NotFound"));
const SessionExpired = lazy(() => import("../pages/ErrorPages/SessionExpired"));
const AccessDenied = lazy(() => import("../pages/ErrorPages/AccessDenied"));
const Forbidden = lazy(() => import("../pages/ErrorPages/Forbidden"));
const NetworkError = lazy(() => import("../pages/ErrorPages/NetworkError"));
const ServerError = lazy(() => import("../pages/ErrorPages/ServerError"));
const ServiceUnavailable = lazy(() => import("../pages/ErrorPages/ServiceUnavailable"));

// Others
const CreateEventPage = lazy(() => import("../pages/events/CreateEventPage"));
const StudyAgentPage = lazy(() => import("../pages/Student/agents/StudyAgentPage"));
const MentorAgentPage = lazy(() => import("../pages/Student/agents/MentorAgentPage"));
const WellbeingAgentPage = lazy(() => import("../pages/Student/agents/WellbeingAgentPage"));
const FeedbackAgentPage = lazy(() => import("../pages/Student/agents/FeedbackAgentPage"));


// Global Loader Fallback for lazy-loaded routes
const GlobalLoader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* ========== MISC ROUTES (NO LAYOUT) ========== */}
        <Route path="/themes" element={<ThemePreview />} />
        <Route path="/themespreview" element={<AdminThemePreview />} />
        <Route path="/student-themes" element={<StudentThemePreview />} />

        {/* ========== AUTH ROUTES (NO LAYOUT) ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ========== ONBOARDING ROUTES ========== */}
        <Route element={<ProtectedRoute requiresOnboarding={false} />}>
          <Route path="/onboarding/welcome" element={<OnboardingWizardWelcome />} />
          <Route path="/onboarding/profile-setup" element={<ProfileSetup />} />
          <Route path="/onboarding/notifications-setup" element={<NotificationsSetup />} />
          <Route path="/onboarding/complete" element={<OnboardingWizardComplete />} />
        </Route>

        {/* ========== PUBLIC ROUTES WITH LAYOUT ========== */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/members" element={<Members />} />
          <Route path="/societies" element={<Societies />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Public society detail */}
          <Route path="/societies/:id" element={<SocietyDetail />} />

          {/* Event Dashboard inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/event/dashboard" element={<EventDashboard />} />
          </Route>

          {/* Create Event — society_head or admin */}
          <Route element={<ProtectedRoute requiredRole={['society_head', 'admin']} />}>
            <Route path="/events/create" element={<CreateEventPage />} />
          </Route>
        </Route>

        {/* ========== MENTOR REGISTRATION / APPLICATION ROUTES (Standalone, NO Layout) ========== */}
        <Route element={<ProtectedRoute requiresOnboarding={false} />}>
          <Route path="/mentor-registration" element={<MentorRegistration />} />
          <Route path="/mentor-apply" element={<MentorApplication />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          <Route path="/application-rejected" element={<ApplicationRejected />} />
          <Route path="/request-accepted" element={<RequestAcceptedConfirmation />} />
        </Route>

        {/* Public mentor profile — viewable by anyone */}
        <Route path="/mentor-profile/:id" element={<MentorDisplayProfile />} />

        {/* Booking/Feedback — requires auth */}
        <Route element={<ProtectedRoute />}>
          <Route path="/book-session" element={<BookSession />} />
          <Route path="/feedback" element={<FeedbackMentoring />} />
        </Route>

        {/* ========== SOCIETY ROUTES (OWN LAYOUT — outside global Layout) ========== */}
        <Route element={<ProtectedRoute requiredRole="society_head" />}>
          <Route path="/society/dashboard" element={<SocietyDashboard />} />
          <Route path="/society/manage" element={<SocietyManagement />} />
          <Route path="/society/events" element={<SocietyEvents />} />
          <Route path="/society/mentoring" element={<SocietyMentoring />} />
          <Route path="/society/networking" element={<SocietyNetworking />} />
          <Route path="/society/settings" element={<SocietySettings />} />
          <Route path="/society/create" element={<CreateSociety />} />
          <Route path="/society/member-requests" element={<MemberRequests />} />
          <Route path="/society/profile" element={<SocietyProfile />} />
          <Route path="/society/list" element={<SocietiesList />} />
          <Route path="/society/analytics" element={<SocietyAnalytics />} />
          <Route path="/society/edit/:id" element={<EditSociety />} />
        </Route>

        {/* ========== STUDENT ROUTES (StudentLayout) ========== */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/academic-network" element={<AcademicNetwork />} />
            <Route path="/student/academic-network/:profileId" element={<AcademicNetwork />} />
            <Route path="/student/messages" element={<ChatList />} />
            <Route path="/student/tasks" element={<StudentTasks />} />
            <Route path="/student/events" element={<StudentEvents />} />
            <Route path="/student/book-mentor" element={<StudentBookMentor />} />
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/personal-notes" element={<StudentPersonalNotes />} />
            <Route path="/student/my-notes" element={<StudentMyNotes />} />
            <Route path="/student/notes" element={<NotesList />} />
            <Route path="/student/notes/create" element={<CreateNote />} />
            <Route path="/student/notes/:id" element={<NoteDetail />} />
            <Route path="/student/research" element={<CreateTask />} />
            <Route path="/student/societies" element={<StudentSocieties />} />
            <Route path="/student/societies/:societyId" element={<SocietyDetailPage />} />
          </Route>
        </Route>

        {/* ========== SHARED ROUTES (Study Groups, Profile — any logged-in user) ========== */}
        <Route element={<ProtectedRoute />}>
          {/* Study Groups — standalone, no dashboard wrapper */}
          <Route path="/study-groups" element={<StudyGroupsList />} />
          <Route path="/study-groups/create" element={<CreateStudyGroup />} />
          <Route path="/study-groups/:id" element={<StudyGroupDetail />} />
          <Route path="/study-groups/:id/join" element={<JoinStudyGroup />} />
          <Route path="/study-groups/:id/edit" element={<EditStudyGroup />} />
          <Route path="/study-groups/:id/chat" element={<StudyGroupChat />} />
          <Route path="/study-groups/:id/resources" element={<StudyGroupResources />} />

          {/* General Profile/Settings */}
          <Route path="/profile/view" element={<ViewProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/account-settings" element={<AccountSettings />} />
          <Route path="/profile/privacy-settings" element={<PrivacySettings />} />
          <Route path="/profile/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/profile/delete-account" element={<DeleteAccount />} />
        </Route>

        {/* ========== ADMIN ROUTES (AdminLayout) ========== */}
        <Route element={<ProtectedRoute requiredRole="admin" requiresOnboarding={false} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/mentor-approvals" element={<MentorVerification />} />
            <Route path="/admin/society-head-approvals" element={<SocietyApproval />} />
            <Route path="/admin/societies" element={<AdminSocieties />} />
          </Route>
        </Route>

        {/* ========== MENTOR DASHBOARD ROUTES (Own layout, outside global Layout) ========== */}
        <Route element={<ProtectedRoute requiredRole="mentor" />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentorship-hub" element={<MentorshipHub />} />
          <Route path="/mentor/sessions" element={<MentorSessions />} />
          <Route path="/my-sessions" element={<MentorSessions />} />
          <Route path="/mentor-sessions" element={<MentorSessions />} />
          <Route path="/earnings" element={<MentorEarnings />} />
          <Route path="/mentor/mentees" element={<MentorMentees />} />
          <Route path="/mentor-mentees" element={<MentorMentees />} />
          <Route path="/mentor/events" element={<MentorEvents />} />
          <Route path="/mentor-events" element={<MentorEvents />} />
          <Route path="/mentor/profile" element={<MentorProfileView />} />
          <Route path="/mentor-profile-view" element={<MentorProfileView />} />
          <Route path="/mentor/availability" element={<MentorAvailability />} />
          <Route path="/mentor/notifications" element={<MentorNotifications />} />
          <Route path="/mentor-notifications" element={<MentorNotifications />} />
          <Route path="/mentor/display-profile" element={<MentorDisplayProfile />} />
        </Route>

        {/* Redirect aliases */}
        <Route path="/mentor/register" element={<Navigate to="/mentor-registration" replace />} />

        {/* ========== AI AGENT ROUTES (fullscreen, no layout) ========== */}
        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/student/agents/study" element={<StudyAgentPage />} />
          <Route path="/student/agents/mentor" element={<MentorAgentPage />} />
          <Route path="/student/agents/wellbeing" element={<WellbeingAgentPage />} />
          <Route path="/student/agents/feedback" element={<FeedbackAgentPage />} />
        </Route>

        {/* ========== ERROR ROUTES ========== */}
        <Route path="/error/session-expired" element={<SessionExpired />} />
        <Route path="/error/access-denied" element={<AccessDenied />} />
        <Route path="/error/forbidden" element={<Forbidden />} />
        <Route path="/error/network-error" element={<NetworkError />} />
        <Route path="/error/server-error" element={<ServerError />} />
        <Route path="/error/service-unavailable" element={<ServiceUnavailable />} />

        {/* ========== LOGOUT ROUTE ========== */}
        <Route path="/logout" element={<Logout />} />

        {/* ========== 404 ROUTE ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
