import React, { createContext, useContext } from 'react';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  return (
    <AgentContext.Provider value={{
      sendMessage: async () => { },
      clearHistory: () => { },
      messages: [],
      isTyping: false
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
