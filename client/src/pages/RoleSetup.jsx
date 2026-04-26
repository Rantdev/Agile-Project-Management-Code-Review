import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

const RoleSetup = () => {
  const navigate = useNavigate();
  const { user, completeRoleSetup, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
    if (user?.role && user.role !== "member") navigate("/dashboard");
  }, [user]);

  const roles = ["UI Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Tester", "DevOps", "Product Owner", "Scrum Master", "Designer"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) { toast.error("Please select a role"); return; }
    setLoading(true);
    const success = await completeRoleSetup({ role: selectedRole, department, skills: skills.map(s => ({ name: s, level: "Intermediate" })) });
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required><option value="">Select Role</option>{roles.map(r => <option key={r}>{r}</option>)}</select>
          <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <div><div className="flex gap-2"><input type="text" placeholder="Skill" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" /><button type="button" onClick={() => { if (currentSkill.trim()) setSkills([...skills, currentSkill.trim()]); setCurrentSkill(""); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button></div><div className="flex flex-wrap gap-2 mt-3">{skills.map((s, i) => <span key={i} className="px-3 py-1 bg-blue-100 rounded-full">{s}<button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="ml-2 text-red-500">×</button></span>)}</div></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg">{loading ? "Saving..." : "Complete Setup"}</button>
        </form>
      </div>
    </div>
  );
};

export default RoleSetup;