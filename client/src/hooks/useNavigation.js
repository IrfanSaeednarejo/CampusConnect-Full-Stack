import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useNavigation() {
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goTo = useCallback((path, options = {}) => {
    navigate(path, options);
  }, [navigate]);

  const goToWithState = useCallback((path, state) => {
    navigate(path, { state });
  }, [navigate]);
  const goToReplace = useCallback((path) => {
    navigate(path, { replace: true });
  }, [navigate]);

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

  const goToProfile = useCallback((userId) => {
    navigate('/profile/view', { state: { userId } });
  }, [navigate]);
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
