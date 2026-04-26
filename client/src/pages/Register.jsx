import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { alert("Passwords don't match"); return; }
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) result.needsRoleSetup ? navigate("/role-setup") : navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><FiUserPlus className="text-white text-3xl" /></div><h1 className="text-3xl font-bold text-gray-800">Create Account</h1></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative"><FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required disabled={loading} /></div>
          <div className="relative"><FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 border rounded-lg" required disabled={loading} /></div>
          <div className="relative"><FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type={showPassword ? "text" : "password"} placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-10 py-3 border rounded-lg" required disabled={loading} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
          <div className="relative"><FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full pl-10 pr-10 py-3 border rounded-lg" required disabled={loading} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2">{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="text-center text-gray-600 mt-6">Already have an account? <Link to="/" className="text-blue-600 font-semibold">Sign In</Link></p>
      </div>
    </div>
  );
};

export default Register;