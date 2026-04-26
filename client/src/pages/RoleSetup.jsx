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
    // Check if user already has a role
    if (user?.role && user.role !== "member") {
      navigate("/dashboard");
    }
    
    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [user, navigate]);

  const roles = [
    "UI Developer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Tester", "DevOps", "Product Owner",
    "Scrum Master", "Designer", "Project Manager"
  ];

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      console.log("Setting up role with token:", token ? "Present" : "Missing");
      
      const response = await api.post("/profile/setup-role", {
        role: selectedRole,
        department: department,
        skills: skills.map(s => ({ name: s, level: "Intermediate" }))
      });
      
      console.log("Setup response:", response.data);
      
      if (response.data.success) {
        toast.success("Profile setup complete!");
        
        // Update user in localStorage
        const updatedUser = { ...user, role: selectedRole, department };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        toast.error(response.data.error || "Setup failed");
      }
    } catch (error) {
      console.error("Role setup error:", error);
      const errorMsg = error.response?.data?.error || "Setup failed. Please try again.";
      toast.error(errorMsg);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        logout();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const skipForNow = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">Tell us about your role and skills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Engineering, Product, Design"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills & Technologies
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentSkill}
 onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="e.g., React, Node.js, Python"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={skipForNow}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleSetup;