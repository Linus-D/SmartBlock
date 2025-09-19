// src/components/layout/Sidebar.tsx
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 border-r border-gray-800 hidden md:block">
      <div className="space-y-4">
        <Link to="/feed" className="block py-2 px-3 rounded hover:bg-gray-800">
          Feed
        </Link>
        <Link
          to="/profile/me"
          className="block py-2 px-3 rounded hover:bg-gray-800"
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="block py-2 px-3 rounded hover:bg-gray-800"
        >
          Settings
        </Link>
      </div>
    </aside>
  );
}
