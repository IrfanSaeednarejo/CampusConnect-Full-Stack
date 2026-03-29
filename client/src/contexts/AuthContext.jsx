import React from 'react';
import { useAuth as useReduxAuth } from '../hooks/useAuth.js';

export const useAuth = () => {
  return useReduxAuth();
};

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};
