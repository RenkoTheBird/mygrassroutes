import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(userCredential.user, { displayName: username });
      
      // Send email verification with action code settings
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      // Show success message
      setSuccess("Account created! Please check your email to verify your account.");
      
      // Wait a bit before navigating to show the message
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFBF6]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
          <img src="/assets/headerlogo.png" alt="mygrassroutes logo" className="h-10" />
        </Link>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md w-full max-w-md mt-16 mx-4 md:mx-0">
        <h1 className="text-xl md:text-2xl font-semibold text-[#F9A825] text-center mb-6 font-[Poppins]">
          Sign Up
        </h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4"
              />
              <span>Show Password</span>
            </label>
          </div>

          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}

          <button
            type="submit"
            className="w-full bg-[#F9A825] text-white py-3 rounded-lg font-bold hover:bg-[#c2871c] transition"
          >
            Sign Up
          </button>
        </form>

        {/*Google Button*/}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center bg-[#DB4437] text-white py-3 rounded-lg font-bold mt-4 hover:bg-red-700 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5 mr-2"
          />
          Sign up with Google
        </button>

        {/*"Already have an account"*/}
        <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
            <Link to="/login" className="text-[#F9A825] font-semibold hover:underline">
                Login
            </Link>
        </p>
      </div>
    </div>
  );
}
