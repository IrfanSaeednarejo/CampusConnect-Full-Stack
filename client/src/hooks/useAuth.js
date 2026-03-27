import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  loginUser,
  logoutUser,
  checkAuth,
  clearError,
  selectIsAuthenticated,
  selectUser,
  selectRole,
  selectAuthLoading,
  selectAuthError,
} from '../redux/slices/authSlice';
import { connectSocket, disconnectSocket } from '../socket/socket';

export const useAuth = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    role,
    loading,
    error,
    login,
    logout,
    dismissError,
  };
};

export default useAuth;
