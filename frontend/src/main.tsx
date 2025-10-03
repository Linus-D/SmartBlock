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

// Startup diagnostics (safe to remove after verification)
// Prints what the deployed build sees for key envs
console.log(
  "Env diagnostics:",
  {
    VITE_DATA_MODE: (import.meta as any).env?.VITE_DATA_MODE,
    VITE_CONTRACT_ADDRESS: (import.meta as any).env?.VITE_CONTRACT_ADDRESS,
  }
);

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
