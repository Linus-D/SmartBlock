// src/App.tsx
import { Routes, Route } from "react-router-dom";

// Pages
import Welcome from "./pages/Welcome";
import Connect from "./pages/Connect";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { Messages } from "./pages/Messages";
import Explore from "./pages/Explore";

// Routes
import PrivateRoute from "./routes/PrivateRoute";

// Development Components
import { DataModeIndicator } from "./components/dev/DataModeIndicator";

export default function App() {
  return (
    <>
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

      {/* Development helper - only shows in development mode */}
      <DataModeIndicator />
    </>
  );
}
