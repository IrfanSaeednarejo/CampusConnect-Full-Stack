import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import RoleSelection from "../pages/Auth/RoleSelection";
import Logout from "../pages/Misc/Logout";

// Main Pages
import Home from "../pages/Misc/Home";
import Events from "../pages/Events";
import Mentors from "../pages/Mentors";
import Members from "../pages/Members";
import Societies from "../pages/Societies";
import AboutUs from "../pages/Misc/About";
import ContactUs from "../pages/ContactUs";
import PrivacyPolicy from "../pages/Misc/PrivacyPolicy";
import TermsOfService from "../pages/Misc/TermsOfService";

// Dashboard Pages
import StudentDashboard from "../pages/Dashboard/StudentDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import SocietyDashboard from "../pages/Dashboard/SocietyDashboard";
import MentorDashboard from "../pages/Dashboard/MentorDashboard";
import EventDashboard from "../pages/Dashboard/EventDashboard";

// Student Pages
import StudentProfile from "../pages/Student/StudentProfile";
import AcademicNetwork from "../pages/Student/AcademicNetwork";
import ChatList from "../pages/Chat/ChatList";
import Conversation from "../pages/Chat/Conversation";
import GroupChat from "../pages/Chat/GroupChat";
import EventChat from "../pages/Chat/EventChat";
import StudentTasks from "../pages/Student/StudentTasks";
import StudentEvents from "../pages/Student/StudentEvents";
import StudentSocieties from "../pages/Student/StudentSocieties";
import StudentBookMentor from "../pages/Student/StudentBookMentor";
import StudentSessions from "../pages/Student/StudentSessions";
import StudentNotifications from "../pages/Student/StudentNotifications";
import StudentPersonalNotes from "../pages/Student/StudentPersonalNotes";
import StudentMyNotes from "../pages/Student/StudentMyNotes";

// Society Pages
import SocietyManagement from "../pages/Societies/SocietyManagement";
import SocietyEvents from "../pages/Societies/SocietyEvents";
import SocietyMentoring from "../pages/Societies/SocietyMentoring";
import SocietyNetworking from "../pages/Societies/SocietyNetworking";
import SocietySettings from "../pages/Societies/SocietySettings";
import CreateSociety from "../pages/Societies/CreateSociety";
import MemberRequests from "../pages/Societies/MemberRequests";
import SocietyProfile from "../pages/Societies/SocietyProfile";
import SocietiesList from "../pages/Societies/SocietiesList";
import SocietyDetail from "../pages/Societies/SocietyDetail";
import EditSociety from "../pages/Societies/EditSociety";
import SocietyAnalytics from "../pages/Societies/SocietyAnalytics";

// Study Groups Pages
import StudyGroupsList from "../pages/StudyGroups/StudyGroupsList";
import CreateStudyGroup from "../pages/StudyGroups/CreateStudyGroup";
import StudyGroupDetail from "../pages/StudyGroups/StudyGroupDetail";
import JoinStudyGroup from "../pages/StudyGroups/JoinStudyGroup";
import EditStudyGroup from "../pages/StudyGroups/EditStudyGroup";
import StudyGroupChat from "../pages/StudyGroups/StudyGroupChat";
import StudyGroupResources from "../pages/StudyGroups/StudyGroupResources";

// Onboarding Pages
import OnboardingWizardWelcome from "../pages/Onboarding/OnboardingWizardWelcome";
import ProfileSetup from "../pages/Onboarding/ProfileSetup";
import NotificationsSetup from "../pages/Onboarding/NotificationsSetup";
import OnboardingWizardComplete from "../pages/Onboarding/OnboardingWizardComplete";

