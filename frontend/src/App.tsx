// src/App.tsx
import { Routes, Route } from "react-router-dom";

// Pages
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { Messages } from "./pages/Messages";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";

// Routes
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Feed />} />

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

        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}
