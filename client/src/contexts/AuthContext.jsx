// src/contexts/AuthContext.jsx
// Authentication Context - manages user authentication state globally
// Security: Handles sensitive auth state - ensure NO passwords or sensitive data is stored

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [auth, setAuth] = useState(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem('authState');
      return stored ? JSON.parse(stored) : {
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
        onboardingCompleted: false,
        loading: true,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        role: null,
        onboardingCompleted: false,
        loading: true,
      };
    }
  });

  useEffect(() => {
    // Verify token on first load to prevent "ghost sessions"
    const verifyToken = async () => {
      // If not authenticated in localStorage, just finish loading
      if (!auth.isAuthenticated || !auth.token) {
        setAuth((prev) => ({ ...prev, loading: false }));
        return;
      }

      // If authenticated, ping the backend to verify the token is still valid
      try {
        const { getCurrentUser } = await import('../api/authApi');
        await getCurrentUser();
        setAuth((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        console.warn("Session verification failed. Clearing local session.", error);
        localStorage.removeItem('authState');
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          role: null,
          onboardingCompleted: false,
          loading: false,
        });
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Persist when auth state actually changes
    if (auth.isAuthenticated && auth.token) {
      localStorage.setItem('authState', JSON.stringify(auth));
    }
  }, [auth.isAuthenticated, auth.token, auth.role, auth.onboardingCompleted]);

  const login = useCallback((user, token, role, onboardingDone = false) => {
    // Security: Validate inputs before setting state
    if (!user || typeof user !== 'object') {
      console.error('Invalid user object provided to login');
      return;
    }
    if (!token || typeof token !== 'string') {
      console.error('Invalid token provided to login');
      return;
    }
    if (!role || typeof role !== 'string') {
      console.error('Invalid role provided to login');
      return;
    }

    // Important: Never store password in context
    // Ensure user object doesn't contain sensitive data
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      department: user.department || '',
      campusId: user.campusId,
      // Password MUST NOT be stored in frontend state
    };

    // Use the onboarding status from the database (passed by the caller)
    // Only show onboarding on the user's very first login after signup
    const previousOnboardingCompleted = onboardingDone;

    const newState = {
      isAuthenticated: true,
      user: sanitizedUser,
      token,
      role,
      onboardingCompleted: previousOnboardingCompleted,
      loading: false,
    };

    // Persist and set state
    localStorage.setItem('authState', JSON.stringify(newState));
    setAuth(newState);

    // FIX: Post-login redirect handling — honor saved redirect for ALL roles
    const redirect = sessionStorage.getItem('postLoginRedirect');
    if (redirect) {
      sessionStorage.removeItem('postLoginRedirect');
      navigate(redirect);
    }
  }, [navigate]);



  const updateUser = useCallback((updates) => {
    setAuth((prev) => ({
      ...prev,
      user: { ...prev.user, ...updates },
    }));
  }, []);

  const setLoading = useCallback((loading) => {
    setAuth((prev) => ({ ...prev, loading }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setAuth((prev) => ({ ...prev, onboardingCompleted: true }));
  }, []);

  // Security: Clear sensitive data on logout
  const secureLogout = useCallback(() => {
    // Clear sensitive auth data from state
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
      onboardingCompleted: false,
      loading: false,
    });

    // Clear from localStorage
    localStorage.removeItem('authState');

    // Optional: Clear from sessionStorage if used
    sessionStorage.clear();
  }, []);

  const value = {
    ...auth,
    login,
    logout: secureLogout,
    updateUser,
    setLoading,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
