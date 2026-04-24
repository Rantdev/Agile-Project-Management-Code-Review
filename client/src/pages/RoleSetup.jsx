import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FiUserCheck, FiCode, FiDatabase, FiLayout, FiShield, FiCloud, 
  FiSmartphone, FiServer, FiPenTool, FiTrendingUp, FiUsers
} from "react-icons/fi";

const RoleSetup = () => {
  const navigate = useNavigate();
  const { user, completeRoleSetup, needsRoleSetup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState({
    department: "",
    skills: []
  });
  const [currentSkill, setCurrentSkill] = useState({ name: "", level: "Intermediate" });

  // Redirect if role already set
  useEffect(() => {
    if (user && !needsRoleSetup) {
      navigate("/dashboard");
    }
  }, [user, needsRoleSetup, navigate]);

  const roles = [
    { value: "UI Developer", icon: FiLayout, color: "purple", bgColor: "bg-purple-50", borderColor: "border-purple-500", textColor: "text-purple-600", description: "Design user interfaces and experiences" },
    { value: "Frontend Developer", icon: FiCode, color: "blue", bgColor: "bg-blue-50", borderColor: "border-blue-500", textColor: "text-blue-600", description: "Build React/Vue/Angular applications" },
    { value: "Backend Developer", icon: FiServer, color: "green", bgColor: "bg-green-50", borderColor: "border-green-500", textColor: "text-green-600", description: "Develop APIs and databases" },
    { value: "Full Stack Developer", icon: FiDatabase, color: "indigo", bgColor: "bg-indigo-50", borderColor: "border-indigo-500", textColor: "text-indigo-600", description: "Work on frontend and backend" },
    { value: "Tester", icon: FiShield, color: "orange", bgColor: "bg-orange-50", borderColor: "border-orange-500", textColor: "text-orange-600", description: "Quality assurance and testing" },
    { value: "DevOps", icon: FiCloud, color: "cyan", bgColor: "bg-cyan-50", borderColor: "border-cyan-500", textColor: "text-cyan-600", description: "CI/CD and infrastructure" },
    { value: "Product Owner", icon: FiTrendingUp, color: "pink", bgColor: "bg-pink-50", borderColor: "border-pink-500", textColor: "text-pink-600", description: "Product management and backlog" },
    { value: "Scrum Master", icon: FiUsers, color: "red", bgColor: "bg-red-50", borderColor: "border-red-500", textColor: "text-red-600", description: "Agile methodology facilitator" },
    { value: "Designer", icon: FiPenTool, color: "yellow", bgColor: "bg-yellow-50", borderColor: "border-yellow-500", textColor: "text-yellow-600", description: "UI/UX design and prototyping" },
    { value: "Mobile Developer", icon: FiSmartphone, color: "teal", bgColor: "bg-teal-50", borderColor: "border-teal-500", textColor: "text-teal-600", description: "iOS/Android app development" }
  ];

  const departments = [
    "Engineering", "Product", "Design", "Quality Assurance", 
    "DevOps", "Management", "Sales", "Marketing", "Customer Success"
  ];

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const addSkill = () => {
    if (currentSkill.name.trim()) {
      setForm({
        ...form,
        skills: [...form.skills, { ...currentSkill }]
      });
      setCurrentSkill({ name: "", level: "Intermediate" });
    }
  };

  const removeSkill = (index) => {
    setForm({
      ...form,
      skills: form.skills.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    setLoading(true);
    const success = await completeRoleSetup({
      role: selectedRole,
      department: form.department,
      skills: form.skills
    });
    setLoading(false);
    
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FiUserCheck className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to AgileFlow!</h1>
          <p className="text-gray-500 mt-2">Tell us about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              What is your role? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `${role.bgColor} ${role.borderColor} shadow-md transform scale-[1.02]`
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? role.bgColor : "bg-gray-100"}`}>
                        <Icon className={`text-2xl ${isSelected ? role.textColor : "text-gray-500"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isSelected ? role.textColor : "text-gray-800"}`}>
                          {role.value}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </div>
                      {isSelected && (
                        <div className="text-green-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Skills & Technologies
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentSkill.name}
                onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                placeholder="e.g., React, Node.js, Python"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <select
                value={currentSkill.level}
                onChange={(e) => setCurrentSkill({ ...currentSkill, level: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add
              </button>
            </div>
            
            {/* Skills List */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.name} ({skill.level})
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Selected Role Summary */}
          {selectedRole && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Selected Role:</strong> {selectedRole}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedRole}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Setting up...
              </div>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleSetup;