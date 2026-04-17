import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  loginUser,
  logoutUser,
  clearError,
  selectIsAuthenticated,
  selectUser,
  selectRole,
  selectUserRoles,
  selectAuthLoading,
  selectAuthError,
  selectOnboardingCompleted,
  completeOnboardingThunk,
} from '../redux/slices/authSlice';
import { connectSocket, disconnectSocket } from '../socket/socket';

export const useAuth = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectUser);
  const role            = useSelector(selectRole);         // primary role (roles[0])
  const roles           = useSelector(selectUserRoles);    // full roles[]
  const loading         = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);
  const onboardingCompleted = useSelector(selectOnboardingCompleted);

  /** Check if the authenticated user holds a specific role */
  const hasRole = useCallback(
    (targetRole) => Array.isArray(roles) && roles.includes(targetRole),
    [roles]
  );

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  const login = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  const logout = useCallback(() => {
    disconnectSocket();
    dispatch(logoutUser());
  }, [dispatch]);

  const completeOnboarding = useCallback(
    (data) => dispatch(completeOnboardingThunk(data)),
    [dispatch]
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    role,
    roles,
    hasRole,
    loading,
    error,
    onboardingCompleted,
    login,
    logout,
    completeOnboarding,
    dismissError,
  };
};

export default useAuth;
