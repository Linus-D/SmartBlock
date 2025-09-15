// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Context Providers
import { Web3Provider } from "./context/Web3Context";
import { UserProvider } from "./context/UserContext"; // ✅ New import

// Pages
import Welcome from "./pages/Welcome";
import Connect from "./pages/Connect";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { Messages } from "./pages/Messages";
import Explore from "./pages/Explore";

// Routes
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <Web3Provider>
      <UserProvider>
        {" "}
        {/* ✅ Wrap the routes that need user context */}
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/connect" element={<Connect />} />

          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile/me"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile/:id"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          <Route
            path="/explore"
            element={
              <PrivateRoute>
                <Explore />
              </PrivateRoute>
            }
          />
        </Routes>
      </UserProvider>
    </Web3Provider>
  );
}
