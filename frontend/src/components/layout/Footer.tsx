// src/components/layout/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} SmartBlock— decentralized social.
    </footer>
  );
}
