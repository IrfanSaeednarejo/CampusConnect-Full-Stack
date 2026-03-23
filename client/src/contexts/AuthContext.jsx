// src/contexts/AuthContext.jsx
// Authentication Context - manages user authentication state globally
// Security: Handles sensitive auth state - ensure NO passwords or sensitive data is stored

import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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
    // Mark auth initialization as complete on first render.
    setAuth((prev) => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // Persist auth state to localStorage ONLY when auth status changes
  // This prevents unnecessary I/O operations on every render
  useEffect(() => {
    // Only persist when authentication state actually changes
    // Don't persist on every state update
    if (auth.isAuthenticated || auth.token) {
      localStorage.setItem('authState', JSON.stringify(auth));
    }
  }, [auth.isAuthenticated, auth.token, auth.role, auth.onboardingCompleted]);

  const login = useCallback((user, token, role) => {
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
      // Password MUST NOT be stored in frontend state
    };

    setAuth({
      isAuthenticated: true,
      user: sanitizedUser,
      token,
      role,
      onboardingCompleted: false, // Reset on login
      loading: false,
    });
  }, []);

  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
      onboardingCompleted: false,
      loading: false,
    });
    localStorage.removeItem('authState');
  }, []);

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
