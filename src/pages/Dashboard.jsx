import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import { useUserProgress } from "../hooks/useUserProgress";

export default function Dashboard() {
  const { user } = useAuth();
  const { completedLessons, getProgressStats } = useUserProgress();
  const [message, setMessage] = useState("");
  const [progressStats, setProgressStats] = useState({ totalCompleted: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setProgressStats(getProgressStats());
  }, [completedLessons]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/?loggedOut=true");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleResendVerification = async () => {
    if (!user || user.emailVerified) return;
    
    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent! Please check your inbox.");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("Error sending verification email. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF6]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
            <img src="/assets/headerlogo.png" alt="mygrassroutes logo" className="h-10" />
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#F9A825] mb-6">Your Profile</h1>

          {/* Email verification banner */}
          {user && !user.emailVerified && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 mb-2">
                Please verify your email address to unlock all features.
              </p>
              {message ? (
                <p className="text-green-600 text-sm">{message}</p>
              ) : (
                <button
                  onClick={handleResendVerification}
                  className="text-yellow-800 hover:underline text-sm font-semibold"
                >
                  Resend verification email →
                </button>
              )}
            </div>
          )}
          
          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#F9A825] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.displayName || "User"}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  {user.emailVerified && (
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      ✓ Email Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>User ID:</strong> {user.uid}</p>
                  <p><strong>Account Created:</strong> {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Last Sign In:</strong> {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-800">Lessons Completed</span>
                    <span className="text-2xl font-bold text-emerald-700">{progressStats.totalCompleted}</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Keep learning to unlock more content!
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/pathway"
                    className="inline-block px-4 py-2 bg-[#F9A825] text-white rounded-lg hover:bg-[#c2871c] transition cursor-pointer"
                  >
                    View The Tree
                  </Link>
                  <Link
                    to="/about"
                    className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