// Mentorship Pages
import MentorshipHub from "../pages/Mentoring/MentorshipHub";
import MentorSessionsManagement from "../pages/Mentoring/MentorSessionsManagement";
import MentorRegistration from "../pages/Mentoring/MentorRegistration";
import RequestAcceptedConfirmation from "../pages/Mentoring/RequestAcceptedConfirmation";
import VerificationPending from "../pages/Mentoring/VerificationPending";
import ApplicationRejected from "../pages/Mentoring/ApplicationRejected";
import MentorProfile from "../pages/Mentoring/MentorProfile";
import MentorSessions from "../pages/Mentoring/MentorSessions";
import BookSession from "../pages/Mentoring/BookSession";
import FeedbackMentoring from "../pages/Mentoring/FeedbackMentoring";

// AI Agent Pages
import StudyAssistantAgent from "../pages/Agent/StudyAssistantAgent";
import MentorMatchAgent from "../pages/Agent/MentorMatchAgent";
import WellbeingAgent from "../pages/Agent/WellbeingAgent";
import FeedbackAgent from "../pages/Agent/FeedbackAgent";
import MentorApplication from "../pages/Mentoring/MentorApplication";
import MentorEarnings from "../pages/Mentoring/MentorEarnings";
import MentorMentees from "../pages/Mentoring/MentorMentees";
import MentorEvents from "../pages/Mentoring/MentorEvents";
import MentorProfileView from "../pages/Mentoring/MentorProfileView";
import MentorNotifications from "../pages/Mentoring/MentorNotifications";
import MentorDisplayProfile from "../pages/Mentoring/MentorDisplayProfile";

// Academics Pages
import NotesList from "../pages/Academics/NotesList";
import NoteDetail from "../pages/Academics/NoteDetail";
import CreateNote from "../pages/Academics/CreateNote";
import CreateTask from "../pages/Academics/CreateTask";

// Profile Pages
import ViewProfile from "../pages/Profile/ViewProfile";
import EditProfile from "../pages/Profile/EditProfile";
import AccountSettings from "../pages/Profile/AccountSettings";
import PrivacySettings from "../pages/Profile/PrivacySettings";
import NotificationPreferences from "../pages/Profile/NotificationPreferences";
import DeleteAccount from "../pages/Profile/DeleteAccount";

