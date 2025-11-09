import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified - show warning but allow login
      if (!user.emailVerified) {
        setMessage("Please verify your email address. Check your inbox for the verification email.");
      }
      
      // Successfully logged in
      navigate("/");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message);
      }
    }
  };


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
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
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mt-16 mx-4 md:mx-0">
        <h1 className="text-xl md:text-2xl font-bold text-[#F9A825] mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          {message && <div className="text-green-500 text-sm mb-4">{message}</div>}

          <button
            type="submit"
            className="bg-[#F9A825] w-full text-white py-3 rounded-md font-bold hover:bg-[#c2871c] transition"
          >
            Login
          </button>
        </form>


        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center bg-[#DB4437] w-full text-white py-3 rounded-md font-bold mt-4 hover:bg-red-700 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 mr-2"
          />
          Login with Google
        </button>

        {/* ✅ Footer link */}
        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#F9A825] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
