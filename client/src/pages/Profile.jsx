import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, 
  FiEdit2, FiSave, FiX, FiCode, FiAward, FiBriefcase, FiPlus
} from "react-icons/fi";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" });
  const [availableRoles] = useState([
    "UI Developer", "Frontend Developer", "Backend Developer", 
    "Full Stack Developer", "Tester", "DevOps", "Product Owner", 
    "Scrum Master", "Designer", "Project Manager"
  ]);
  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${targetUserId}`);
      if (res.data.success) {
        setProfile(res.data.profile);
        setForm(res.data.profile);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await api.put(`/profile/${targetUserId}`, form);
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) {
      toast.error("Please enter a skill name");
      return;
    }

    try {
      const res = await api.post(`/profile/${targetUserId}/skills`, newSkill);
      if (res.data.success) {
        toast.success("Skill added");
        setNewSkill({ name: "", level: "Intermediate" });
        fetchProfile();
      }
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  const removeSkill = async (skillId) => {
    try {
      await api.delete(`/profile/${targetUserId}/skills/${skillId}`);
      toast.success("Skill removed");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  const updateRole = async (newRole) => {
    try {
      await api.put(`/profile/${targetUserId}`, { role: newRole });
      toast.success("Role updated");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const isOwnProfile = !userId || userId == user?.id;

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-end -mt-12">
                  <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                    {isOwnProfile && editing ? (
                      <select
                        value={form.role || ""}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="mt-1 px-3 py-1 border rounded-lg text-sm"
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 bg-blue-100 text-blue-800">
                        {profile.role || "Team Member"}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnProfile && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                )}
                {editing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setForm(profile);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FiSave /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                {editing ? (
                  <input
                    type="tel"
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : profile.phone && (
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {editing ? (
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Location"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : profile.location && (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {(profile.department || editing) && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2">Department</h3>
                  {editing ? (
                    <input
                      type="text"
                      value={form.department || ""}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="Department"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-600">{profile.department}</p>
                  )}
                </div>
              )}
            </div>

            {/* Bio & Social */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About</h2>
              {editing ? (
                <textarea
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="text-gray-600">{profile.bio || "No bio added yet"}</p>
              )}

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">Social Links</h3>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.github || ""}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                      placeholder="GitHub URL"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={form.linkedin || ""}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="LinkedIn URL"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FiGithub /> GitHub
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FiLinkedin /> LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCode /> Skills & Expertise
              </h2>
              
              {/* Add Skill (only for own profile) */}
              {isOwnProfile && (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="New skill (e.g., React)"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {skillLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <button
                    onClick={addSkill}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus />
                  </button>
                </div>
              )}

              {/* Skills List */}
              {profile.skills && profile.skills.length > 0 ? (
                <div className="space-y-2">
                  {profile.skills.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{skill.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({skill.level})</span>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;