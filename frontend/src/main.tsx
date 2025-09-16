// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./styles/global.css";
import { Web3Provider } from "./context/Web3Context";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";

// Development integration test
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
  import('./utils/integrationTest').then(({ runIntegrationTest, logTestResults }) => {
    runIntegrationTest().then(logTestResults);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Web3Provider>
        <UserProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserProvider>
      </Web3Provider>
    </ThemeProvider>
  </React.StrictMode>
);
