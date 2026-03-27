// Custom hook for navigation with common patterns
// Eliminates repeated useNavigate patterns

import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for navigation with common patterns
 */
export function useNavigation() {
  const navigate = useNavigate();

  // Navigate back
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Navigate to specific path
  const goTo = useCallback((path, options = {}) => {
    navigate(path, options);
  }, [navigate]);

  // Navigate with state
  const goToWithState = useCallback((path, state) => {
    navigate(path, { state });
  }, [navigate]);

  // Navigate and replace history
  const goToReplace = useCallback((path) => {
    navigate(path, { replace: true });
  }, [navigate]);

  // Navigate to dashboard based on role
  const goToDashboard = useCallback((role = 'student') => {
    const dashboardPaths = {
      student: '/student/dashboard',
      mentor: '/mentor/dashboard',
      admin: '/admin/dashboard',
      society: '/society/dashboard',
      society_head: '/society/dashboard'
    };
    navigate(dashboardPaths[role] || '/student/dashboard');
  }, [navigate]);

  // Navigate to profile
  const goToProfile = useCallback(() => {
    navigate('/profile/view');
  }, [navigate]);

  // Navigate with confirmation
  const goToWithConfirmation = useCallback((path, message = 'Are you sure you want to leave?') => {
    if (window.confirm(message)) {
      navigate(path);
    }
  }, [navigate]);

  return {
    navigate,
    goBack,
    goTo,
    goToWithState,
    goToReplace,
    goToDashboard,
    goToProfile,
    goToWithConfirmation
  };
}

export default useNavigation;
