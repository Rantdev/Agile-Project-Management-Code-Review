import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    if (!form.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    const success = await login(form.email, form.password);
    setLoading(false);
    
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Success:", credentialResponse);
    
    setLoading(true);
    try {
      // Send the Google credential token to backend
      const res = await api.post("/auth/google", {
        token: credentialResponse.credential
      });
      
      console.log("Backend response:", res.data);
      
      if (res.data.success) {
        // Store token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userId", res.data.user.id);
        
        // Set default auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        toast.success("Google login successful!");
        
        // Check if user needs role setup
        try {
          const roleCheck = await api.get("/auth/check-role-setup", {
            headers: { Authorization: `Bearer ${res.data.token}` }
          });
          
          console.log("Role check response:", roleCheck.data);
          
          if (roleCheck.data.needsRoleSetup) {
            navigate("/role-setup");
          } else {
            navigate("/dashboard");
          }
        } catch (roleError) {
          console.error("Role check failed:", roleError);
          navigate("/dashboard");
        }
      } else {
        toast.error(res.data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.response?.data?.error || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    toast.error("Google login failed. Please try again.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiLogIn className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue to AgileFlow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
                disabled={loading || authLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
                disabled={loading || authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || authLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;