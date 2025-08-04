import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      // If no user document exists, treat as normal user with no role
      toast.success("Welcome!");
      navigate("/userdashboard");
      return;
    }

    const userData = userDoc.data();
    const role = userData.role;

    // If no role field exists, treat as a regular user
    if (!role) {
      toast.success("Welcome!");
      navigate("/userdashboard");
      return;
    }

    toast.success(`Welcome ${role}!`);

    // Redirect based on role
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "volunteer":
        navigate("/teamdashboard");
        break;
      default:
        navigate("/userdashboard");
        break;
    }
  } catch (err) {
    console.error(err.message);
    setError("Invalid email or password.");
    toast.error("Login failed.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-50 overflow-auto">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-orange-600 mb-6">
          Login to <span className="text-orange-500">Vinayaka Org</span>
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              autoFocus
              placeholder="example@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-lg transition-all ${
              loading ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
        <p className="mt-4 text-sm text-center">
          
          <Link
            to="/userdashboard"
            className="text-orange-600 font-semibold hover:underline"
          >
            Skip 
          </Link>
           {" "}for now.{" "}
        </p>
      </div>
    </div>
  );
}
