import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";
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
      // Check what sign-in methods are available for this email
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      // If email exists but only with Google OAuth, prevent password login
      if (signInMethods.length > 0 && !signInMethods.includes("password")) {
        if (signInMethods.includes("google.com")) {
          setError("This email is registered with Google. Please use 'Login with Google' instead.");
          return;
        }
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified - show warning but allow login
      if (!user.emailVerified) {
        setMessage("Please verify your email address. Check your inbox for the verification email.");
      }
      
      // Successfully logged in
      navigate("/pathway");
    } catch (err) {
      // Show error message for invalid credential errors
      if (err.code === "auth/invalid-credential" || 
          err.code === "auth/wrong-password" || 
          err.code === "auth/user-not-found") {
        setError("Incorrect username or password");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message);
      }
    }
  };


  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // After successful Google login, check if this email was originally registered with password
      // If so, this means they're trying to use the wrong login method
      const signInMethods = await fetchSignInMethodsForEmail(auth, userEmail);
      
      // Check the user's provider data to see what providers are linked
      // If password provider exists but user just logged in with Google,
      // it means they had a password account - we need to sign them out and show error
      const hasPasswordProvider = signInMethods.includes("password");
      
      if (hasPasswordProvider) {
        // User has password provider but logged in with Google
        // Sign them out and show error
        await auth.signOut();
        setError("This email is registered with email/password. Please use the email and password login instead.");
        return;
      }
      
      navigate("/pathway");
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        setError("This email is already registered with email/password. Please use the email and password login instead.");
      } else if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup, don't show error
        return;
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition">
          <img src="/assets/headerlogo.png" alt="mygrassroutes logo" className="h-10" />
        </Link>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mt-16 mx-4 md:mx-0">
        <h1 className="text-xl md:text-2xl font-bold text-emerald-700 mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 text-right">
              <Link 
                to="/reset-password" 
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">
              <div>{error}</div>
              {error === "Incorrect username or password" && (
                <div className="mt-1">
                  If you don't have an account,{" "}
                  <Link to="/signup" className="text-emerald-600 hover:underline font-semibold">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
          {message && <div className="text-green-500 text-sm mb-4">{message}</div>}

          <button
            type="submit"
            className="bg-emerald-600 w-full text-white py-3 rounded-md font-bold hover:bg-emerald-500 transition"
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
          Don't have an account?{" "}
          <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
