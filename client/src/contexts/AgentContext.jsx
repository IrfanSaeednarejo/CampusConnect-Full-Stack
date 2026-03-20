// src/contexts/AgentContext.js
// AI Agent Context - manages AI agent state and interactions

import React, { createContext, useState, useCallback } from 'react';

export const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [agent, setAgent] = useState({
    isActive: false,
    currentMode: null, // 'study', 'mentoring', 'wellbeing', etc.
    conversation: [],
    isLoading: false,
    error: null,
  });

  const startAgent = useCallback((mode) => {
    setAgent((prev) => ({
      ...prev,
      isActive: true,
      currentMode: mode,
      error: null,
    }));
  }, []);

  const stopAgent = useCallback(() => {
    setAgent((prev) => ({
      ...prev,
      isActive: false,
      currentMode: null,
      conversation: [],
    }));
  }, []);

  const addMessage = useCallback((message, sender) => {
    setAgent((prev) => ({
      ...prev,
      conversation: [
        ...prev.conversation,
        { id: Date.now(), message, sender, timestamp: new Date() },
      ],
    }));
  }, []);

  const clearConversation = useCallback(() => {
    setAgent((prev) => ({
      ...prev,
      conversation: [],
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setAgent((prev) => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const setError = useCallback((error) => {
    setAgent((prev) => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  const value = {
    ...agent,
    startAgent,
    stopAgent,
    addMessage,
    clearConversation,
    setLoading,
    setError,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = React.useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return context;
}
