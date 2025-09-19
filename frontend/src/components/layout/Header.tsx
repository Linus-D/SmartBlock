// src/components/layout/Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";

export default function Header() {
  const { user } = useAuth();
  const { logout } = useFirebaseAuth();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 shadow">
      <Link to="/feed" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">
          D
        </div>
        <span className="font-bold text-lg">SB</span>
      </Link>

      <nav className="flex items-center gap-4">
        <Link to="/feed" className="hover:text-purple-400">
          Home
        </Link>
        <Link to="/profile/me" className="hover:text-purple-400">
          Profile
        </Link>
        {user ? (
          <button
            onClick={() => logout()}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
