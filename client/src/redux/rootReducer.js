// Redux slice registrations
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventReducer from './slices/eventSlice';
import societyReducer from './slices/societySlice';
import notificationReducer from './slices/notificationSlice';
import memberReducer from './slices/memberSlice';
import mentoringReducer from './slices/mentoringSlice';
import dashboardReducer from './slices/dashboardSlice';
import studyGroupReducer from './slices/studyGroupSlice';
import taskReducer from './slices/taskSlice';
import chatReducer from './slices/chatSlice';
import campusReducer from './slices/campusSlice';
import notesReducer from './slices/notesSlice';
import agentReducer from './slices/agentSlice';
import paymentReducer from './slices/paymentSlice';
import sessionReducer from './slices/sessionSlice';

// Event Sub-System Slices
import teamReducer from './slices/teamSlice';
import submissionReducer from './slices/submissionSlice';
import scoringReducer from './slices/scoringSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  events: eventReducer,
  societies: societyReducer,
  notifications: notificationReducer,
  members: memberReducer,
  mentoring: mentoringReducer,
  dashboard: dashboardReducer,
  studyGroups: studyGroupReducer,
  tasks: taskReducer,
  chat: chatReducer,
  campus: campusReducer,
  notes: notesReducer,
  agent: agentReducer,
  payments: paymentReducer,
  session: sessionReducer,
  
  // Event Engine Modules
  teams: teamReducer,
  submissions: submissionReducer,
  scoring: scoringReducer,
});

export default rootReducer;

