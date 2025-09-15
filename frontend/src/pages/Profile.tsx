// src/pages/Profile.tsx
import React from "react";
import Header from "../components/layout/Header";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <div className="mt-4">
            <p>
              <span className="text-gray-400">Email:</span> {user?.email ?? "—"}
            </p>
            <p className="mt-2">
              <span className="text-gray-400">UID:</span> {user?.uid ?? "—"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
