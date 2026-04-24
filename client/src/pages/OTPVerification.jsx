import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiLock, FiRefreshCw, FiArrowLeft, FiShield } from "react-icons/fi";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const email = location.state?.email || "";
  const password = location.state?.password || "";
  const isNewUser = location.state?.isNewUser || false;

  useEffect(() => {
    if (!email) {
      navigate("/");
      return;
    }
    startTimer();
  }, [email]);

  const startTimer = () => {
    setTimer(600);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const res = await api.post("/otp/verify", { email, otpCode });
      
      if (res.data.success) {
        toast.success("Email verified successfully!");
        
        // Login after verification
        const loginRes = await api.post("/auth/login", { email, password });
        
        if (loginRes.data.success) {
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));
          localStorage.setItem("userId", loginRes.data.user.id);
          
          // Check if role setup is needed
          const roleCheck = await api.get("/auth/check-role-setup", {
            headers: { Authorization: `Bearer ${loginRes.data.token}` }
          });
          
          if (roleCheck.data.needsRoleSetup) {
            toast.success("Please complete your profile setup");
            navigate("/role-setup");
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) {
      toast.error(`Please wait ${formatTime(timer)} before requesting again`);
      return;
    }

    setResendLoading(true);
    try {
      const res = await api.post("/otp/resend", { email });
      if (res.data.success) {
        toast.success("OTP resent successfully!");
        startTimer();
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
          <p className="text-gray-500 mt-2">
            Enter the verification code sent to
            <br />
            <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-10 pr-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="000000"
                maxLength="6"
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-gray-500">
                Time remaining: <span className="font-semibold text-blue-600">{formatTime(timer)}</span>
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || timer > 0}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <FiRefreshCw className={resendLoading ? "animate-spin" : ""} />
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </div>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-gray-600 hover:text-gray-800 transition flex items-center justify-center gap-2"
          >
            <FiArrowLeft /> Back to Login
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Check your email for the verification code. 
            If you don't see it, check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;