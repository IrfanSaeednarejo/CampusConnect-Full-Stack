import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Client from "./Client.jsx";
import "./index.css";

import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { AgentProvider } from "./contexts/AgentContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationProvider>
        <AuthProvider>
          <AgentProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Client />
            </BrowserRouter>
          </AgentProvider>
        </AuthProvider>
      </NotificationProvider>
    </Provider>
  </React.StrictMode>,
);
