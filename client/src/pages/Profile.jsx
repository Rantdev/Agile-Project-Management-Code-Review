import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiCode, FiPlus, FiTrash2 } from "react-icons/fi";

const Profile = () => {
  const { userId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState("");
  const [updating, setUpdating] = useState(false);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, user]);

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
      if (error.response?.status === 401) {
        logout();
        navigate("/");
      } else {
        toast.error(error.response?.data?.error || "Failed to load profile");
      }
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
        skills: form.skills || []
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

  const addSkill = () => {
    if (newSkill.trim() && !form.skills?.some(s => s.name === newSkill.trim())) {
      const newSkillObj = { name: newSkill.trim(), level: "Intermediate" };
      setForm({ ...form, skills: [...(form.skills || []), newSkillObj] });
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: updatedSkills });
  };

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
                    {editing ? (
                      <input
                        type="text"
                        value={form.name || ""}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border rounded px-2 py-1 text-xl font-bold"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                    )}
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 bg-blue-100 text-blue-800">
                      {profile.role || "Team Member"}
                    </span>
                  </div>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
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
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiSave /> {updating ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCode /> Skills & Expertise
              </h2>
              
              {editing && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Skill name (e.g., React)"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
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