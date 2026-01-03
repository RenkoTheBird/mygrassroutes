import { Link } from "react-router-dom";
import { useAuth } from "../pages/AuthProvider";
import { User } from "lucide-react";

export default function HeaderActions() {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        <Link
          to="/pathway"
          className="hidden md:inline-flex items-center justify-center bg-white text-emerald-500 border border-emerald-500 px-6 py-2.5 rounded hover:bg-emerald-50 transition font-medium"
        >
          Pathway
        </Link>
        <Link
          to="/dashboard"
          className="hidden md:inline-flex items-center justify-center p-2 rounded hover:bg-emerald-400/30 transition"
          title="Profile"
        >
          <User size={20} />
        </Link>
        {/* Mobile versions */}
        <Link
          to="/pathway"
          className="md:hidden block px-3 py-2 rounded hover:bg-emerald-500 text-white font-medium"
        >
          Pathway
        </Link>
        <Link
          to="/dashboard"
          className="md:hidden block px-3 py-2 rounded hover:bg-emerald-500 text-white"
          title="Profile"
        >
          Dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      {/* Desktop versions */}
      <Link
        to="/login"
        className="hidden md:inline-flex items-center justify-center bg-white text-emerald-500 border border-emerald-500 px-3 py-2 rounded hover:bg-emerald-50 transition"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="hidden md:inline-flex items-center justify-center bg-emerald-500 text-white px-3 py-2 rounded hover:bg-emerald-400 transition"
      >
        Sign Up
      </Link>
      {/* Mobile versions */}
      <Link
        to="/login"
        className="md:hidden block px-3 py-2 rounded hover:bg-emerald-500 text-white border border-white/30"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="md:hidden block px-3 py-2 rounded bg-white/20 hover:bg-white/30 text-white font-medium mt-1"
      >
        Sign Up
      </Link>
    </>
  );
}

