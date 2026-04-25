import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

const RoleSetup = () => {
  const navigate = useNavigate();
  const { user, completeRoleSetup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    if (user?.role && user.role !== "member") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const roles = ["UI Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Tester", "DevOps", "Product Owner", "Scrum Master", "Designer"];

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    const success = await completeRoleSetup({
      role: selectedRole,
      department,
      skills: skills.map(s => ({ name: s, level: "Intermediate" }))
    });
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Your Role *</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
              <option value="">Select a role</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Engineering" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex gap-2">
              <input type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} placeholder="e.g., React" className="flex-1 px-4 py-2 border rounded-lg" onKeyPress={(e) => e.key === 'Enter' && addSkill()} />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                  <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-2 text-blue-600">×</button>
                </span>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSetup;