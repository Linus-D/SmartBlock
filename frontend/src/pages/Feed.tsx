// src/pages/Feed.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useUser } from "../context/UserContext";

const mockPosts = [
  {
    id: "1",
    author: "0xAbc",
    body: "Welcome to DeSoNet — first decentralized post!",
  },
  { id: "2", author: "0xDef", body: "Loving the 3D header 👾" },
];

export default function Feed() {
  const { isRegistered } = useUser();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Show the alert only if the user is not registered
    if (!isRegistered) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [isRegistered]);

  const handleRegisterClick = () => {
    // Note: The logic to navigate or open a modal for registration
    // is not included here, but this is where you would add it.
    // For now, it will just log to the console.
    console.log("Initiating registration process...");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Conditional rendering of the alert banner */}
            {showAlert && (
              <div className="p-4 bg-yellow-400 text-yellow-900 rounded-xl flex items-center justify-between shadow-md">
                <p className="font-medium">
                  You're not registered. Register now to create posts and
                  interact.
                </p>
                <button
                  onClick={handleRegisterClick}
                  className="px-4 py-2 bg-yellow-900 text-white rounded-lg font-bold hover:bg-yellow-800 transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            <section className="p-4 bg-gray-800 rounded-xl">
              <h3 className="font-semibold mb-2">Create Post</h3>
              <textarea
                className="w-full min-h-[80px] p-3 rounded bg-gray-900 border border-gray-700"
                placeholder="Share something..."
              />
              <div className="mt-3 flex justify-end">
                <button className="px-4 py-2 bg-purple-600 rounded">
                  Post
                </button>
              </div>
            </section>

            <section className="space-y-4">
              {mockPosts.map((p) => (
                <article
                  key={p.id}
                  className="p-4 bg-gray-800 rounded-xl border border-gray-700"
                >
                  <div className="text-sm text-gray-400">by {p.author}</div>
                  <div className="mt-2">{p.body}</div>
                </article>
              ))}
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