// Error Pages
import NotFound from "../pages/NotFound";
import SessionExpired from "../pages/ErrorPages/SessionExpired";
import AccessDenied from "../pages/ErrorPages/AccessDenied";
import Forbidden from "../pages/ErrorPages/Forbidden";
import NetworkError from "../pages/ErrorPages/NetworkError";
import ServerError from "../pages/ErrorPages/ServerError";
import ServiceUnavailable from "../pages/ErrorPages/ServiceUnavailable";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ========== AUTH ROUTES (NO LAYOUT) ========== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ========== ONBOARDING ROUTES - Protected by AuthContext only, no role/onboarding completion required ========== */}
      <Route element={<ProtectedRoute requireOnboarding={false} />}>
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

        {/* ========== STUDENT ROUTES - Require 'student' role + onboarding completion ========== */}
        <Route element={<ProtectedRoute requiredRole="student" requireOnboarding={true} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/academic-network" element={<AcademicNetwork />} />
          <Route path="/student/messages" element={<ChatList />} />
          <Route path="/student/messages/:conversationId" element={<Conversation />} />
          <Route path="/student/messages/groups/:groupId" element={<GroupChat />} />
          <Route path="/student/messages/events/:eventId" element={<EventChat />} />
          <Route path="/student/tasks" element={<StudentTasks />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/societies" element={<StudentSocieties />} />
          <Route path="/student/book-mentor" element={<StudentBookMentor />} />
          <Route path="/student/sessions" element={<StudentSessions />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/personal-notes" element={<StudentPersonalNotes />} />
          <Route path="/student/my-notes" element={<StudentMyNotes />} />
          <Route path="/student/agents/study" element={<StudyAssistantAgent />} />
          <Route path="/student/agents/mentor" element={<MentorMatchAgent />} />
          <Route path="/student/agents/wellbeing" element={<WellbeingAgent />} />
          <Route path="/student/agents/feedback" element={<FeedbackAgent />} />
        </Route>

        {/* ========== MENTOR ROUTES - Require 'mentor' role + onboarding completion ========== */}
        <Route element={<ProtectedRoute requiredRole="mentor" requireOnboarding={true} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        </Route>

        {/* ========== SOCIETY ROUTES - Require 'society_head' role + onboarding completion ========== */}
        <Route element={<ProtectedRoute requiredRole="society_head" requireOnboarding={true} />}>
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

        {/* ========== PUBLIC SOCIETY DETAIL ROUTES ========== */}
        <Route path="/societies/:id" element={<SocietyDetail />} />

        {/* ========== ADMIN ROUTES - Require 'admin' role + onboarding completion ========== */}
        <Route element={<ProtectedRoute requiredRole="admin" requireOnboarding={true} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ========== STUDY GROUPS ROUTES - Require authentication + onboarding completion ========== */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
          <Route path="/study-groups" element={<StudyGroupsList />} />
          <Route path="/study-groups/create" element={<CreateStudyGroup />} />
          <Route path="/study-groups/:id" element={<StudyGroupDetail />} />
          <Route path="/study-groups/:id/join" element={<JoinStudyGroup />} />
          <Route path="/study-groups/:id/edit" element={<EditStudyGroup />} />
          <Route path="/study-groups/:id/chat" element={<StudyGroupChat />} />
          <Route path="/study-groups/:id/resources" element={<StudyGroupResources />} />
        </Route>

        {/* ========== ACADEMICS ROUTES - Require authentication + onboarding completion ========== */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
          <Route path="/academics/notes" element={<NotesList />} />
          <Route path="/academics/notes/create" element={<CreateNote />} />
          <Route path="/academics/notes/:id" element={<NoteDetail />} />
          <Route path="/academics/research" element={<CreateTask />} />
        </Route>

        {/* ========== PROFILE ROUTES - Require authentication + onboarding completion ========== */}
        <Route element={<ProtectedRoute requireOnboarding={true} />}>
          <Route path="/profile/view" element={<ViewProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/account-settings" element={<AccountSettings />} />
          <Route path="/profile/privacy-settings" element={<PrivacySettings />} />
          <Route path="/profile/notification-preferences" element={<NotificationPreferences />} />
          <Route path="/profile/delete-account" element={<DeleteAccount />} />
        </Route>
      </Route>

      {/* ========== MENTOR/MENTORSHIP ROUTES (NO LAYOUT) ========== */}
      <Route path="/mentorship-hub" element={<MentorshipHub />} />
      <Route path="/mentor-sessions" element={<MentorSessionsManagement />} />
      <Route path="/mentor-registration" element={<MentorRegistration />} />
      <Route path="/request-accepted" element={<RequestAcceptedConfirmation />} />
      <Route path="/verification-pending" element={<VerificationPending />} />
      <Route path="/application-rejected" element={<ApplicationRejected />} />
      <Route path="/mentor-profile/:id" element={<MentorProfile />} />
      <Route path="/my-sessions" element={<MentorSessions />} />
      <Route path="/book-session" element={<BookSession />} />
      <Route path="/feedback" element={<FeedbackMentoring />} />
      <Route path="/mentor-apply" element={<MentorApplication />} />
      <Route path="/earnings" element={<MentorEarnings />} />
      <Route path="/mentor-mentees" element={<MentorMentees />} />
      <Route path="/mentor-events" element={<MentorEvents />} />
      <Route path="/mentor-profile-view" element={<MentorProfileView />} />
      <Route path="/mentor-notifications" element={<MentorNotifications />} />
      <Route path="/mentor/display-profile" element={<MentorDisplayProfile />} />

      {/* ========== EVENT DASHBOARD ROUTE ========== */}
      <Route path="/event/dashboard" element={<EventDashboard />} />

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
  );
}
