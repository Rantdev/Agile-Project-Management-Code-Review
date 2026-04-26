import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, 
  FiEdit2, FiSave, FiX, FiCode, FiBriefcase, FiPlus, FiTrash2
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
  const [updating, setUpdating] = useState(false);

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
      setLoading(true);
      console.log("Fetching profile for user:", targetUserId);
      const res = await api.get(`/profile/${targetUserId}`);
      
      if (res.data.success) {
        setProfile(res.data.profile);
        setForm(res.data.profile);
      } else {
        toast.error(res.data.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/profile/${targetUserId}`, {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        github: form.github,
        linkedin: form.linkedin,
        skills: form.skills
      });
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) {
      toast.error("Please enter a skill name");
      return;
    }

    try {
      const updatedSkills = [...(form.skills || []), { ...newSkill }];
      setForm({ ...form, skills: updatedSkills });
      setNewSkill({ name: "", level: "Intermediate" });
      toast.success("Skill added");
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: updatedSkills });
    toast.success("Skill removed");
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-500 mb-4">Unable to load profile information</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleColors = {
    "UI Developer": "bg-purple-100 text-purple-800",
    "Frontend Developer": "bg-blue-100 text-blue-800",
    "Backend Developer": "bg-green-100 text-green-800",
    "Full Stack Developer": "bg-indigo-100 text-indigo-800",
    "Tester": "bg-orange-100 text-orange-800",
    "DevOps": "bg-cyan-100 text-cyan-800",
    "Product Owner": "bg-pink-100 text-pink-800",
    "Scrum Master": "bg-red-100 text-red-800",
    "Designer": "bg-yellow-100 text-yellow-800"
  };

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
                  <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {editing ? (
                        <input
                          type="text"
                          value={form.name || ""}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="border rounded px-2 py-1 text-xl"
                        />
                      ) : (
                        profile.name
                      )}
                    </h1>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${roleColors[profile.role] || "bg-gray-100 text-gray-800"}`}>
                      {profile.role || "Team Member"}
                    </span>
                  </div>
                </div>
                {isOwnProfile && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <FiSave /> {updating ? "Saving..." : "Save"}
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
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone || ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone number"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                ) : profile.phone && (
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {editing ? (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" />
                    <input
                      type="text"
                      value={form.location || ""}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Location"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                  </div>
                ) : profile.location && (
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {(profile.department || editing) && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FiBriefcase /> Department
                  </h3>
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

              {/* Social Links */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">Social Links</h3>
                {editing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiGithub className="text-gray-400" />
                      <input
                        type="text"
                        value={form.github || ""}
                        onChange={(e) => setForm({ ...form, github: e.target.value })}
                        placeholder="GitHub URL"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FiLinkedin className="text-gray-400" />
                      <input
                        type="text"
                        value={form.linkedin || ""}
                        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                        placeholder="LinkedIn URL"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
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

            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About</h2>
              {editing ? (
                <textarea
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              ) : (
                <p className="text-gray-600">{profile.bio || "No bio added yet"}</p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCode /> Skills & Expertise
              </h2>
              
              {editing && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="Skill name (e.g., React)"
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
                </div>
              )}

              {form.skills && form.skills.length > 0 ? (
                <div className="space-y-2">
                  {form.skills.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{skill.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({skill.level})</span>
                      </div>
                      {editing && (
                        <button
                          onClick={() => removeSkill(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
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