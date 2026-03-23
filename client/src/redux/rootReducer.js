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
});

export default rootReducer;
