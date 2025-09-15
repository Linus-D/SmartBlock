// src/pages/Feed.tsx
import React from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

const mockPosts = [
  {
    id: "1",
    author: "0xAbc",
    body: "Welcome to DeSoNet — first decentralized post!",
  },
  { id: "2", author: "0xDef", body: "Loving the 3D header 👾" },
];

export default function Feed() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
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
