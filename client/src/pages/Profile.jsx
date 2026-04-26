import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, 
  FiEdit2, FiSave, FiX, FiCode, FiPlus, FiTrash2, FiBriefcase, 
  FiGlobe, FiTwitter, FiInstagram, FiAward, FiCalendar
} from "react-icons/fi";

const Profile = () => {
  const { userId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (targetUserId) fetchProfile();
  }, [targetUserId, user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${targetUserId}`);
      if (res.data.success) {
        setProfile(res.data.profile);
        setForm({ ...res.data.profile, skills: res.data.profile.skills || [] });
      }
    } catch (error) {
      if (error.response?.status === 401) logout();
      else toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/profile/${targetUserId}`, {
        name: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        github: form.github,
        linkedin: form.linkedin,
        skills: form.skills || []
      });
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setForm({
        ...form,
        skills: [...(form.skills || []), { name: newSkill.trim(), level: newSkillLevel }]
      });
      setNewSkill("");
      setNewSkillLevel("Intermediate");
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: updatedSkills });
  };

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

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
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <FiUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <button onClick={() => navigate("/dashboard")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 bg-gray-50">
        <div className="p-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="pt-16 pb-6 px-8">
              <div className="flex justify-between items-start">
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={form.name || ""}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="text-2xl font-bold border rounded-lg px-3 py-1 mb-2"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                  )}
                  <div className="flex gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {profile.role || "Team Member"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                      <FiCalendar size={12} /> Member since {new Date(profile.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setForm(profile); }} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                      <FiX /> Cancel
                    </button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                      <FiSave /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-500" /> Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
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
                  <div className="flex items-center gap-3 text-gray-600">
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
                  <div className="flex items-center gap-3 text-gray-600">
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

            {/* Bio Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiGlobe className="text-green-500" /> About
              </h2>
              {editing ? (
                <textarea
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="5"
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{profile.bio || "No bio added yet"}</p>
              )}

              {/* Stats */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiAward className="text-yellow-500" /> Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{profile.stats?.projects || 0}</p>
                    <p className="text-xs text-gray-500">Projects</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{profile.stats?.tasks || 0}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCode className="text-purple-500" /> Skills & Expertise
              </h2>
              
              {editing && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Skill name"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {skillLevels.map(level => <option key={level}>{level}</option>)}
                    </select>
                    <button onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <FiPlus />
                    </button>
                  </div>
                </div>
              )}

              {form.skills && form.skills.length > 0 ? (
                <div className="space-y-2">
                  {form.skills.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-800">{skill.name}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          skill.level === "Expert" ? "bg-purple-100 text-purple-700" :
                          skill.level === "Advanced" ? "bg-blue-100 text-blue-700" :
                          skill.level === "Intermediate" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {skill.level}
                        </span>
                      </div>
                      {editing && (
                        <button onClick={() => removeSkill(idx)} className="text-red-500 hover:text-red-700">
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