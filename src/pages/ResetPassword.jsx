import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      // Configure action code settings for better email deliverability
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage("Password reset email sent! Check your inbox for instructions.");
      // Clear the email field after successful send
      setEmail("");
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFBF6]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
          <img src="/assets/headerlogo.png" alt="mygrassroutes logo" className="h-10" />
        </Link>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mt-16 mx-4 md:mx-0">
        <h1 className="text-xl md:text-2xl font-bold text-[#F9A825] mb-6 text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          {message && <div className="text-green-500 text-sm mb-4">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F9A825] w-full text-white py-3 rounded-md font-bold hover:bg-[#c2871c] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link to="/login" className="text-[#F9A825] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}