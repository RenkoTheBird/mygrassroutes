import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { signOut, sendEmailVerification, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import { useUserProgress } from "../hooks/useUserProgress";

export default function Dashboard() {
  const { user } = useAuth();
  const { completedLessons, getProgressStats, loading: userProgressLoading } = useUserProgress();
  const [message, setMessage] = useState("");
  const [progressStats, setProgressStats] = useState({ totalCompleted: 0 });
  const navigate = useNavigate();
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

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
      // Configure action code settings for better email deliverability
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      setMessage("Verification email sent! Please check your inbox.");
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage("Error sending verification email. Please try again later.");
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    
    if (!user) return;
    
    if (!newEmail || !newEmail.trim()) {
      setEmailError("Please enter a new email address.");
      return;
    }
    
    if (newEmail === user.email) {
      setEmailError("New email must be different from current email.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    
    // Password is always required for email changes
    if (!password || !password.trim()) {
      setEmailError("Please enter your current password to change your email.");
      return;
    }
    
    try {
      // Configure action code settings for the verification email
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      // Always re-authenticate user with password before changing email
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Send verification email to the new email address
      await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
      
      // Verification email sent successfully
      setMessage(`Please verify the new email. A verification email has been sent to ${newEmail}. Click the link in the email to complete the email change. You will be logged out once verification is complete.`);
      setNewEmail("");
      setPassword("");
      setIsChangingEmail(false);
      setTimeout(() => setMessage(""), 12000);
    } catch (error) {
      console.error("Error changing email:", error);
      if (error.code === "auth/email-already-in-use") {
        setEmailError("This email is already in use by another account.");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Invalid email address.");
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setEmailError("Incorrect password. Please try again.");
      } else if (error.code === "auth/weak-password") {
        setEmailError("Password is too weak.");
      } else if (error.code === "auth/operation-not-allowed") {
        setEmailError("Email change is not allowed. Please verify the new email before changing.");
      } else {
        setEmailError(error.message || "Failed to send verification email. Please try again.");
      }
    }
  };

  const cancelEmailChange = () => {
    setIsChangingEmail(false);
    setNewEmail("");
    setPassword("");
    setEmailError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          {userProgressLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          ) : (
            <>
          <h1 className="text-3xl font-bold text-emerald-700 mb-6">Your Profile</h1>

          {/* Email verification banner */}
          {user && !user.emailVerified && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 mb-2">
                Please verify your email address to unlock all features.
              </p>
              {message && message.includes("Verification email sent!") && !message.includes("Please verify the new email") ? (
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

          {/* Success message banner for email change */}
          {message && message.includes("Please verify the new email") && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}
          
          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
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
                <div className="space-y-4">
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center justify-between">
                      <p><strong>Email:</strong> {user.email}</p>
                      {!isChangingEmail && (
                        <button
                          onClick={() => setIsChangingEmail(true)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Change Email
                        </button>
                      )}
                    </div>
                    <p><strong>User ID:</strong> {user.uid}</p>
                    <p><strong>Account Created:</strong> {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Last Sign In:</strong> {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}</p>
                  </div>
                  
                  {isChangingEmail && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold mb-3">Change Email Address</h4>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">For security, your current password is required to change your email address. You will also need to verify your new email.</p>
                      </div>
                      <form onSubmit={handleChangeEmail} className="space-y-3">
                        <div>
                          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            New Email Address
                          </label>
                          <input
                            type="email"
                            id="newEmail"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter new email address"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter your current password"
                            required
                          />
                        </div>
                        {emailError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{emailError}</p>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-medium"
                          >
                            Update Email
                          </button>
                          <button
                            type="button"
                            onClick={cancelEmailChange}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
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
                    className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition cursor-pointer"
                  >
                    View The Pathway
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

