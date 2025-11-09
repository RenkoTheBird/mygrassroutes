import { Link } from "react-router-dom";
import { useAuth } from "../pages/AuthProvider";

export default function HeaderActions() {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        <Link
          to="/dashboard"
          className="hidden md:inline-flex items-center justify-center bg-white text-emerald-700 border border-emerald-700 px-6 py-2 rounded hover:bg-emerald-50 transition font-medium"
        >
          Profile
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        to="/login"
        className="hidden md:inline-flex items-center justify-center bg-white text-emerald-700 border border-emerald-700 px-3 py-2 rounded hover:bg-emerald-50 transition"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="hidden md:inline-flex items-center justify-center bg-emerald-600 text-white px-3 py-2 rounded hover:bg-emerald-700 transition"
      >
        Sign Up
      </Link>
    </>
  );
}

